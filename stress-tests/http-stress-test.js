const amqp = require("amqplib");

const RABBITMQ_URL = "amqp://rabbitmq:5672";
const NUM_MESSAGES = 1000; // Total number of requests/messages
const CONCURRENCY = 50; // Number of concurrent messages

// Topics for stress testing
const FETCH_AVAILABLE_TIMESLOTS_TOPIC = "timeslot/available/retrieve";
const CREATE_TIMESLOT_TOPIC = "timeslot/create";

async function publishMessage(topic, message) {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();
        await channel.assertExchange(topic, "fanout", { durable: false });

        channel.publish(topic, "", Buffer.from(JSON.stringify(message)));
        console.log(`Message published to topic: ${topic}`);
        await channel.close();
        await connection.close();
    } catch (error) {
        console.error(`Error publishing to topic ${topic}:`, error.message);
    }
}

// Stress test for fetching available timeslots
async function fetchAvailableTimeslots() {
    const message = {
        action: "fetch",
        payload: {},
    };
    await publishMessage(FETCH_AVAILABLE_TIMESLOTS_TOPIC, message);
}

// Stress test for creating a timeslot
async function createTimeslot() {
    const message = {
        start: new Date().toISOString(),
        end: new Date(Date.now() + 3600000).toISOString(),
        dentist: `dentist_${Math.floor(Math.random() * 100)}`,
        office: `office_${Math.floor(Math.random() * 10)}`,
        isBooked: false,
    };
    await publishMessage(CREATE_TIMESLOT_TOPIC, message);
}

// Run stress tests
(async () => {
    console.log("Starting stress tests...");

    const tasks = [];
    for (let i = 0; i < NUM_MESSAGES; i++) {
        if (i % 2 === 0) {
            tasks.push(fetchAvailableTimeslots());
        } else {
            tasks.push(createTimeslot());
        }

        if (tasks.length >= CONCURRENCY) {
            await Promise.all(tasks);
            tasks.length = 0; // Clear completed tasks
        }
    }

    // Process remaining tasks
    await Promise.all(tasks);
    console.log("Stress tests completed.");
})();
