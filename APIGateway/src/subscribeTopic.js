const { subscribeToTopic } = require('../mqttService');

// Callback function that gets executed when a new timeslot is received
function processTimeslot(message) {
    console.log('Processing new timeslot:', message);
}

function processDentistEvent(message) {
    console.log('Processing dentist event:', message);
}

function processRetrieveAllOffices(message) {
    console.log('Processing office retrieval event:', message);
}

function processCreateOffice(message) {
    console.log('Processing office creation event:', message);
}

subscribeToTopic('dentist_topic', processTimeslot);
subscribeToTopic('timeslot_topic', processTimeslot);
subscribeToTopic('offices/retrieveAll', processRetrieveAllOffices);
subscribeToTopic('offices/create', processCreateOffice);