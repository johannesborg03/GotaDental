import amqp from 'amqplib';

async function receiveMessage() {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();
        const exchange = 'appointment_exchange';

        //const queue = 'test_queue';

        //await channel.assertQueue(queue);
        await channel.assertExchange(exchange, 'topic', { durable: true });

        // Create a queue with a dynamic name
        const { queue } = await channel.assertQueue('', { exclusive: true });
        console.log(`Queue created: ${queue}`);

        // Bind the queue to the exchange with the given binding key
        await channel.bindQueue(queue, exchange, bindingKey);

        console.log(`Waiting for messages with binding key "${bindingKey}"...`);

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