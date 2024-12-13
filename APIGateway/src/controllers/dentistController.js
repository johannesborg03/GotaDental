const mqtt = require('mqtt');
const { publishMessage, setupReplyQueue } = require('../mqttService');
const { v4: uuidv4 } = require('uuid');

exports.registerDentist = async (req, res) => {
    console.log('Received dentist data:', req.body);
    const { name, username, email} = req.body;

    // Validate the input data
    if (!name || !username || !email || !password)  {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const correlationId = uuidv4(); // Unique ID for this request
    const topic = 'dentists/register';

    // Prepare the message for the RabbitMQ broker
    const dentistData = { name, username, email, password };

    try {
        // Publish the message to the topic (exchange)
        const response = await publishMessage(topic, dentistData, correlationId);

        if (response.error) {
            return res.status(400).json({ message: response.error });
        }

        res.status(201).json({ message: 'Dentist registered successfully', data: response });
    } catch (error) {
        console.error('Error handling dentist registration:', error);
        res.status(500).json({ message: 'Server error while registering dentist' });
    }
};