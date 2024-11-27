const mqtt = require('mqtt');
const { publishMessage } = require('../mqttService');
const { v4: uuidv4 } = require('uuid');

exports.registerDentist = async (req, res) => {
    console.log('Received dentist data:', req.body); 
    const { ssn, email, name, password } = req.body;

    // Validate the input data
    if (!ssn || !email || !name || !password) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
}