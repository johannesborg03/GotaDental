const express = require('express');
const router = express.Router();
const dentistController = require('../controllers/dentistController'); // Import the controller

// Route for dentist registration
router.post('/', dentistController.registerDentist);

module.exports = router;