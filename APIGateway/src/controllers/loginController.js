const { publishMessage } = require('../mqttService');
const { v4: uuidv4 } = require('uuid');

exports.login = async (req, res) => {
    console.log('Received login request:', req.body);
    const { username_ssn, password } = req.body;

    // Validate the input data
    if (!username_ssn || !password ) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Determine whether the input is SSN (12 digits) or username
    const isSSN = /^\d{12}$/.test(username_ssn);
    const topic = isSSN ? 'patients/login' : 'dentists/login';

    const loginData = { identifier: username_ssn, password };
    const correlationId = uuidv4(); // Unique ID for this request

    console.log('Publishing to topic:', topic);
    console.log('Login data:', loginData);

    try {
        // Publish the login request to RabbitMQ
        const response = await publishMessage(topic, loginData, correlationId);

        if (response.error) {
            return res.status(401).json({ message: response.error });
        }

          // If login is successful, return the user token and type
          const result = {
            message: 'Login successful',
            token: response.token,
            userType: isSSN ? 'patient' : 'dentist',
            office: response.office,
            officeId: response.officeId,
            name: response.name,
            email: response.email,
        };

        // Add dentistId only if the userType is dentist
        if (!isSSN) {
            result.dentistId = response.dentistId;
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error handling login request:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};
