const amqp = require('amqplib');

const RABBITMQ_URL = 'amqp://rabbitmq:5672';
const HEALTH_TOPICS = [
    'health.check.timeslot',
    'health.check.appointment',
    'health.check.office',
    'health.check.usermanagement',
];

(async () => {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        const healthStatuses = {};

        for (const topic of HEALTH_TOPICS) {
            await channel.assertExchange(topic, 'fanout', { durable: false });
            const { queue } = await channel.assertQueue('', { exclusive: true });
            channel.bindQueue(queue, topic, '');

            channel.consume(queue, (msg) => {
                const healthStatus = JSON.parse(msg.content.toString());
                healthStatuses[healthStatus.service] = healthStatus;

                console.log('Updated health status:', healthStatuses);
            });
        }

        // Expose aggregated health status via HTTP
        const express = require('express');
        const app = express();
        app.get('/api/system-health', (req, res) => {
            res.json(healthStatuses);
        });
        app.listen(4000, () => {
            console.log('API Gateway health aggregator running on port 4000...');
        });
    } catch (error) {
        console.error('Error in API Gateway health aggregator:', error);
    }
})();
