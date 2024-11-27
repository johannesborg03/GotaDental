const { publishMessage } = require('../mqttService');
const { v4: uuidv4 } = require('uuid');

// Controller to retrieve all offices with location data
exports.getAllOffices = async (req, res) => {
    const correlationId = uuidv4();
    const topic = 'office/retrieveAll';

    try {
        const response = await publishMessage(topic, {}, correlationId);

        if (response.length === 0) {
            return res.status(404).json({
                message: "No offices found",
                offices: []
            });
        }

        res.status(200).json({
            message: 'Offices retrieved successfully',
            offices: response,
        });
    } catch (error) {
        console.error('Error publishing to MQTT:', error);
        res.status(500).json({
            message: 'Failed to retrieve offices',
            error: error.message,
        });
    }
};