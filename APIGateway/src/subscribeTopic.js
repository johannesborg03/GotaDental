const { subscribeToTopic } = require('../mqttService');
const Timeslot = require('../models/Timeslot'); // Import the Timeslot model

// Callback function that gets executed when a new timeslot is received
function processTimeslot(message) {
    console.log('Processing new timeslot:', message);
}

function processDentistEvent(message) {
    console.log('Processing dentist event:', message);
}

// Callback function to handle the retrieval of available timeslots
async function processAvailableTimeslots(message, replyTo, correlationId) {
    console.log('Received request to retrieve available timeslots:', message);

    try {
        const availableTimeslots = await Timeslot.find({ timeslot_state: 0 });
        const response = {success: true, timeslots: availableTimeslots,};

        await publishMessage(replyTo, response, correlationId);
        console.log('Available timeslots sent successfully');
    } catch (error) {
        console.error('Error fetching available timeslots:', error);
        const errorResponse = {success: false, message: 'Failed to fetch available timeslots',};

        await publishMessage(replyTo, errorResponse, correlationId);
    }
}

subscribeToTopic('dentist_topic', processDentistEvent);
subscribeToTopic('timeslot_topic', processTimeslot);
subscribeToTopic('timeslot/available/retrieve', processAvailableTimeslots);
