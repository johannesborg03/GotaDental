const amqp = require("amqplib");

const RABBITMQ_URL = "amqp://rabbitmq:5672";
const NUM_MESSAGES = 1000;
const CONCURRENCY = 50;

// Define topics for stress testing
const TIMESLOT_CREATE_TOPIC = "timeslot/create";
const TIMESLOT_SUBSCRIBE_TOPIC = "timeslot/subscribe";

// Function to publish messages
async function publishMessages() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        // Assert exchange
        await channel.assertExchange(TIMESLOT_CREATE_TOPIC, "fanout", {
            durable: false,
        });

        for (let i = 0; i < NUM_MESSAGES; i++) {
            const message = {
                start: new Date().toISOString(),
                end: new Date(Date.now() + 3600000).toISOString(),
                dentist: `dentist_${i % 10}`,
                office: `office_${i % 5}`,
                officeId: `office_${i % 5}`,
                isBooked: false,
            };

            channel.publish(
                TIMESLOT_CREATE_TOPIC,
                "",
                Buffer.from(JSON.stringify(message))
            );
            console.log(`Published message ${i + 1}/${NUM_MESSAGES}`);
        }

        setTimeout(() => {
            connection.close();
            console.log("Publishing completed.");
        }, 500);
    } catch (error) {
        console.error("Error in publishing messages:", error);
    }
}

// Function to subscribe and process messages
async function subscribeToMessages() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        // Assert exchange
        await channel.assertExchange(TIMESLOT_SUBSCRIBE_TOPIC, "fanout", {
            durable: false,
        });

        // Assert and bind to a temporary queue
        const { queue } = await channel.assertQueue("", { exclusive: true });
        await channel.bindQueue(queue, TIMESLOT_SUBSCRIBE_TOPIC, "");

        console.log(`Subscribed to topic: ${TIMESLOT_SUBSCRIBE_TOPIC}`);

        channel.consume(
            queue,
            (msg) => {
                const message = JSON.parse(msg.content.toString());
                console.log("Received message:", message);
            },
            { noAck: true }
        );
    } catch (error) {
        console.error("Error in subscribing to messages:", error);
    }
}

// Run both publishing and subscribing for stress testing
(async () => {
    console.log("Starting RabbitMQ stress tests...");
    await Promise.all([publishMessages(), subscribeToMessages()]);
})();

