import amqp from 'amqplib';

let connection, channel;

async function setupConnection() {
    if (!connection) {
        connection = await amqp.connect('amqp://localhost');
        channel = await connection.createChannel();
    }
    return channel;
}

async function setupConnection() {
    if (!connection) {
        connection = await amqp.connect('amqp://localhost');
        channel = await connection.createChannel();
    }
    return channel;
}

export async function publishMessage(exchange, message, routingKey) {
    const channel = await setupConnection();
    await channel.assertExchange(exchange, 'topic', { durable: true });
    channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)));
    console.log(`Message published to "${exchange}" with routing key "${routingKey}"`);
}

export async function subscribeToTopic(exchange, bindingKey, messageHandler) {
    const channel = await setupConnection();
    await channel.assertExchange(exchange, 'topic', { durable: true });

    const { queue } = await channel.assertQueue('', { exclusive: true });
    await channel.bindQueue(queue, exchange, bindingKey);

    console.log(`Subscribed to "${bindingKey}" in "${exchange}"`);
    channel.consume(queue, (msg) => {
        messageHandler(msg.content.toString());
        channel.ack(msg);
    });
}