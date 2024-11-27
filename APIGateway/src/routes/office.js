const express = require('express');
const router = express.Router();
const officeController = require('../controllers/offices'); 

// Route to retrieve all offices 
router.get('/api/offices', officeController.getAllOffices);

// Route to retrieve details of a specific office by office_id
router.get('/api/offices/:office_id', officeController.getOfficeById);

module.exports = router;