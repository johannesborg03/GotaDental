const { publishMessage } = require('../mqttService'); // Adjust the path if necessary
const { v4: uuidv4 } = require('uuid');

exports.getAllOffices = async (req, res) => {
    console.log("GET /api/offices called");
    res.status(200).json({ message: "Test response" });
    try {
        const offices = await Office.find({});
        console.log('[Office Service] Offices retrieved:', offices);

        res.status(200).json({ offices });
    } catch (error) {
        console.error('[Office Service] Error fetching offices:', error);
        res.status(500).json({ message: 'Error fetching offices' });
    }
};

// Controller to retrieve details of a specific office by office_id
exports.getOfficeById = async (req, res) => {
    const { office_id } = req.params;
    const correlationId = uuidv4();
    const topic = `offices/${office_id}/retrieve`;

    try {
        const response = await publishMessage(topic, { office_id }, correlationId);

        if (!response.success) {
            return res.status(404).json({ message: response.error });
        }

        res.status(200).json({
            message: 'Office details retrieved successfully',
            office: response.office,
        });
    } catch (error) {
        console.error('Error retrieving office details:', error);
        res.status(500).json({ message: 'Failed to retrieve office details', error: error.message });
    }
}

// Controller to create a new office
exports.createOffice = async (req, res) => {
    const { office_id, office_name, latitude, longitude, dentists } = req.body;

    // Validate the input
    if (!office_id || !office_name || !latitude || !longitude || !dentists) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const correlationId = uuidv4();
    const topic = 'offices/create';

    try {
        // Publish the message to RabbitMQ
        const response = await publishMessage(
            topic,
            { office_id, office_name, latitude, longitude, dentists },
            correlationId
        );

        if (!response || !response.success) {
            return res.status(409).json({ message: response?.error || 'Failed to create office' });
        }

        res.status(201).json({
            message: 'Office created successfully',
            office: response.office,
        });
    } catch (error) {
        console.error('Error creating office:', error);
        res.status(500).json({ message: 'Server error during office creation' });
    }
}
