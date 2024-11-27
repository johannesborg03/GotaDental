const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointments'); 

// Route to create a new appointment
router.post('/api/appointments', appointmentController.createAppointment);

// Route to retrieve all appointments for a patient
router.get('/api/appointments/patient/:patient_ssn', appointmentController.getAppointmentsForPatient);

// Route to retrieve a specific appointment by appointment ID
router.get('/api/appointments/:appointment_id', appointmentController.getAppointmentById);

// Route to add a note to an appointment
router.post('/api/appointments/:appointment_id/notes', appointmentController.addNoteToAppointment);

module.exports = router;