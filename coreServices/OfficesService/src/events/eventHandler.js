const { subscribeToTopic } = require('./subscriber');
const Office = require('../models/Office');

async function handleRetrieveAllOffices(message, replyTo, correlationId, channel) {
    console.log('[Office Service] Received message to retrieve all offices:', message);

    try {
        const offices = await Office.find({});
        console.log('[Office Service] Offices fetched:', offices);

        const response = { success: true, offices };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(response)), { correlationId });
    } catch (error) {
        console.error('[Office Service] Error retrieving offices:', error);
        const errorResponse = { success: false, error: error.message };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
    }
}


async function handleCreateOffice(message, replyTo, correlationId, channel) {
    console.log('Received message from topic "offices/create":', message);

    try {
        // Create the new office in the database
        const newOffice = await Office.create(message);
        console.log('Office created successfully:', newOffice);

        const successResponse = { success: true, office: newOffice };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
    } catch (error) {
        console.error('Error creating office:', error);
        const errorResponse = { success: false, error: error.message };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
    }
}


async function initializeOfficeSubscriptions() {
    try {
        await subscribeToTopic('offices/retrieveAll', handleRetrieveAllOffices);
        await subscribeToTopic('offices/create', handleCreateOffice);

        console.log('Office subscriptions initialized!');
    } catch (error) {
        console.error('Error initializing office subscriptions:', error);
    }
}

module.exports = {
    initializeOfficeSubscriptions,
    handleCreateOffice,
};
