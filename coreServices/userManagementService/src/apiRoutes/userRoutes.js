// API routes for User service

const express = require('express');
const router = express.Router();

// Import the Dentist and Patient controllers
const dentistRoutes = require('../controllers/Dentists');
const patientRoutes = require('../controllers/Patients');

// using the routes for the Dentist and Patient API
router.use('/api/dentists', dentistRoutes); 
router.use('/patients', patientRoutes); 

module.exports = router;