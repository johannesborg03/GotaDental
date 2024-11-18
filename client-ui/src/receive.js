import amqp from 'amqplib';

async function receiveMessage() {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();
        const queue = 'test_queue';

        await channel.assertQueue(queue);

        console.log('Waiting for messages...');
        channel.consume(queue, (msg) => {
            console.log(`Received message: ${msg.content.toString()}`);
            channel.ack(msg);
        });
    } catch (error) {
        console.error('Error receiving message:', error);
    }
}

receiveMessage();