var express = require('express');
var router = express.Router();
const Patient = require('../models/Patient');

var { subscribeToTopic } = require('../events/subscriber');

// Create new patient (POST):
router.post('/api/patients', async function (req, res) {
    try {
        var patient = new Patient({
            patient_ssn: req.body.patient_ssn,
            password: req.body.password,
            name: req.body.name,
            email: req.body.email,
            notified: req.body.notified,
            appointments: req.body.appointments
        });

        const savedPatient = await patient.save();
        res.status(201).json({
            message: "Patient Created Successfully",
            patient: patient
        });
    } catch (err) {
        console.error("Error while creating patient:", err);  // Log the error for debugging
        if (err.code === 11000) {
            let duplicateField = Object.keys(err.keyValue)[0];
            return res.status(400).json({
                message: `A patient with the same ${duplicateField} already exist`,
                field: duplicateField
            });
        }
        res.status(500).json({
            message: "Server error while creating patient",
            error: err.message
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

router.get('/api/patients/:patientSSN/timeslots', async (req, res) => {
    const { patientSSN } = req.params;
    try {
        const patient = await Patient.findOne({ patient_ssn: patientSSN }).populate('appointments');
        if (!patient) return res.status(404).json({ message: 'Patient not found' });
        res.status(200).json({ timeslots: patient.appointments });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching booked timeslots', error });
    }
});


// Subscribe to the slot updates
router.get('/api/slots', async (req, res) => {
    try {
        const slots = [];
        await subscribeToTopic('slots/update', (message) => {
            slots.push(message);
        });

        res.status(200).json(slots);
    } catch (err) {
        console.error('Error while subscribing to slots:', err);
        res.status(500).json({ message: 'Error fetching slots', error: err.message });
    }
});

// Get Patient by SSN
router.get('/api/patients/:patient_ssn', async (req, res) => {
    try {
        const { patient_ssn } = req.params;

        // Find the specific patient by their SSN
        const patient = await Patient.findOne({
            patient_ssn: patient_ssn 
        });

        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        res.status(200).json({
            message: "Patient retrieved successfully",
            patient: patient
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error while retrieving the patient",
            error: error.message,
        });
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

// PUT to update a patient with patient ssn
router.put('/api/patients/:patient_ssn', async (req, res) => {
    try {
        const updatedPatient = await Patient.findOneAndUpdate(
            { patient_ssn: req.params.patient_ssn },  // Find patient by patient_ssn
            {
                name: req.body.name,
                password: req.body.password,
                email: req.body.email,
                notified: req.body.notified,
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

// PATCH to update a patient by patient_id
router.patch('/api/patients/:patient_ssn', async (req, res) => {
    try {
        const updatedPatient = await Patient.findOneAndUpdate(
            { patient_ssn: req.params.patient_ssn },  // Find patient by patient_ssn
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

// DELETE a patient by SSN
router.delete('/api/patients/:patient_ssn/delete', async (req, res) => {
    try {
        const patientSSN = req.params.patient_ssn;
        const deletedPatient = await Patient.findOneAndDelete({ patient_ssn: patientSSN });

        if (!deletedPatient) {
            return res.status(404).json({ message: `Patient with SSN '${patientSSN}' not found.` });
        }
        const deletedPatientId = deletedPatient._id;

        res.status(200).json({
            message: `Patient with SSN '${patientSSN}' deleted successfully.`,
            deletedPatientId: deletedPatientId,
            deletedPatient: deletedPatient
        });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting patient', error: error.message });
    }
});

module.exports = router;