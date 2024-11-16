var express = require('express');
var router = express.Router();
var Timeslot = require('../models/timeslot.js');
var Dentist = require('../models/Dentist.js'); 

const mongoose = require('mongoose');

// Create a new timeslot for a specific dentist (POST /api/offices/:id/timeslot)
router.post('/api/:dentist_id/timeslot', async function (req, res) {
    try {
        const dentistID = req.params.dentist_id; 
        // Find the user by their username
        
        const dentist = await Dentist.findOne({dentist_id: dentistID });
        if (!dentist) {
            return res.status(404).json({ message: "Dentist not found" });
        }

        // Create a new timeslot
        var timeslot = new Timeslot({
            timeslot_id: req.body.timeslot_id, 
            date_and_time: req.body.date_and_time,
            dentist_id: dentistID,  // Use dentistID directly
            timeslot_state: req.body.timeslot_state
        });

        await timeslot.save();

         // Push the timeslot ID into the dentist 
         dentist.timeslot.push(timeslot._id);
         await dentist.save();

        res.status(201).json({
            message: "Timeslot created successfully",
            timeslot: timeslot
        });
    } catch (err) {
        console.error("Error while creating timeslot:", err);  // Log the error for debugging
        res.status(500).json({
            message: "Server error while creating timeslot",
            error: err.message
        });
    }
});
