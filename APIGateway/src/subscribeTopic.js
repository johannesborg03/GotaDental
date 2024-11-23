const { subscribeToTopic } = require('../mqttService');

// Callback function that gets executed when a new timeslot is received
function processTimeslot(message) {
    console.log('Processing new timeslot:', message);
}

subscribeToTopic('timeslot_topic', processTimeslot);