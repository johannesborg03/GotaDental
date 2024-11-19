const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Appointment = require('../models/Appointment');
const Timeslot = require('../models/timeslot');
// var Patient = require('../../userManagementDB/models/Patient.js');
// const Dentist = require('../models/Dentist');
const Office = require('../models/Office');

// Create a booking and associated appointment
router.post('/api/bookings', async function (req, res) {
    try {
        const { patient_id, dentist_username, office_id, appointment_datetime } = req.body;

        // Validate the patient, dentist, and office
        const patient = await Patient.findById(patient_id);
        const dentist = await Dentist.findById(dentist_username);
        const office = await Office.findById(office_id);

        // Check if the timeslot is available
        const timeslot = await Timeslot.findOne({
            dentist_username: dentist_username,
            date_and_time: appointment_datetime,
            timeslot_state: 0 // Assuming 0 means available
        });

        if (!timeslot) {
            return res.status(400).json({ message: "Timeslot not available" });
        }

        // Create a new booking
        const booking = new Booking({
            booking_id: new mongoose.Types.ObjectId().toString(),
            booking_state: 1, // Assuming 1 means booked
            patient_id,
            dentist_username,
            office_id,
            appointment_datetime
        });

        await booking.save();

        // Create a new appointment linked to the booking
        const appointment = new Appointment({
            _id: booking._id, // Use booking ID as appointment ID
            patient_id,
            dentist_username,
            office_id,
            datetime: appointment_datetime,
            booking_id: booking._id
        });

        await appointment.save();

        // Update the timeslot state to booked
        timeslot.timeslot_state = 1;
        await timeslot.save();

        res.status(201).json({
            message: "Booking and appointment created successfully",
            booking: booking,
            appointment: appointment
        });
    } catch (error) {
        console.error("Error while creating booking and appointment:", error);
        res.status(500).json({
            message: "Server error while creating booking and appointment",
            error: error.message
        });
    }
});

module.exports = router;