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
async function processAvailableTimeslots(message) {
    try {

    } catch (error) {
        
    }
}
subscribeToTopic('dentist_topic', processDentistEvent);
subscribeToTopic('timeslot_topic', processTimeslot);