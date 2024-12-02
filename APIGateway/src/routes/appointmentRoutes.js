const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController'); 

// Route to create a new appointment
router.post('/api/appointments', appointmentController.createAppointment);

// Route to add a note to an appointment
router.post('/api/appointments/:appointment_id/dentist_username/notes', appointmentController.addNoteToAppointment);

// Route to retrieve all appointments for a patient
router.get('/api/appointments/patient/:patient_ssn', appointmentController.getAppointmentsForPatient);

// Route to retrieve a specific appointment by appointment ID
router.get('/api/appointments/:appointment_id', appointmentController.getAppointmentById);

// Route to cancel an appointment by a patient
router.delete('/api/patients/:patient_ssn/appointments/:appointment_id/cancel', appointmentController.cancelAppointmentByPatient);

// Route to cancel an appointment by a dentist
router.delete('/api/dentists/:dentist_username/appointments/:appointment_id/cancel', appointmentController.cancelAppointmentByDentist);

module.exports = router;