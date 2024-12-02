const { subscribeToTopic } = require('./subscriber');
const Timeslot = require('../models/Timeslot');


module.exports = {
    initializeTimeslotSubscriptions,
    handleCreateTimeslot,
    handleGetAllTimeslotsForOffice,
    handleGetTimeslotById,
    handleUpdateTimeslot,
    handleDeleteTimeslot,
};