var express = require ('express');
var router = express.Router();
//const Dentist = require('../models/Dentist');
//var { publishMessage } = require('../events/publisher');


const Dentist = require('../models/Dentist'); // Import the Dentist model

// Create new Dentist (POST):


router.post('/api/dentists', async function (req, res) {
    try {
        var dentist = new Dentist({
            dentist_username: req.body.dentist_username,
            password: req.body.password,
            name : req.body.name,
            email: req.body.email,
            date_of_birth : req.body.date_of_birth,
            appointments : req.body.appointments,
            timeslots : req.body.timeslots,
        });

        const savedDentist = await dentist.save();
        res.status(201).json({
            message : "Dentist Created Successfully",
            dentist: dentist
        });
    } catch (err) {
        console.error("Error while creating dentist:", err);  // Log the error for debugging
        if (err.code ===11000) {
            let duplicateField = Object.keys(err.keyValue)[0];
            return res.status(400).json({
                message : `A dentist with the same ${duplicateField} already exist`,
                field : duplicateField
            });
        }
        res.status(500).json({
            message : "Server error while creating dentist",
            error : err.message
        });
    }
});

// Register a new time slot for a dentist and publish it to RabbitMQ
router.post('/:dentist_id/slots', async (req, res) => {
    try {
        const { dentist_id } = req.params;
        const { date, time } = req.body;

        if (!date || !time) {
            return res.status(400).json({ message: 'Date and time are required' });
        }

        const slotDetails = { dentist_id, date, time };

        // Publish the slot to RabbitMQ
        await publishMessage('slots/update', slotDetails);

        res.status(200).json({ message: 'Slot published successfully', slot: slotDetails });
    } catch (err) {
        console.error('Error while publishing slot:', err);
        res.status(500).json({ message: 'Error publishing slot', error: err.message });
    }
});

// GET all dentists
router.get('/api/dentists', async (req, res) => {
    try {
        const dentists = await Dentist.find();  // Fetch all dentists from the database
        res.status(200).json(dentists);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching dentists', error: error.message });
    }
});

// DELETE all dentists
router.delete('/api/dentists', async (req, res) => {
    try {
        const result = await Dentist.deleteMany();  // Delete all dentists from the database
        res.status(200).json({ message: 'All dentists deleted successfully', result });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting dentists', error: error.message });
    }
});

// PUT to update a dentist by dentist_id
router.put('/api/dentists/:dentist_username', async (req, res) => {
    try {
        const updatedDentist = await Dentist.findOneAndUpdate(
            { dentist_username: req.params.dentist_username },  // Find dentist by username
            {
                password: req.body.password,
                name: req.body.name,
                email: req.body.email,
                date_of_birth: req.body.date_of_birth,
                appointments : req.body.appointments, //optional
                timeslots: req.body.timeslots,    // Optional
            },
            { new: true }  // Return the updated document
        );

        if (!updatedDentist) {
            return res.status(404).json({ message: 'Dentist not found' });
        }

        res.status(200).json({ message: 'Dentist updated successfully', dentist: updatedDentist });
    } catch (error) {
        res.status(500).json({ message: 'Error updating dentist', error: error.message });
    }
});

// PATCH to update a dentist by dentist_id
router.patch('/api/dentists/:dentist_username', async (req, res) => {
    try {
        const updatedDentist = await Dentist.findOneAndUpdate(
            { dentist_username: req.params.dentist_username },  // Find dentist by dentist_id
            req.body,  // Only update the fields provided in the request body
            { new: true }  // Return the updated document
        );

        if (!updatedDentist) {
            return res.status(404).json({ message: 'Dentist not found' });
        }

        res.status(200).json({ message: 'Dentist updated successfully', dentist: updatedDentist });
    } catch (error) {
        res.status(500).json({ message: 'Error updating dentist', error: error.message });
    }
});

module.exports = router;