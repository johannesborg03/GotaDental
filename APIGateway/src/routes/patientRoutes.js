const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController'); // Import the controller

// Route for patient registration
router.post('/patients', patientController.registerPatient);

module.exports = router;