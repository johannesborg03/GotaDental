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


// Handle retrieving all timeslots for an office
async function handleGetAllTimeslots(message, replyTo, correlationId, channel) {
    console.log('Received retrieve all timeslots message:', message);

    const { office_id } = message;

    try {
        if (!office_id) {
            const errorResponse = { success: false, error: 'Missing office_id' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        const timeslots = await Timeslot.find({ office_id });
        console.log('Retrieved timeslots:', timeslots);

        const successResponse = { success: true, timeslots };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
    } catch (error) {
        console.error('Error retrieving timeslots:', error);
        const errorResponse = { success: false, error: 'Failed to retrieve timeslots' };
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