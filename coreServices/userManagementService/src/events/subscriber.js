// Subscribes events from RabbitMQ

const amqp = require('amqplib');

//Subscribe to topics
async function subscribeToTopic(topic, callback) {
    const connection = await amqp.connect('amqp://localhost');
    console.log('Connection established');

    const channel = await connection.createChannel();
    console.log('Channel created');


    await channel.assertExchange(topic, 'fanout', { durable: false });
    console.log(`Exchange "${topic}" asserted`);

    const queue = await channel.assertQueue('', { exclusive: true });
    console.log(`Queue "${queue.queue}" asserted`);

    console.log(`Subscribed to topic "${topic}"`);

    channel.bindQueue(queue.queue, topic, '');
    console.log(`Queue "${queue.queue}" bound to topic "${topic}"`);

    channel.consume(queue.queue, (msg) => {
        const rawMessage = msg.content.toString();
        console.log(`Raw message received: ${rawMessage}`); // Log raw message for debugging
    
        try {
            const message = JSON.parse(rawMessage);
            console.log(`Received message from topic "${topic}":`, message);
            callback(message);
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });
}

module.exports = { subscribeToTopic };