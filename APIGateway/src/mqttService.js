const amqp = require('amqplib');

let channel;
let connection;

async function connectRabbitMQ() {
    connection = await amqp.connect('amqp://localhost');
    channel = await connection.createChannel();
    console.log('RabbitMQ connected');
}

async function publishMessage(topic, message, correlationId) {
    if (!channel) {
        console.error('Channel is not initialized');
        return;
    }
    
    return new Promise(async (resolve, reject) => {
        const replyQueue = await channel.assertQueue('', { exclusive: true }); // Temporary reply queue

        channel.consume(
            replyQueue.queue,
            (msg) => {
                if (msg.properties.correlationId === correlationId) {
                    const response = JSON.parse(msg.content.toString());
                    resolve(response);
                }
            },
            { noAck: true }
        );

        // Publish the message to the topic
        channel.assertExchange(topic, 'fanout', { durable: false });
        channel.publish(topic, '', Buffer.from(JSON.stringify(message)), {
            correlationId,
            replyTo: replyQueue.queue,
        });

        console.log(`Message published to topic "${topic}" with correlationId "${correlationId}"`);
    });
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