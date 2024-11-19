import amqp from 'amqplib';

async function sendMessage(queue, message, routingKey = '') {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();
        const exchange = 'appointment_exchange';

        //const queue = 'test_queue';
        //const message = 'Hello, user!';

        await channel.assertExchange(exchange, 'topic', { durable: true });

        channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)));

        console.log(`Message sent with routing key "${routingKey}":`, message);

        //await channel.assertQueue(queue);
        //channel.sendToQueue(queue, Buffer.from(message));
        //console.log(`Message sent: ${message}`);

        setTimeout(() => {
            connection.close();
        }, 1000);
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

sendMessage();