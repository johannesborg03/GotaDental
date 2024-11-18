var express = require('express');
var router = express.Router();
var Booking = require('../models/Booking.js');
// var Dentist = require('../models/Dentist.js'); 
var Patient = require('../../userManagementDB/models/Patient.js');
var Appointment = require('../models/Appointment.js');

const mongoose = require('mongoose');


// Get all appointments for a patient
router.get('/api/appointments/:patient_id', async function (req, res) {
    try {
        // Find the patient by the patient_id
        const patient = await Patient.findOne({ _id: req.params.patient_id });
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

// Post a note to an appointment by a dentist
router.post('/api/appointments/:appointment_id/notes', async function (req, res) {
    try {
        const appointmentID = req.params.appointment_id;
        const dentistID = req.body.dentist_id; 

        // Find the appointment by appointment_id
        const appointment = await Appointment.findOne({ _id: appointmentID });
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Verify that the dentist is associated with the appointment
        if (!appointment.dentist_id.equals(dentistID)) {
            return res.status(403).json({ message: "Dentist not authorized for this appointment" });
        }

        // Add a note to the appointment
        const note = {
            dentist_id: dentistID,
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


// Cancel an appointment and associated booking by a patient
router.delete('/api/patients/:patient_id/appointments/:appointment_id/cancel', async function (req, res) {
    try {
        const { patient_id, appointment_id } = req.params;

        // Find the appointment
        const appointment = await Appointment.findOne({ _id: appointment_id, patient_id: patient_id });
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found for this patient" });
        }

        // Find and delete the associated booking
        const booking = await Booking.findByIdAndDelete(appointment.booking_id);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Delete the appointment
        await Appointment.deleteOne({ _id: appointment_id });

        // Optionally, update the timeslot state back to available
        const timeslot = await Timeslot.findOne({
            dentist_id: booking.dentist_id,
            date_and_time: booking.appointment_datetime
        });

        if (timeslot) {
            timeslot.timeslot_state = 0; // Set back to available
            await timeslot.save();
        }

        res.status(200).json({
            message: "Appointment and booking canceled successfully by patient",
            appointment: appointment,
            booking: booking
        });
    } catch (error) {
        console.error("Error while canceling appointment and booking by patient:", error);
        res.status(500).json({
            message: "Server error while canceling appointment and booking by patient",
            error: error.message
        });
    }
});

// Cancel an appointment and associated booking by a dentist
router.delete('/api/dentists/:dentist_id/appointments/:appointment_id/cancel', async function (req, res) {
    try {
        const { dentist_id, appointment_id } = req.params;

        // Find the appointment
        const appointment = await Appointment.findOne({ _id: appointment_id, dentist_id: dentist_id });
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found for this dentist" });
        }

        // Find and delete the associated booking
        const booking = await Booking.findByIdAndDelete(appointment.booking_id);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Delete the appointment
        await Appointment.deleteOne({ _id: appointment_id });

        // Optionally, update the timeslot state back to available
        const timeslot = await Timeslot.findOne({
            dentist_id: dentist_id,
            date_and_time: booking.appointment_datetime
        });

        if (timeslot) {
            timeslot.timeslot_state = 0; // Set back to available
            await timeslot.save();
        }

        res.status(200).json({
            message: "Appointment and booking canceled successfully by dentist",
            appointment: appointment,
            booking: booking
        });
    } catch (error) {
        console.error("Error while canceling appointment and booking by dentist:", error);
        res.status(500).json({
            message: "Server error while canceling appointment and booking by dentist",
            error: error.message
        });
    }
});