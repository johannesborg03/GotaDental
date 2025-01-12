// Subscribes events from RabbitMQ

const amqp = require('amqplib');

let channel;

//Subscribe to topics
async function subscribeToTopic(topic, callback) {
    try {
        const connection = await amqp.connect({
            protocol: 'amqp',
            hostname: 'rabbitmq',
            port: 5672,
            heartbeat: 10, // Heartbeat to keep connection alive
        });

        connection.on('error', (err) => {
            console.error('Connection error:', err);
        });

        connection.on('close', () => {
            console.log('RabbitMQ connection closed');
        });

        channel = await connection.createChannel();
        await channel.assertExchange(topic, 'fanout', { durable: false });
        const queue = await channel.assertQueue('', { exclusive: true });

        channel.bindQueue(queue.queue, topic, '');
        console.log(`Queue "${queue.queue}" bound to topic "${topic}"`);

        channel.consume(queue.queue, async (msg) => {
            if (!msg) {
                return;
            }

            try {
                const message = JSON.parse(msg.content.toString());
                const { replyTo, correlationId } = msg.properties;

                // Pass the message to the callback
                await callback(message, replyTo, correlationId, channel);

                // Acknowledge the message
                channel.ack(msg);
            } catch (error) {
                console.error('Error processing message:', error);

                // Reject the message without requeue
                channel.nack(msg, false, false);
            }
        }, { noAck: false }); // Ensure manual acknowledgment is enabled
    } catch (error) {
        console.error('Error subscribing to topic:', error);
    }
}

module.exports = { subscribeToTopic };