const express = require('express');
const router = express.Router();
const officeController = require('../controllers/offices'); 

// Route to retrieve all offices
router.get('/api/offices', officeController.getAllOffices);

module.exports = router;