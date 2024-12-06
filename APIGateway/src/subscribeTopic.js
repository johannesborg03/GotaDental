const { subscribeToTopic } = require('../mqttService');

// Callback function that gets executed when a new timeslot is received
function processTimeslot(message) {
    console.log('Processing new timeslot:', message);
}

function processDentistEvent(message) {
    console.log('Processing dentist event:', message);
}

subscribeToTopic('dentist_topic', processTimeslot);