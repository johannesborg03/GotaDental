const express = require('express');
const router = express.Router();
const { publishMessage } = require('../mqttService'); // Ensure this is correct
const { v4: uuidv4 } = require('uuid');
const timeslotController = require('../controllers/timeslotController');

// Create a new timeslot for a specific dentist
//router.post('/:dentist_username', timeslotController.createTimeslot);


router.post('/timeslots', timeslotController.createTimeslot);

// Retrieve all timeslots for an office
router.get('/api/timeslots/:office_id', timeslotController.getAllTimeslotsForOffice);

// Retrieve available timeslots
router.get('/api/timeslots/available', timeslotController.getAvailableTimeslots);

// Update a specific timeslot
router.patch('/timeslots/:timeslot_id', timeslotController.updateTimeslot);

//Retrieve all booked timeslots for a patient
router.get('/api/patients/:patientSSN/timeslots', timeslotController.getBookedTimeslots);



module.exports = router;