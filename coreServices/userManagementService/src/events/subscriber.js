// Subscribes events from RabbitMQ

const amqp = require('amqplib');

let channel;

//Subscribe to topics
//Subscribe to topics
async function subscribeToTopic(topic, callback) {
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

    channel.consume(queue.queue, (msg) => {
        const message = JSON.parse(msg.content.toString());
        const { replyTo, correlationId } = msg.properties;
        callback(message, replyTo, correlationId, channel);
    });
}

module.exports = { subscribeToTopic };