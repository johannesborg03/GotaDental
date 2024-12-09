const amqp = require('amqplib');

let channel; // To hold the RabbitMQ channel

// Connecting to RabbitMQ
async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect('amqp://localhost'); // RabbitMQ URL
        channel = await connection.createChannel();
        console.log('RabbitMQ Publisher connected');
    } catch (error) {
        console.error('Error connecting to RabbitMQ in Publisher:', error);
        throw error;
    }
}

// Publish messages
async function publishMessage(topic, message) {
    if (!channel) {
        console.error('RabbitMQ channel is not initialized in Publisher.');
        return;
    }
    const payload = Buffer.from(JSON.stringify(message));
    channel.assertExchange(topic, 'fanout', { durable: false });
    channel.publish(topic, '', payload);
    console.log(`Published message to topic "${topic}":`, message);
}

// Ensure the functions are exported properly
module.exports = {
    connectRabbitMQ, // Exports the connectRabbitMQ function
    publishMessage,  // Exports the publishMessage function
};

