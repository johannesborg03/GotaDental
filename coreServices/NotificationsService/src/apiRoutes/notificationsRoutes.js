const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/Notifications'); // Import the controller

// Route to create a new notification
//router.post('/api/notifications', notificationController.createNotification);

// Route to retrieve all notifications for a specific patient
//router.get('/api/notifications/patient/:patient_ssn', notificationController.getNotificationsForPatient);

// Route to retrieve all notifications for a specific dentist
//router.get('/api/notifications/dentist/:dentist_username', notificationController.getNotificationsForDentist);

// Route to retrieve a specific notification
//router.get('/api/notifications/:notification_id', notificationController.getNotificationById);

// Route to delete a specific notification
//router.delete('/api/notifications/:notification_id', notificationController.deleteNotification);

module.exports = router;
