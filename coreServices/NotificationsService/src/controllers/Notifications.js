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

//Retrieving all notifications for the specific patient
router.get('/api/notifications/patient/:patient_ssn', async (req, res) => {
    try {
        const { patient_ssn } = req.params;

        const notifications = await Notification.find({ patient_ssn });

        if (notifications.length === 0) {
            return res.status(404).json({ message: "No notifications found for this patient" });
        }

        res.status(200).json({
            message: "Notifications retrieved successfully",
            notifications,
        });
    } catch (error) {
        console.error("Error while retrieving notifications:", error);
        res.status(500).json({
            message: "Server error while retrieving notifications",
            error: error.message,
        });
    }
});


//Get all notifications for a specific dentist
router.get('/api/notifications/dentist/:dentist_username', async (req, res) => {
    try {
        const { dentist_username } = req.params;

        const notifications = await Notification.find({ dentist_username });

        if (notifications.length === 0) {
            return res.status(404).json({ message: "No notifications found for this dentist" });
        }

        res.status(200).json({
            message: "Notifications retrieved successfully",
            notifications,
        });
    } catch (error) {
        console.error("Error while retrieving notifications:", error);
        res.status(500).json({
            message: "Server error while retrieving notifications",
            error: error.message,
        });
    }
});
module.exports = router;