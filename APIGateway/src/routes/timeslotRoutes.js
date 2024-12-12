const express = require('express');
const router = express.Router();
const { publishMessage } = require('../mqttService'); // Ensure this is correct
const { v4: uuidv4 } = require('uuid');

// Create a new timeslot for a specific dentist
router.post('/:dentist_username', timeslotController.createTimeslot);

// Retrieve a timeslot by ID
router.get('/timeslots/:office_id/:dentist_username/:timeslot_id', async (req, res) => {
    const { office_id, dentist_username, timeslot_id } = req.params;
    const correlationId = uuidv4();
    const topic = 'timeslots/retrieve';

    try {
        const response = await publishMessage(topic, { office_id, dentist_username, timeslot_id }, correlationId);
        if (!response.success) {
            return res.status(404).json({ message: 'Timeslot not found' });
        }
        res.status(200).json({ message: 'Timeslot retrieved successfully', timeslot: response.timeslot });
    } catch (error) {
        console.error('Error retrieving timeslot:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
