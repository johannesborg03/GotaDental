const amqp = require('amqplib');

const RABBITMQ_URL = 'amqp://rabbitmq:5672';
const HEALTH_TOPIC = 'health.check.usermanagement';

async function startHealthMonitoring() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        // Periodically publish health status
        setInterval(async () => {
            const healthStatus = {
                service: 'UserManagement Service',
                status: 'Healthy',
                timestamp: new Date().toISOString(),
            };

            await channel.assertExchange(HEALTH_TOPIC, 'fanout', { durable: false });
            channel.publish(HEALTH_TOPIC, '', Buffer.from(JSON.stringify(healthStatus)));

            console.log(`Published health status for Timeslot Service:`, healthStatus);
        }, 5000); // Publish every 5 seconds

        console.log('Health monitoring for Timeslot Service is running...');
    } catch (error) {
        console.error('Error in Timeslot Service health monitoring:', error);
    }
}

module.exports = { startHealthMonitoring };