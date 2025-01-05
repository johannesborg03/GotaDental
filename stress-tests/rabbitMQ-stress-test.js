const amqp = require('amqplib');

const RABBITMQ_URL = 'amqp://rabbitmq:5672'; // RabbitMQ service from Docker
const NUM_MESSAGES = 1000; // Total number of messages for stress testing
const TIMESLOT_CREATE_TOPIC = 'timeslot/create'; // Example topic for timeslot creation

// Function to simulate message publishing
async function publishMessages() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        // Assert exchange (fanout for broadcasting)
        await channel.assertExchange(TIMESLOT_CREATE_TOPIC, 'fanout', { durable: false });

        for (let i = 0; i < NUM_MESSAGES; i++) {
            const message = {
                start: new Date().toISOString(),
                end: new Date(Date.now() + 3600000).toISOString(), // 1 hour later
                dentist: `dentist_${i % 10}`, // Simulating 10 dentists
                office: `office_${i % 5}`, // Simulating 5 offices
                officeId: `office_${i % 5}`,
                isBooked: false,
                patient: null,
            };

            // Publish the message to RabbitMQ
            channel.publish(
                TIMESLOT_CREATE_TOPIC,
                '',
                Buffer.from(JSON.stringify(message)),
                {
                    correlationId: `${i}`,
                    replyTo: '', // Not expecting a reply here
                }
            );

            console.log(`Published message ${i + 1}/${NUM_MESSAGES}`);
        }

        setTimeout(() => {
            connection.close();
            console.log('Publishing completed.');
        }, 500); // Delay to ensure all messages are processed
    } catch (error) {
        console.error('Error in publishing messages:', error);
    }
}
