const { subscribeToTopic } = require('./subscriber');
const Timeslot = require('../models/Timeslot');

// Handle creating a new timeslot for a dentist
async function handleCreateTimeslot(message, replyTo, correlationId, channel) {
    console.log('Received create timeslot message:', message);

    const { dentist_username, date_and_time, timeslot_state } = message;

    try {
        // Validate the input
        if (!dentist_username || !date_and_time || !timeslot_state) {
            const errorResponse = { success: false, error: 'Missing required fields' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        const newTimeslot = new Timeslot({ dentist_username, date_and_time, timeslot_state });
        await newTimeslot.save();

        console.log('Timeslot created:', newTimeslot);
        const successResponse = { success: true, timeslot: newTimeslot };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
    } catch (error) {
        console.error('Error creating timeslot:', error);
        const errorResponse = { success: false, error: 'Failed to create timeslot' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
    }
}

module.exports = {
    initializeTimeslotSubscriptions,
    handleCreateTimeslot,
    handleGetAllTimeslotsForOffice,
    handleGetTimeslotById,
    handleUpdateTimeslot,
    handleDeleteTimeslot,
};