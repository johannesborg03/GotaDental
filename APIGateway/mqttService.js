const amqp = require('amqplib');

let channel;


async function connectRabbitMQ() {
    const connection = await amqp.connect('amqp://localhost');
    channel = await connection.createChannel();
    console.log('RabbitMQ connected');
}

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

module.exports = { connectRabbitMQ, publishMessage, subscribeToTopic };