const express = require('express');
const router = express.Router();
const officeController = require('../controllers/officeController');

// Route to retrieve all offices
router.get('/offices', officeController.getAllOffices);

// Route to retrieve a specific office by `office_id`
router.get('/offices/:office_id', officeController.getOfficeById);

// Route to create a new office
router.post('/offices', officeController.createOffice);

module.exports = router;

