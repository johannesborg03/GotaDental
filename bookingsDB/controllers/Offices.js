const express = require('express');
const router = express.Router();
const Office = require('../models/Office');
const Timeslot = require('../models/timeslot'); // not cap
const Dentist = require('../models/Dentist');

// Get all offices with location data
router.get('/api/offices', async function (req, res) {
    try {
        const offices = await Office.find({}, 'office_id office_name latitude longitude');
        res.status(200).json({
            message: "Offices retrieved successfully",
            offices: offices
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error while retrieving offices",
            error: error.message
        });
    }
});


module.exports = router;