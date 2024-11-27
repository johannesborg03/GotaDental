const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointments'); 

// Route to create a new appointment
router.post('/api/appointments', appointmentController.createAppointment);



module.exports = router;