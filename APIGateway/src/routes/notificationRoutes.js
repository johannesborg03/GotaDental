const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController'); // Import the controller

// Route for  notifications 
router.post('/', notificationController.sendNotification );

module.exports = router;