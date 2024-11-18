var express = require('express');
const router = express.Router();
var Timeslot = require('../models/timeslot.js'); // Gets red when its a big T
// var Dentist = require('../models/Dentist.js'); 
var Office = require('../models/Office.js'); 

const mongoose = require('mongoose');

// Create a new timeslot for a specific dentist
router.post('/api/timeslots/:dentist_id/timeslot', async function (req, res) {
    try {

        const dentistID = req.params.dentist_id; 

        // Find the dentinst by dentist_id
        const dentist = await Dentist.findOne({dentist_id: dentistID });
        if (!dentist) {
            return res.status(404).json({ message: "Dentist not found" });
        }

        // Create a new timeslot
        var timeslot = new Timeslot({
            timeslot_id: req.body.timeslot_id, 
            date_and_time: req.body.date_and_time,
            dentist_id: dentistID,  
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
    } catch (error) {
        console.error("Error while creating timeslot:", err);  
        res.status(500).json({
            message: "Server error while creating timeslot",
            error: error.message
        });
    }
});

// Get all timeslots for dentist in a specific office 
router.get('/api/timeslot/:office_id/timeslots', async function (req, res) {
    try {
        // Find the office by the office_id
        const office = await Office.findOne({ office_id: req.params.office_id });
        if (!office) {
            return res.status(404).json({ message: "Office not found" });
        }

        const dentistIds = office.dentists;
        if (!dentistIds || dentistIds.length === 0) {
            return res.status(404).json({ message: "No dentists found in this office" });
        }

        //Find all timeslots for a dentist
        const timeslots = await Timeslot.find({ dentist_id: { $in: dentistIds } });
        if (timeslots.length === 0) {
            return res.status(404).json({ message: "No timeslots found for the dentists" });
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

// Get a specific timeslot for a dentist in a specific office
router.get('/api/timeslots/:office_id/:dentist_id/:timeslot_id', async function (req, res) {
    try {
        // Find the office by the office_id
        const office = await Office.findOne({ office_id: req.params.office_id });
        if (!office) {
            return res.status(404).json({ message: "Office not found" });
        }

        // Check if the dentist is part of the office
        if (!office.dentists.includes(req.params.dentist_id)) {
            return res.status(404).json({ message: "Dentist not found in this office" });
        }

        // Find the specific timeslot for the dentist
        const timeslot = await Timeslot.findOne({
            _id: req.params.timeslot_id,
            dentist_id: req.params.dentist_id
        });

        if (!timeslot) {
            return res.status(404).json({ message: "Timeslot not found for this dentist" });
        }

        res.status(200).json({
            message: "Timeslot retrieved successfully",
            timeslot: timeslot
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error while retrieving the timeslot",
            error: error.message,
        });
    }
});

// Update a timeslot for a dentist in a specific office 
router.put('/api/timeslots/:office_id/:dentist_id/:timeslot_id', async function (req, res) {
    try {
        const office = await Office.findOne({ office_id: req.params.office_id });
        if (!office) {
            return res.status(404).json({ message: "Office not found" });
        }

         // Check if the dentist is part of the office
         if (!office.dentists.includes(req.params.dentist_id)) {
            return res.status(404).json({ message: "Dentist not found in this office" });
        }

        const updatedTimeslot = await Timeslot.findOneAndUpdate(
            { timeslot_id: req.params.timeslot_id, dentist_id: req.params.dentist_id },req.body,{ new: true, runValidators: true }
        );

        if (!updatedTimeslot) {
            return res.status(404).json({ message: "Timeslot not found" });
        }

        res.status(200).json({
            message: "Timeslot updated successfully",
            timeslot: updatedTimeslot
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error while updating timeslot",
            error: error.message,
        });
    }
});


// Delete a timeslot for a dentist in a specific office 
router.delete('/api/timeslots/:office_id/:dentist_id/:timeslot_id', async function (req, res) {
    try {
        const office = await Office.findOne({ office_id: req.params.office_id });
        if (!office) {
            return res.status(404).json({ message: "Office not found" });
        }

         // Check if the dentist is part of the office
         if (!office.dentists.includes(req.params.dentist_id)) {
            return res.status(404).json({ message: "Dentist not found in this office" });
        }

        const deletedTimeslot = await Timeslot.findOneAndDelete({timeslot_id: req.params.timeslot_id,dentist_id: req.params.dentist_id});

        if (!deletedTimeslot) {
            return res.status(404).json({ message: "Timeslot not found" });
        }

        res.status(200).json({
            message: "Timeslot deleted successfully",
            timeslot: deletedTimeslot
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error while deleting timeslot",
            error: error.message,
        });
    }
});

module.exports = router;