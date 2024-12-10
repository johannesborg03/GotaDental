const amqp = require('amqplib');

let channel; // To hold the RabbitMQ channel

// Connecting to RabbitMQ
async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect('amqp://localhost'); // RabbitMQ URL
        channel = await connection.createChannel();
        console.log('RabbitMQ Subscriber connected');
    } catch (error) {
        console.error('Error connecting to RabbitMQ in Subscriber:', error);
        throw error;
    }
}

// Subscribe to a topic
async function subscribeToTopic(topic, handler) {
    if (!channel) {
        console.error('RabbitMQ channel is not initialized in Subscriber.');
        return;
    }

    await channel.assertExchange(topic, 'fanout', { durable: false });
    const queue = await channel.assertQueue('', { exclusive: true });
    channel.bindQueue(queue.queue, topic, '');

    channel.consume(queue.queue, (msg) => {
        if (msg !== null) {
            const messageContent = JSON.parse(msg.content.toString());
            console.log(`Received message from topic "${topic}":`, messageContent);
            handler(messageContent, msg.properties.replyTo, msg.properties.correlationId, channel);
        }
    });

    console.log(`Subscribed to topic "${topic}"`);
}

// Ensure the functions are exported properly
module.exports = {
    connectRabbitMQ,    // Exports the connectRabbitMQ function
    subscribeToTopic,   // Exports the subscribeToTopic function
};
