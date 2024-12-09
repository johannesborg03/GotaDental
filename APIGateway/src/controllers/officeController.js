const { publishMessage } = require('../mqttService');
const { v4: uuidv4 } = require('uuid');

exports.getAllOffices = async (req, res) => {
    const correlationId = uuidv4();
    const topic = 'offices/retrieve';

    console.log('Publishing to topic:', topic, 'with correlationId:', correlationId);

    try {
        const response = await publishMessage(topic, {}, correlationId);

        console.log('Received response from RabbitMQ:', response);

        if (!response.success) {
            return res.status(404).json({
                message: response.error || 'No offices found',
                offices: [],
            });
        }

        res.status(200).json({
            message: 'Offices retrieved successfully',
            offices: response.offices,
        });
    } catch (error) {
        console.error('Error retrieving offices through API Gateway:', error);
        res.status(500).json({
            message: 'Failed to retrieve offices',
            error: error.message,
        });
    }
};


exports.getOfficeById = async (req, res) => {
    const { office_id } = req.params;

    try {
        const response = await axios.get(`http://localhost:3002/api/offices/${office_id}`);
        res.status(200).json({
            message: 'Office details retrieved successfully',
            office: response.data.office,
        });
    } catch (error) {
        console.error('Error retrieving office details:', error.message);
        res.status(500).json({
            message: 'Failed to retrieve office details',
            error: error.message,
        });
    }
};
