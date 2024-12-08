const express = require('express');
const router = express.Router();
const timeslotController = require('../controllers/timeslotController'); 

// Create a new timeslot for a specific dentist
//router.post('/api/timeslot/:dentist_username', timeslotController.createTimeslotForDentist);

// Get all timeslots for a specific office
//router.get('/api/timeslot/:office_id/timeslots', timeslotController.getAllTimeslotsForOffice);

// Get a specific timeslot for a dentist
//router.get('/api/timeslot/:office_id/:dentist_username/:timeslot_id', timeslotController.getTimeslotById);
//router.post('/:username', timeslotController.registerSlot);

// Update a timeslot for a dentist 
//router.update('api/timeslot/:office_id/:dentist_username/:timeslot_id/update', timeslotController.updateTimeslot)

//Delete a timeslot for a dentist 
//router.delete('api/timeslot/:office_id/:dentist_username/:timeslot_id/delete', timeslotController.deleteTimeslot)

router.get('/api/timeslots/available', timeslotController.getAvailableTimeslots);

module.exports = router;