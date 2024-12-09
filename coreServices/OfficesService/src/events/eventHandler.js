const { subscribeToTopic } = require('./subscriber'); // Import the subscription utility
const Office = require('../models/Office'); // Import the Office model

// Handle retrieving all offices
async function handleRetrieveAllOffices(message, replyTo, correlationId, channel) {
    console.log('Received retrieve all offices message:', message);

    try {
        const offices = await Office.find({}, 'office_id office_name latitude longitude');

        if (!offices || offices.length === 0) {
            const errorResponse = { success: false, error: 'No offices found' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        const successResponse = { success: true, offices };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
    } catch (error) {
        console.error('Error retrieving offices:', error);
        const errorResponse = { success: false, error: 'Failed to retrieve offices' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
    }
}

// Initialize subscriptions for the Office service
async function initializeOfficeSubscriptions() {
    try {
        await subscribeToTopic('offices/retrieve', handleRetrieveAllOffices); // Subscribe to the topic for retrieving all offices
        console.log('Office subscriptions initialized!');
    } catch (error) {
        console.error('Error initializing office subscriptions:', error);
    }
}

module.exports = {
    initializeOfficeSubscriptions,
};
