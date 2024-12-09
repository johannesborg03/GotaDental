const express = require('express');
const router = express.Router();
const Office = require('../models/Office'); // Import the Office model

// Endpoint to fetch all offices
router.get('/offices', async (req, res) => {
    try {
        const offices = await Office.find({}, 'office_id office_name latitude longitude');

        if (offices.length === 0) {
            return res.status(404).json({
                message: "No offices found",
                offices: [],
            });
        }

        res.status(200).json({
            message: "Offices retrieved successfully",
            offices,
        });
    } catch (error) {
        console.error('Error retrieving offices:', error);
        res.status(500).json({
            message: "Server error while retrieving offices",
            error: error.message,
        });
    }
});

// Endpoint to fetch a specific office by ID
router.get('/api/offices/:office_id', async (req, res) => {
    try {
        // Retrieve the office by office_id
        const office = await Office.findOne({ office_id: req.params.office_id });

        if (!office) {
            return res.status(404).json({ message: "Office not found" });
        }

        // Fetch dentist details from the dentist_database
        const dentistDetails = await Dentist.find({
            dentist_username: { $in: office.dentists },
        }).select('name dentist_username -_id'); // Select only name and username

        res.status(200).json({
            message: "Office details retrieved successfully",
            office: {
                office_id: office.office_id,
                office_name: office.office_name,
                latitude: office.latitude,
                longitude: office.longitude,
                dentists: dentistDetails.length > 0 ? dentistDetails : "No dentists available", // Handle no dentists
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
