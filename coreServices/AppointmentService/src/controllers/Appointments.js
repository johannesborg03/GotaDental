const express = require('express');
const router = express.Router();
var Dentist = require('../../../userManagementService/src/models/Dentist.js');
var Patient = require('../../../userManagementService/src/models/Patient.js');
var Appointment = require('../models/Appointment.js');
const Timeslot = require('../models/timeslot');
const Office = require('../models/Office');
const mongoose = require('mongoose');

// POST route to create a new appointment
router.post('/api/appointments', async (req, res) => {
    try {
        const { patient_username, dentist_username, office_id, date_and_time, notes } = req.body;

        // Validate required fields
        if (!patient_username || !dentist_username || !office_id|| !date_and_time) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Create a new appointment
        const newAppointment = new Appointment({
            patient_username,
            dentist_username,
            notes: notes || "", // Set default notes if not provided
            state: 0, // Default state: pending
            office_id,
            date_and_time,
        });

        // Save the appointment to the database
        await newAppointment.save();

        res.status(201).json({
            message: "Appointment created successfully",
            appointment: newAppointment
        });
    } catch (error) {
        console.error("Error while creating appointment:", error);
        res.status(500).json({
            message: "Server error while creating appointment",
            error: error.message
        });
    }
});


// Get all appointments for a patient
router.get('/api/appointments/:patient_username', async function (req, res) {
    try {
        // Find the patient by the patient_id
        const patient = await Patient.findOne({ _id: req.params.patient_username });
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }
        const appointments = await Appointment.find({ _id: { $in: patient.appointments } });

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

// Get a specific appointment overall
router.get('/api/appointments/:appointment_id', async function (req, res) {
    try {
        const appointment = await Appointment.findById(req.params.appointment_id);
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

// Get a specific appointment for a patient
router.get('/api/appointments/:patient_username/:appointment_id', async function (req, res) {
    try {
        // Find the patient by the patient_id
        const patient = await Patient.findOne({ _id: req.params.patient_username });
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
router.get('/api/appointments/:dentist_username', async function (req, res) {
    try {
        // Find the dentist by the dentist_id
        const dentist = await Dentist.findOne({ _id: req.params.dentist_username });
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

//This probably should be in dentist controller?
// Get a specific appointment for a dentist
router.get('/api/appointments/:dentist_username/:appointment_id', async function (req, res) {
    try {
        // Find the dentist by the dentist_id
        const dentist = await Dentist.findOne({ _id: req.params.dentist_username });
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

// Post a note to an appointment by a dentist
router.post('/api/appointments/:appointment_id/notes', async function (req, res) {
    try {
        const appointmentID = req.params.appointment_id;
        const dentist_username = req.body.dentist_username; 

        // Find the appointment by appointment_id
        const appointment = await Appointment.findOne({ _id: appointmentID });
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Verify that the dentist is associated with the appointment
        if (!appointment.dentist_id.equals(dentist_username)) {
            return res.status(403).json({ message: "Dentist not authorized for this appointment" });
        }

        // Add a note to the appointment
        const note = {
            dentist_username: dentist_username,
            content: req.body.content,
            date: new Date()
        };

        appointment.notes.push(note);
        await appointment.save();

        res.status(201).json({
            message: "Note added successfully",
            appointment: appointment
        });
    } catch (error) {
        console.error("Error while adding note to appointment:", error);
        res.status(500).json({
            message: "Server error while adding note",
            error: error.message
        });
    }
}); 

// Cancel an appointment by a patient
router.delete('/api/patients/:patient_username/appointments/:appointment_id/cancel', async function (req, res) {
    try {
        const { patient_username, appointment_id } = req.params;

        // Find the appointment
        const appointment = await Appointment.findOne({ _id: appointment_id, patient_username: patient_username });
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found for this patient" });
        }

        // Delete the appointment
        await Appointment.deleteOne({ _id: appointment_id });

        const timeslot = await Timeslot.findOne({
            dentist_username: appointment.dentist_username,
            date_and_time: appointment.date_and_time
        });

        if (timeslot) {
            timeslot.timeslot_state = 0; // Set back to available
            await timeslot.save();
        }

        res.status(200).json({
            message: "Appointment canceled successfully by patient",
            appointment: appointment
        });
    } catch (error) {
        console.error("Error while canceling appointment by patient:", error);
        res.status(500).json({
            message: "Server error while canceling appointment by patient",
            error: error.message
        });
    }
});


// Cancel an appointment by a dentist
router.delete('/api/dentists/:dentist_username/appointments/:appointment_id/cancel', async function (req, res) {
    try {
        const { dentist_username, appointment_id } = req.params;

        // Find the appointment
        const appointment = await Appointment.findOne({ _id: appointment_id, dentist_username: dentist_username });
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found for this dentist" });
        }

        // Delete the appointment
        await Appointment.deleteOne({ _id: appointment_id });

        const timeslot = await Timeslot.findOne({
            dentist_username: dentist_username,
            date_and_time: appointment.date_and_time
        });

        if (timeslot) {
            timeslot.timeslot_state = 0; // Set back to available
            await timeslot.save();
        }

        res.status(200).json({
            message: "Appointment canceled successfully by dentist",
            appointment: appointment
        });
    } catch (error) {
        console.error("Error while canceling appointment by dentist:", error);
        res.status(500).json({
            message: "Server error while canceling appointment by dentist",
            error: error.message
        });
    }
});

module.exports = router;