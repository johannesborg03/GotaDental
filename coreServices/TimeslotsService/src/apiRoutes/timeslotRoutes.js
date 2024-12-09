const express = require('express');
const router = express.Router();
const Timeslot = require('../models/Timeslot'); // Ensure this path is correct
const axios = require('axios');

// Create a new timeslot
router.post('/timeslots/create', async (req, res) => {
    const { dentist_username, office_id, date_and_time } = req.body;

    try {
        // Validate input
        if (!dentist_username || !office_id || !date_and_time) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Step 1: Validate the office and dentist association
        const officeServiceURL = process.env.OFFICESERVICE_URL || 'http://localhost:3002/api/offices'; // Adjust the URL
        const officeResponse = await axios.get(`${officeServiceURL}/${office_id}`);

        if (officeResponse.status !== 200 || !officeResponse.data.office) {
            return res.status(404).json({ message: "Office not found" });
        }

        const office = officeResponse.data.office;

        // Ensure the `dentists` field exists and is an array
        if (!office.dentists || !Array.isArray(office.dentists)) {
            console.warn(`Office data received: ${JSON.stringify(office)}`);
            return res.status(400).json({ 
                message: "Invalid office data: 'dentists' field is missing or invalid",
                details: office,
            });
        }

        // Check if the dentist is part of the office
        if (!office.dentists.includes(dentist_username)) {
            return res.status(400).json({ message: "Dentist is not associated with the specified office" });
        }

        // Step 2: Check if the timeslot already exists
        const existingTimeslot = await Timeslot.findOne({
            dentist_username,
            office_id,
            date_and_time,
        });

        if (existingTimeslot) {
            return res.status(409).json({ message: "Timeslot already exists" });
        }

        // Step 3: Create the new timeslot
        const newTimeslot = new Timeslot({
            dentist_username,
            office_id,
            date_and_time,
            timeslot_state: 0, // Default state
        });

        await newTimeslot.save();

        res.status(201).json({ message: "Timeslot created successfully", timeslot: newTimeslot });
    } catch (error) {
        console.error('Error creating timeslot:', error.message || error);
        res.status(500).json({ 
            message: "Internal server error", 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        });
    }
});

module.exports = router;
