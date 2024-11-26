const mqtt = require('mqtt');
//const mqttClient = require('../mqttClient.js');
const { publishMessage } = require('../mqttService'); // Adjust the path to your RabbitMQ module

// Controller for patient registration
exports.registerPatient = async (req, res) => {
    console.log('Received data:', req.body); // Debug log
    const { ssn, email, name, password } = req.body;

    // Validate the input data
    if (!ssn || !email || !name || !password) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Prepare the message for the RabbitMQ broker
    const patientData = { ssn, email, name, password };

    try {
        // Publish the message to the topic (exchange)
        await publishMessage('patients/register', patientData);
        console.log('Published patient registration message:', patientData);
        res.status(200).json({ message: 'Patient registration request sent successfully' });
    } catch (error) {
        console.error('Failed to publish patient registration:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
