const express = require('express');
const router = express.Router();

var Office = require('../models/Office'); // Import the Office model

// Get all offices with location data
router.get('/api/offices', async function (req, res) {
    try {
        const offices = await Office.find({}, 'office_id office_name latitude longitude');

        if (offices.length === 0) {
            return res.status(404).json({
                message: "No offices found",
                offices: []
            });
        }
        
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
        const office = await Office.findOne({ office_id: req.params.office_id })
            .populate('dentist_username', 'name username');

        if (!office) {
            return res.status(404).json({ message: "Office not found" });
        }

        // Ensure dentist_username is properly populated
        const dentist = office.dentist_username || {};
        res.status(200).json({
            message: "Office details retrieved successfully",
            office: {
                office_id: office.office_id,
                office_name: office.office_name,
                office_address: office.office_address,
                dentist_name: dentist.name || "N/A", // Default value if dentist is undefined
                latitude: office.latitude,
                longitude: office.longitude,
            },
        });
    } catch (error) {
        console.error("Error retrieving office details:", error);
        res.status(500).json({
            message: "Server error while retrieving office details",
            error: error.message,
        });
    }
});



module.exports = router;