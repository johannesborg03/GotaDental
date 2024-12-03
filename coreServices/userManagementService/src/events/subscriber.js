// Subscribes events from RabbitMQ

const amqp = require('amqplib');

let channel;


//Subscribe to topics
async function subscribeToTopic(topic, callback) {
    const connection = await amqp.connect('amqp://localhost');
   // console.log('Connection established');

    channel = await connection.createChannel();
   // console.log('Channel created');

    await channel.assertExchange(topic, 'fanout', { durable: false });
   // console.log(`Exchange "${topic}" asserted`);

    const queue = await channel.assertQueue('', { exclusive: true });
   // console.log(`Queue "${queue.queue}" asserted for "${topic}" `);

   // console.log(`Subscribed to topic "${topic}"`);

    channel.bindQueue(queue.queue, topic, '');
    console.log(`Queue "${queue.queue}" bound to topic "${topic}"`);

    channel.consume(queue.queue, (msg) => {
        const message = JSON.parse(msg.content.toString());
        const { replyTo, correlationId } = msg.properties;
        callback(message, replyTo, correlationId, channel);
    });
}

module.exports = { subscribeToTopic };