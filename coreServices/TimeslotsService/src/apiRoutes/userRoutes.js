// API routes for Timeslot service

const express = require('express');
const router = express.Router();

// Import the Dentist and Patient controllers
const timeslotRoutes = require('../controllers/Timeslots');

// using the routes for the Dentist and Patient API
router.use('/api/dentists', timeslotRoutes); 
    

module.exports = router;