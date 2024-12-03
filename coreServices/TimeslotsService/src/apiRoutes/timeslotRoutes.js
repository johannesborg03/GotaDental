// API routes for Timeslot service

const express = require('express');
const router = express.Router();

const timeslotRoutes = require('../controllers/Timeslots');


router.use('/api/dentists', timeslotRoutes); 
    

module.exports = router;