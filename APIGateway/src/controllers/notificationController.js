const mqtt = require('mqtt');

const { publishMessage } = require('../mqttService');
const { v4: uuidv4 } = require('uuid');

// Controller for sending notifications
exports.sendNotification = async (req, res) => {
    const { recipientId, message } = req.body;

    // Validate input
    if (!recipientId || !message) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const correlationId = uuidv4(); // Unique ID for tracking
    const topic = 'notifications'; // RabbitMQ exchange for notifications

    // Prepare the message payload
    const notificationData = { recipientId, message, correlationId };

    try {
        // Publish the message to RabbitMQ
        const response = await publishMessage(topic, notificationData, correlationId);

        // Check if the service returned an error
        if (response) {
            return res.status(500).json({ message: 'Notification not found '});
        }

        res.status(200).json({
            message: 'Notification request sent successfully',
            correlationId,
        });
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ message: 'Failed to send notification' });
    }
};
