import amqp from 'amqplib';

let connection, channel;

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


/*
const mqttClient = mqtt.connect('ws://localhost:9001', {
    clientId: `mqttjs_${Math.random().toString(16).substr(2, 8)}`,
    clean: true, // Clean session
    reconnectPeriod: 1000, // Reconnect every second if disconnected
});

mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');
});

mqttClient.on('error', (error) => {
    console.error('Connection error:', error);
});

mqttClient.on('close', () => {
    console.log('MQTT connection closed');
});

// Publish a message to a topic
export function publishMessage(topic, message) {
    mqttClient.publish(topic, message, (err) => {
        if (err) {
            console.error('Publish error:', err);
        } else {
            console.log(`Message "${message}" published to topic "${topic}"`);
        }
    });
}

// Subscribe to a topic and handle messages
export function subscribeToTopic(topic, messageHandler) {
    mqttClient.subscribe(topic, (err) => {
        if (err) {
            console.error('Subscription error:', err);
        } else {
            console.log(`Subscribed to topic "${topic}"`);
        }
    });

    mqttClient.on('message', (receivedTopic, message) => {
        if (receivedTopic === topic) {
            messageHandler(message.toString());
        }
    });
}

export default mqttClient;
*/