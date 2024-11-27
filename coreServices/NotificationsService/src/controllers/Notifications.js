const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

var Notification = require('../models/Notification.js');


exports.createNotification = async (req, res) => {
    const { patient_ssn, dentist_username, type, message, appointment_id } = req.body;

    if (!type) {
        return res.status(400).json({ message: 'Notification type is required' });
    }
};




module.exports = router;