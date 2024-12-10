const { subscribeToTopic } = require('../mqttService');
const Timeslot = require('../models/Timeslot'); // Import the Timeslot model

// Callback function that gets executed when a new timeslot is received
async function processTimeslot(message) {
    console.log('Processing new timeslot:', message);

    const { dentist_username, date_and_time, office_id, timeslot_state } = message;

    try {
        // Validate the incoming message
        if (!dentist_username || !date_and_time || !office_id || timeslot_state === undefined) {
            console.error('Missing required fields in timeslot message');
            return;
        }

        // Create a new timeslot document
        const newTimeslot = new Timeslot({ dentist_username, date_and_time, office_id, timeslot_state });
        await newTimeslot.save();

        console.log('New timeslot saved successfully:', newTimeslot);
    } catch (error) {
        console.error('Error processing timeslot:', error);
    }
}

function processDentistEvent(message) {
    console.log('Processing dentist event:', message);
}

// Callback function to handle the retrieval of available timeslots
async function processAvailableTimeslots(message, replyTo, correlationId) {
    console.log('Received request to retrieve available timeslots:', message);

    try {
        const availableTimeslots = await Timeslot.find({ timeslot_state: 0 }); // Fetch only available timeslots
        const response = { success: true, timeslots: availableTimeslots };

        // Publish the available timeslots to the reply queue
        await publishMessage(replyTo, response, correlationId);
        console.log('Available timeslots sent successfully:', response);
    } catch (error) {
        console.error('Error fetching available timeslots:', error);
        const errorResponse = { success: false, message: 'Failed to fetch available timeslots' };

        // Send an error response
        await publishMessage(replyTo, errorResponse, correlationId);
    }
}

function processRetrieveAllOffices(message) {
    console.log('Processing office retrieval event:', message);
}

function processCreateOffice(message) {
    console.log('Processing office creation event:', message);
}

subscribeToTopic('dentist_topic', processTimeslot);
subscribeToTopic('offices/retrieveAll', processRetrieveAllOffices);
subscribeToTopic('offices/create', processCreateOffice);
subscribeToTopic('timeslot_topic', processTimeslot); // Handle timeslot-related events
subscribeToTopic('timeslot/available/retrieve', processAvailableTimeslots); // Handle available timeslots
        