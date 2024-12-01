// Publishes events to RabbitMQ

const amqp = require('amqplib');

let channel;

//Connecting to RabbitMQ 
async function connectRabbitMQ() {
    const connection = await amqp.connect('amqp://localhost');
    channel = await connection.createChannel();
    console.log('RabbitMQ Publisher connected');
}

//Publish messages 
async function publishMessage(topic, message) {
    if (!channel) {
        console.error('Channel is not initialized');
        return;
    }
    const payload = Buffer.from(JSON.stringify(message));
    channel.assertExchange(topic, 'fanout', { durable: false });
    channel.publish(topic, '', payload);
    console.log(`Published message to topic "${topic}":`, message);
}

// Connect RabbitMQ on module load
connectRabbitMQ();

module.exports = { publishMessage };
