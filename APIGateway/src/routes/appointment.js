const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointments'); 

// Route to create a new appointment
router.post('/api/appointments', appointmentController.createAppointment);

// Route to add a note to an appointment
router.post('/api/appointments/:appointment_id/notes', appointmentController.addNoteToAppointment);

module.exports = router;