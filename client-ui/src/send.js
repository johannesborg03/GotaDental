import amqp from 'amqplib';

async function sendMessage() {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();
        const queue = 'test_queue';
        const message = 'Hello, user!';

        await channel.assertQueue(queue);
        channel.sendToQueue(queue, Buffer.from(message));
        console.log(`Message sent: ${message}`);

        setTimeout(() => {
            connection.close();
        }, 1000);
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

sendMessage();