var express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

var Timeslot = require('../models/Timeslot.js'); 
//var Dentist = require('../../../userManagementService/src/models/Dentist.js');
//var Office = require('../../../OfficesService/src/models/Office.js')


// Create a new timeslot for a specific dentist
router.post('/api/timeslots/:dentist_username/timeslot', async function (req, res) {
    try {

        const dentistID = req.params.dentist_username; 

        // Find the dentinst by dentist_username
        const dentist = await Dentist.findOne({dentist_username :dentist_username });
        if (!dentist) {
            return res.status(404).json({ message: "Dentist not found" });
        }

        // Create a new timeslot
        var timeslot = new Timeslot({
            timeslot_id: req.body.timeslot_id, 
            date_and_time: req.body.date_and_time,
            dentist_username: dentist_username,  
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


router.post('/api/timeslots', async function (req, res) {
    try {
        const { dentist_username, office_id, date_and_time } = req.body;

        if (!dentist_username || !office_id || !date_and_time) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Validation to see if dentist belongs to the office
        const office = await Office.findOne({ _id: office_id, dentists: dentist_username });
        if (!office) {
            return res.status(400).json({ message: "Dentist is not associated with the office" });
        }
        
    } catch (error) {
        console.error("Error while creating timeslot:", error);
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
        const timeslots = await Timeslot.find({ dentist_username: { $in: dentistIds } });
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
router.get('/api/timeslots/:office_id/:dentist_username/:timeslot_id', async function (req, res) {
    try {
        // Find the office by the office_id
        const office = await Office.findOne({ office_id: req.params.office_id });
        if (!office) {
            return res.status(404).json({ message: "Office not found" });
        }

        // Check if the dentist is part of the office
        if (!office.dentists.includes(req.params.dentist_username)) {
            return res.status(404).json({ message: "Dentist not found in this office" });
        }

        // Find the specific timeslot for the dentist
        const timeslot = await Timeslot.findOne({
            _id: req.params.timeslot_id,
            dentist_username: req.params.dentist_username
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
router.put('/api/timeslots/:office_id/:dentist_username/:timeslot_id', async function (req, res) {
    try {
        const office = await Office.findOne({ office_id: req.params.office_id });
        if (!office) {
            return res.status(404).json({ message: "Office not found" });
        }

         // Check if the dentist is part of the office
         if (!office.dentists.includes(req.params.dentist_username)) {
            return res.status(404).json({ message: "Dentist not found in this office" });
        }

        const updatedTimeslot = await Timeslot.findOneAndUpdate(
            { timeslot_id: req.params.timeslot_id, dentist_id: req.params.dentist_username },req.body,{ new: true, runValidators: true }
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
router.delete('/api/timeslots/:office_id/:dentist_username/:timeslot_id', async function (req, res) {
    try {
        const office = await Office.findOne({ office_id: req.params.office_id });
        if (!office) {
            return res.status(404).json({ message: "Office not found" });
        }

         // Check if the dentist is part of the office
         if (!office.dentists.includes(req.params.dentist_username)) {
            return res.status(404).json({ message: "Dentist not found in this office" });
        }

        const deletedTimeslot = await Timeslot.findOneAndDelete({timeslot_id: req.params.timeslot_id,dentist_username: req.params.dentist_username});

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