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

exports.getPatientBySSN = async (req, res) => {
    console.log('Received SSN request:', req.params); // Debug log
 
 
    const { patient_ssn } = req.params;
 
 
    // Validate the input data
    if (!patient_ssn) {
        return res.status(400).json({ message: 'Missing required SSN parameter' });
    }
 
 
    const correlationId = uuidv4(); // Unique ID for this request
    const topic = 'patients/getBySSN';
 
 
    // Prepare the message for the RabbitMQ broker
    const messageData = { patient_ssn };
 
 
    try {
        // Publish the message to the topic (exchange)
        const response = await publishMessage(topic, messageData, correlationId);
 
 
        if (response.error) {
            return res.status(404).json({ message: response.error });
        }
 
 
        res.status(200).json({
            message: 'Patient retrieved successfully',
            patient: response
        });
    } catch (error) {
        console.error('Error handling get patient by SSN:', error);
        res.status(500).json({ message: 'Server error while retrieving patient' });
    }
 }; 