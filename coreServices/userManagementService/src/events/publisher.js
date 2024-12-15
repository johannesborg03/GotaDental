// Publishes events to RabbitMQ

const amqp = require('amqplib');

let channel;

//Connecting to RabbitMQ 
async function connectRabbitMQ() {
    const connection = await amqp.connect('amqp://localhost');
    channel = await connection.createChannel();
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


// Connect RabbitMQ on module load
connectRabbitMQ();

module.exports = { publishMessage };
