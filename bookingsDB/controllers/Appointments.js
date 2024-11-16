var express = require('express');
var router = express.Router();
var Booking = require('../models/Booking.js');
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

// Get a specific appointment for a patient
router.get('/api/appointments/:patient_id/:appointment_id', async function (req, res) {
    try {
        // Find the patient by the patient_id
        const patient = await Patient.findOne({ _id: req.params.patient_id });
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        // Check if the appointment ID is associated with the patient
        if (!patient.appointments.includes(req.params.appointment_id)) {
            return res.status(404).json({ message: "Appointment not found for this patient" });
        }

        // Retrieve the specific appointment
        const appointment = await Appointment.findOne({ _id: req.params.appointment_id });
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        res.status(200).json({
            message: "Appointment retrieved successfully",
            appointment: appointment
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error while retrieving the appointment",
            error: error.message,
        });
    }
});

// Get all appointments for a dentist
router.get('/api/appointments/:dentist_id', async function (req, res) {
    try {
        // Find the dentist by the dentist_id
        const dentist = await Dentist.findOne({ _id: req.params.dentist_id });
        if (!dentist) {
            return res.status(404).json({ message: "Dentist not found" });
        }
        
        // Assuming dentist has an array of appointment IDs
        const appointments = await Appointment.find({ _id: { $in: dentist.appointments } });

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


// Get a specific appointment for a dentist
router.get('/api/appointments/:dentist_id/:appointment_id', async function (req, res) {
    try {
        // Find the dentist by the dentist_id
        const dentist = await Dentist.findOne({ _id: req.params.dentist_id });
        if (!dentist) {
            return res.status(404).json({ message: "Dentist not found" });
        }

        // Check if the appointment ID is associated with the dentist
        if (!dentist.appointments.includes(req.params.appointment_id)) {
            return res.status(404).json({ message: "Appointment not found for this dentist" });
        }

        // Retrieve the specific appointment
        const appointment = await Appointment.findOne({ _id: req.params.appointment_id });
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        res.status(200).json({
            message: "Appointment retrieved successfully",
            appointment: appointment
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error while retrieving the appointment",
            error: error.message,
        });
    }
});

module.exports = router;