// Publishes events to RabbitMQ

const amqp = require('amqplib');

let channel;



// Connect to RabbitMQ and create the channel
async function connectRabbitMQ() {
    let retryCount = 0;
    const maxRetries = 5;
    const retryDelay = 5000; // Retry every 5 seconds

    async function attemptReconnect() {
        try {
            connection = await amqp.connect('amqp://localhost?heartbeat=60');
            connection.on('error', (err) => {
                console.error('Connection error:', err);
            });
            connection.on('close', () => {
                console.log('RabbitMQ connection closed');
                if (retryCount < maxRetries) {
                    console.log(`Reconnecting in ${retryDelay / 1000}s...`);
                    setTimeout(attemptReconnect, retryDelay);
                    retryCount++;
                } else {
                    console.log('Max retries reached. Exiting...');
                    process.exit(1);
                }
            });

            channel = await connection.createChannel();
            console.log('RabbitMQ Publisher connected');
            await channel.assertExchange('default_exchange', 'fanout', { durable: false });
        } catch (error) {
            console.error('Failed to connect to RabbitMQ:', error);
            if (retryCount < maxRetries) {
                console.log(`Retrying in ${retryDelay / 1000}s...`);
                setTimeout(attemptReconnect, retryDelay);
                retryCount++;
            } else {
                console.log('Max retries reached. Exiting...');
                process.exit(1);
            }
        }
    }

    attemptReconnect(); // Start the connection attempt
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
