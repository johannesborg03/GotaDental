// Publishes events to RabbitMQ

const amqp = require('amqplib');

let channel;
let isConnected = false;

//Connecting to RabbitMQ 
async function connectRabbitMQ() {
    if (isConnected) return; // Prevent multiple connections
    const connection = await amqp.connect('amqp://localhost');
    channel = await connection.createChannel();
    isConnected = true;
    console.log('RabbitMQ Publisher connected');
}

//Publish messages 
async function publishMessage(topic, message, correlationId) {
    if (!channel) {
        console.error('Channel is not initialized');
        throw new Error('MQTT channel is not initialized');
    }

    return new Promise(async (resolve, reject) => {
        console.log(`Publishing to topic: ${topic}`);
        console.log(`Message:`, message);
        console.log(`Correlation ID: ${correlationId}`);
        const timeout = setTimeout(() => {
            reject(new Error(`Timeout waiting for response on correlationId: ${correlationId}`));
        }, 10000); // 10-second timeout for the response

        try {
            // Create a temporary reply queue
            const replyQueue = await channel.assertQueue('', { exclusive: true });

            // Listen to the reply queue for responses
            const consumerTag = await channel.consume(
                replyQueue.queue,
                (msg) => {
                    if (msg.properties.correlationId === correlationId) {
                        const response = JSON.parse(msg.content.toString());
                        clearTimeout(timeout); // Clear the timeout
                        channel.cancel(consumerTag.consumerTag); // Stop consuming
                        resolve(response); // Resolve the promise with the response
                    }
                },
                { noAck: true }
            );

            // Publish the message to the specified topic
            await channel.assertExchange(topic, 'fanout', { durable: false });
            channel.publish(topic, '', Buffer.from(JSON.stringify(message)), {
                correlationId,
                replyTo: replyQueue.queue,
            });

            console.log(`Message published to topic "${topic}" with correlationId "${correlationId}"`);
        } catch (error) {
            clearTimeout(timeout); // Clear the timeout on error
            console.error('Error publishing message:', error);
            reject(new Error(`Failed to publish message: ${error.message}`));
        }
    });
}

async function subscribeToResponse(correlationId, timeout = 5000) {
    if (!channel) {
        throw new Error('RabbitMQ channel is not initialized. Ensure RabbitMQ is connected.');
    }

    // Assert a temporary queue for replies
    const { queue } = await channel.assertQueue('', { exclusive: true });

    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            channel.cancel(queue); // Stop consuming on timeout
            reject(new Error(`Timeout waiting for response with correlationId: ${correlationId}`));
        }, timeout);

        channel.consume(queue, (msg) => {
            if (msg.properties.correlationId === correlationId) {
                clearTimeout(timer); // Cancel timeout
                channel.cancel(queue); // Stop consuming
                resolve(JSON.parse(msg.content.toString())); // Resolve with the response
            }
        }, { noAck: true });
    });
}


// Connect RabbitMQ on module load
connectRabbitMQ();

module.exports = { publishMessage, subscribeToResponse };
