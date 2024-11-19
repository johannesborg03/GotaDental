// Subscribes events from RabbitMQ

const amqp = require('amqplib');

//Subscribe to topics
async function subscribeToTopic(topic, callback) {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    await channel.assertExchange(topic, 'fanout', { durable: false });
    const queue = await channel.assertQueue('', { exclusive: true });
    console.log(`Subscribed to topic "${topic}"`);

    channel.bindQueue(queue.queue, topic, '');
    channel.consume(queue.queue, (msg) => {
        const message = JSON.parse(msg.content.toString());
        console.log(`Received message from topic "${topic}":`, message);
        callback(message);
    });
}

module.exports = { subscribeToTopic };