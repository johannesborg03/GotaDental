const express = require('express');
const router = express.Router();
const Office = require('../models/Office');
// const Dentist = require('../models/Dentist');

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

// Get basic details for a specific office
router.get('/api/offices/:office_id', async function (req, res) {
    try {
        const office = await Office.findOne({ office_id: req.params.office_id }).populate('dentist_id', 'name'); 

        if (!office) {
            return res.status(404).json({ message: "Office not found" });
        }

        res.status(200).json({
            message: "Office details retrieved successfully",
            office: {
                office_id: office.office_id,
                office_name: office.office_name,
                office_address: office.office_address,
                dentist_name: office.dentist_id.name
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error while retrieving office details",
            error: error.message
        });
    }
});

module.exports = router;