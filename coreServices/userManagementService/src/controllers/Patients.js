var express = require ('express');
var router = express.Router();



var Patient = require('../models/Patient');
// Create new patient (POST):


router.post('/api/patients', async function (req, res) {
    try {
        var patient = new Patient({
            patient_username: req.body.dentist_id,
            password: req.body.password,
            name : req.body.name,
            email: req.body.email,
            notified : req.body.notified,
            booking_id : req.body.booking_id,
            appointments : req.body.appointments
        });

        const savedPatient = await patient.save();
        res.status(201).json({
            message : "Patient Created Successfully",
            patient: patient
        });
    } catch (err) {
        console.error("Error while creating patient:", err);  // Log the error for debugging
        if (err.code ===11000) {
            let duplicateField = Object.keys(err.keyValue)[0];
            return res.status(400).json({
                message : `A patient with the same ${duplicateField} already exist`,
                field : duplicateField
            });
        }
        res.status(500).json({
            message : "Server error while creating dentist",
            error : error.message
        });
    }
});
// GET all patients
router.get('/api/patients', async (req, res) => {
    try {
        const patients = await Patient.find();  // Fetch all patients from the database
        res.status(200).json(patients);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching patients', error: error.message });
    }
});

// DELETE all patients
router.delete('/api/patients', async (req, res) => {
    try {
        const result = await Patient.deleteMany();  // Delete all patients from the database
        res.status(200).json({ message: 'All patients deleted successfully', result });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting patients', error: error.message });
    }
});

// PUT to update a dentist by dentist_id
router.put('/api/patients/:patient_username', async (req, res) => {
    try {
        const updatedPatient = await Patient.findOneAndUpdate(
            { patient_id: req.params.patient_username },  // Find patient by patient_id
            {
                name: req.body.name,
                password: req.body.password,
                email: req.body.email,
                notified : req.body.notified,
                booking_id: req.body.booking_id,  // Optional
                appointments: req.body.appointments,    // Optional
            },
            { new: true }  // Return the updated document
        );

        if (!updatedPatient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        res.status(200).json({ message: 'Patient updated successfully', patient: updatedPatient });
    } catch (error) {
        res.status(500).json({ message: 'Error updating patient', error: error.message });
    }
});

// PATCH to update a dentist by dentist_id
router.patch('/api/patients/:patient_username', async (req, res) => {
    try {
        const updatedPatient = await Patient.findOneAndUpdate(
            { patient_username: req.params.patient_username },  // Find patient by patient_id
            req.body,  // Only update the fields provided in the request body
            { new: true }  // Return the updated document
        );

        if (!updatedPatient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        res.status(200).json({ message: 'Patient updated successfully', patient: updatedPatient });
    } catch (error) {
        res.status(500).json({ message: 'Error updating patient', error: error.message });
    }
});

module.exports = router;