const mqtt = require('mqtt');
//const mqttClient = require('../mqttClient.js');
const { publishMessage, setupReplyQueue } = require('../mqttService');
const { v4: uuidv4 } = require('uuid');

// Controller for patient registration
exports.registerPatient = async (req, res) => {
    console.log('Received data:', req.body); // Debug log
    const { ssn, email, name, password } = req.body;

    // Validate the input data
    if (!ssn || !email || !name || !password) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const correlationId = uuidv4(); // Unique ID for this request
    const topic = 'patients/register';

    // Prepare the message for the RabbitMQ broker
    const patientData = { ssn, email, name, password };

    try {
        // Publish the message to the topic (exchange)
        const response = await publishMessage(topic, patientData, correlationId);
        
        if (response.error) {
            
            return res.status(400).json({ message: response.error });
        }

       res.status(201).json({ message: 'Patient registered successfully', data: response });
    } catch (error) {
        console.error('Error handling patient registration:', error);
        res.status(500).json({ message: 'Server error while registering patient' });
    }
};
