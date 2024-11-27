const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

var Notification = require('../models/Notification');

//Creating new notifications
router.post('/api/notifications', async (req, res) => {
    try {
        const { patient_ssn, dentist_username, type, message, appointment_id } = req.body;

        // Validate required fields
        if (!type) {
            return res.status(400).json({ message: "Notification type is required" });
        }

        // Creating the new notification
        const newNotification = new Notification({
            patient_ssn,
            dentist_username,
            type,
            message: message || "", 
            appointment_id,
        });

        // Save the notification to the database
        await newNotification.save();

        res.status(201).json({
            message: "Notification created successfully",
            notification: newNotification
        });
    } catch (error) {
        console.error("Error while creating notification:", error);
        res.status(500).json({
            message: "Server error while creating notification",
            error: error.message
        });
    }
});



module.exports = router;