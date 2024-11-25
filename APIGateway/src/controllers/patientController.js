const mqtt = require('mqtt');

// Connect to the MQTT broker
const mqttClient = mqtt.connect('mqtt://localhost:1883');

mqttClient.on('connect', () => {
    console.log('API Gateway connected to MQTT broker');
});

// Controller for patient registration
exports.registerPatient = (req, res) => {
    const { ssn, email, name, password } = req.body;

    // Validate the input data
    if (!ssn || !email || !name || !password) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Prepare the message for the MQTT broker
    const patientData = { ssn, email, name, password };

    // Publish the message to the broker
    mqttClient.publish('patients/register', JSON.stringify(patientData), (err) => {
        if (err) {
            console.error('Failed to publish registration message:', err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        console.log('Published patient registration message:', patientData);
        res.status(200).json({ message: 'Patient registration request sent successfully' });
    });
};
