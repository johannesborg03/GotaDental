const amqp = require('amqplib');

const RABBITMQ_URL = 'amqp://rabbitmq:5672';
const NUM_MESSAGES = 1000; // Total messages for stress testing
const TIMESLOT_TOPIC = 'timeslot/create'; // RabbitMQ topic

// Function to simulate message publishing
async function publishMessages() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        // Assert the topic exchange
        await channel.assertExchange(TIMESLOT_TOPIC, 'fanout', { durable: false });

        for (let i = 0; i < NUM_MESSAGES; i++) {
            const message = {
                start: new Date().toISOString(),
                end: new Date(Date.now() + 3600000).toISOString(),
                dentist: `dentist_${i % 10}`,
                office: `office_${i % 5}`,
                isBooked: false,
            };

            // Publish message to the topic
            channel.publish(
                TIMESLOT_TOPIC,
                '',
                Buffer.from(JSON.stringify(message)),
                { correlationId: `${i}` }
            );

            console.log(`Published message ${i + 1}/${NUM_MESSAGES}`);
        }

        setTimeout(() => {
            connection.close();
            console.log('Publishing completed.');
        }, 500);
    } catch (error) {
        console.error('Error in publishing messages:', error.message);
    }
}

// Function to simulate message subscription
async function subscribeToMessages() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        // Assert the topic exchange
        await channel.assertExchange(TIMESLOT_TOPIC, 'fanout', { durable: false });

        // Assert and bind to a temporary queue
        const { queue } = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(queue, TIMESLOT_TOPIC, '');

        console.log(`Subscribed to topic: ${TIMESLOT_TOPIC}`);

        channel.consume(queue, (msg) => {
            const message = JSON.parse(msg.content.toString());
            console.log('Received message:', message);

            // Simulate processing delay
            setTimeout(() => {
                console.log('Processed message:', message);
            }, Math.random() * 1000);
        });
    } catch (error) {
        console.error('Error in subscribing to messages:', error.message);
    }
}

// Run MQTT stress test
(async () => {
    console.log('Starting MQTT stress test...');
    await Promise.all([publishMessages(), subscribeToMessages()]);
})();
