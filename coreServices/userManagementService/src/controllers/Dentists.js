var express = require ('express');
var router = express.Router();



var Dentist = require('../models/Dentist');
// Create new Dentist (POST):


router.post('/api/dentists', async function (req, res) {
    try {
        var dentist = new Dentist({
            dentist_id: req.body.dentist_id,
            name : req.body.name,
            email: req.body.email,
            date_of_birth : req.body.date_of_birth,
            booking_id : req.body.booking_id,
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
            error : error.message
        });
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
router.put('/:dentist_id', async (req, res) => {
    try {
        const updatedDentist = await Dentist.findOneAndUpdate(
            { dentist_id: req.params.dentist_id },  // Find dentist by dentist_id
            {
                name: req.body.name,
                email: req.body.email,
                date_of_birth: req.body.date_of_birth,
                booking_id: req.body.booking_id,  // Optional
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

module.exports = router;