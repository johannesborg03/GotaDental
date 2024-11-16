var express = require('express');
var router = express.Router();
var Timeslot = require('../models/timeslot.js');
var Dentist = require('../models/Dentist.js'); 
var Office = require('../models/Office.js'); 

const mongoose = require('mongoose');

// Create a new timeslot for a specific dentist
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

// Get all timeslots for dentists in a specific office 
router.get('/api/:office_id/timeslots', async function (req, res) {
    try {
        // Find the office by the office_id
        const office = await Office.findOne({ office_id: req.params.office_id });
        if (!office) {
            return res.status(404).json({ message: "Office not found" });
        }

        // Find the timeslots for the office
        const dentists = await Dentist.find({ office_id: office._id });
        if (!dentists.length) {
            return res.status(404).json({ message: "No dentists found for this office" });
        }

        const officeName = office.office_name;

        const timeslots = await Timeslot.find({ dentist_id: { $in: dentists.map(d => d._id) } });
        if (timeslots.length === 0) {
            return res.status(404).json({ message: `No timeslots found for the dentists in ${officeName}` });
        }
        
        res.status(200).json({
            message: "Timeslots retrieved successfully",
            timeslots: timeslots
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error while retrieving timeslots",
            error: error.message,
        });
    }
});

