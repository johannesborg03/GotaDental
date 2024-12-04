const mqtt = require('mqtt');
const { publishMessage, setupReplyQueue } = require('../mqttService');
const { v4: uuidv4 } = require('uuid');

exports.registerDentist = async (req, res) => {
    console.log('Received dentist data:', req.body);
    const { name, username, email, date_of_birth, password } = req.body;

    // Validate the input data
    if (!name || !username || !email || !date_of_birth || !password)  {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const correlationId = uuidv4(); // Unique ID for this request
    const topic = 'dentists/register';

    // Prepare the message for the RabbitMQ broker
    const dentistData = { name, username, email, date_of_birth, password };

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

// API Gateway Route to handle registering a dentist's time slot
exports.registerTimeSlot = async (req, res) => {
    console.log('Received time slot data:', req.body);
    const { dentist_username } = req.params;
    const { date_and_time } = req.body;

    
    if (!date_and_time) {
        return res.status(400).json({ message: 'Missing required field: date_and_time' });
    }

    const correlationId = uuidv4(); 
    const topic = 'dentists/slot/post'; 

    const slotDetails = { dentist_username, date_and_time };

    try {
        const response = await publishMessage(topic, slotDetails, correlationId);

        if (response.error) {
            return res.status(400).json({ message: response.error });
        }
        res.status(200).json({ message: 'Time slot registered successfully', slot: slotDetails });
    } catch (error) {
        console.error('Error handling time slot registration:', error);
        res.status(500).json({ message: 'Server error while registering time slot' });
    }
};