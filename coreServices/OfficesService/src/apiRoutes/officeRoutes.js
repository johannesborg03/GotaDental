const express = require('express');
const router = express.Router();
const officeController = require('../controllers/Offices');

// Route to fetch all offices
router.get('/offices', officeController.getAllOffices);

// Route to fetch a specific office by office ID
router.get('/offices/:office_id', officeController.getOfficeById);

module.exports = router;

