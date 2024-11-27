const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

var Notification = require('../models/Notification.js');


exports.createNotification = async (req, res) => {
    const { patient_ssn, dentist_username, type, message, appointment_id } = req.body;

    if (!type) {
        return res.status(400).json({ message: 'Notification type is required' });
    }

    try {
        const notification = new Notification({
            patient_ssn,
            dentist_username,
            type,
            message,
            appointment_id,
        });

        const savedNotification = await notification.save();
        res.status(201).json({
            message: 'Notification created successfully',
            notification: savedNotification,
        });
    } catch (err) {
        console.error('Error creating notification:', err.message);
        res.status(500).json({
            message: 'Server error while creating notification',
            error: err.message,
        });
    }
};




module.exports = router;