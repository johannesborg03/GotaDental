const express = require('express');
const router = express.Router();
const timeslotController = require('../controllers/timeslots');

// Define POST route for timeslot actions
router.post('/:username', timeslotController.registerSlot);

module.exports = router;