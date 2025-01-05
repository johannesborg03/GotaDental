const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URI || 'amqp://rabbitmq:5672';
const HEALTH_TOPICS = [
    'health.check.timeslot',
    'health.check.appointment',
    'health.check.office',
    'health.check.usermanagement',
];

let healthStatuses = {}; // Store aggregated health statuses

async function startHealthAggregation() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        console.log('API Gateway: Connected to RabbitMQ for health aggregation.');

        for (const topic of HEALTH_TOPICS) {
            await channel.assertExchange(topic, 'fanout', { durable: false });
            const { queue } = await channel.assertQueue('', { exclusive: true });
            channel.bindQueue(queue, topic, '');

            // Consume messages from each topic
            channel.consume(queue, (msg) => {
                const healthStatus = JSON.parse(msg.content.toString());
                healthStatuses[healthStatus.service] = healthStatus;

                console.log(`Updated health status:`, healthStatuses);
            });
        }
    } catch (error) {
        console.error('Error in health aggregation:', error);
    }
}

// Export the aggregated health statuses for use in routes
module.exports = { startHealthAggregation, healthStatuses };
