const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController'); // Adjust the path if necessary

router.post('/login', loginController.login);

module.exports = router;