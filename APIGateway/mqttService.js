const amqp = require('amqplib');

let channel;

// Connecting to RabbitMQ
async function connectRabbitMQ() {
    const connection = await amqp.connect('amqp://localhost');
    channel = await connection.createChannel();
    console.log('RabbitMQ connected');
}