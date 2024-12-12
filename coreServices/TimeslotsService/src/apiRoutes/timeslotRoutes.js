const express = require('express');
const router = express.Router();
const Timeslot = require('../models/Timeslot'); // Ensure this path is correct
const axios = require('axios');
/*
// Create a new timeslot
router.post('/timeslots/create', async (req, res) => {
    const { dentist_username, office_id, date_and_time } = req.body;

    try {
        // Step 1: Validate office and dentist association
        const officeServiceURL = process.env.OFFICESERVICE_URL || 'http://localhost:3002/api/offices';
        const officeResponse = await axios.get(`${officeServiceURL}/${office_id}`);
        
        if (officeResponse.status !== 200 || !officeResponse.data.office) {
            return res.status(404).json({ message: "Office not found" });
        }

        const office = officeResponse.data.office;

        if (!office.dentists.includes(dentist_username)) {
            return res.status(400).json({ message: "Dentist is not associated with the specified office" });
        }

        // Step 2: Check if the timeslot already exists
        const existingTimeslot = await Timeslot.findOne({
            office_id,
            dentist_username,
            date_and_time,
        });

        if (existingTimeslot) {
            return res.status(409).json({ message: "Timeslot already exists" });
        }

        // Step 3: Create new timeslot
        const newTimeslot = new Timeslot({
            timeslot_id: `${office_id}-${dentist_username}-${date_and_time}`,
            office_id,
            dentist_username,
            date_and_time,
            timeslot_state: 0,
        });

        await newTimeslot.save();

        res.status(201).json({
            message: "Timeslot created successfully",
            timeslot: newTimeslot,
        });
    } catch (error) {
        console.error('Error creating timeslot:', error.message || error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});
*/ 
module.exports = router;
