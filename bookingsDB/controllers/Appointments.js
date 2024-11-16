var express = require('express');
var router = express.Router();
var Booking = require('../models/Booking.js');
var Office = require('../models/Office.js');
var Dentist = require('../models/Dentist.js'); 
var Patient = require('../models/Patient.js'); 


const mongoose = require('mongoose');


// Get all appointments for a patient
router.get('/api/appointments/:patient_id', async function (req, res) {
    try {
        // Find the patient by the patient_id
        const patient = await Patient.findOne({ _id: req.params.patient_id });
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }
        const appointments = await appointment.find({ _id: { $in: patient.appointments } });

        res.status(200).json({
            message: "Appointments retrieved successfully",
            appointments: appointments
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error while retrieving appointments",
            error: error.message,
        });
    }
});


module.exports = router;