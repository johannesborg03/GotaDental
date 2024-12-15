const { publishMessage } = require('../mqttService'); // Adjust the path if necessary
const { v4: uuidv4 } = require('uuid');

exports.getAllOffices = async (req, res) => {
    
    console.log('Received office request:', req.body);
    

    const correlationId = uuidv4();
    const topic = 'retrieveAll/offices';

    try{
        console.log('Publishing to topic:', topic);
        const response = await publishMessage(topic, {}, correlationId);

        if (response.error) {
            return res.status(401).json({ message: response.error });
        }
        res.status(200).json({
            message: 'Offices fetched',
            token: response.token,
            offices: response.offices,
        });
    }catch (error) {
        console.error('[Office Service] Error fetching offices:', error);
        res.status(500).json({ message: 'Error fetching offices' });
    }
};

// Controller to retrieve details of a specific office by office_id
exports.getOfficeById = async (req, res) => {
    const { office_id } = req.params;


      // Validate the input
      if (!office_id) {
        return res.status(400).json({ message: 'Missing required field: office_id' });
    }

    const correlationId = uuidv4();
    const topic = `offices/retrieve`;

    try {
        const response = await publishMessage(topic, { office_id }, correlationId);

        if (!response.success) {
            return res.status(404).json({ message: response.error });
        }

        res.status(200).json({
            message: 'Office details retrieved successfully',
            token: response.token,
        });
    } catch (error) {
        console.error('Error retrieving office details:', error);
        res.status(500).json({ message: 'Failed to retrieve office details', error: error.message });
    }
};

// Controller to create a new office
exports.createOffice = async (req, res) => {
    const { office_name, latitude, longitude, dentists, office_address } = req.body;

    // Validate the input
    if (!office_name || !latitude || !longitude || !office_address) {
        return res.status(400).json({ message: 'Missing or invalid required fields' });
    }
    const correlationId = uuidv4();
    const topic = 'offices/create';

    try {

           // Prepare office data
           const officeData = { office_name, latitude, longitude, dentists, office_address };


        // Publish the message to RabbitMQ
        const response = await publishMessage(topic, officeData, correlationId);

        if (!response.success) {
            return res.status(404).json({ message: response?.error || 'Failed to create office' });
        }
        res.status(201).json({message: 'Office created successfully', office: response.office,});
    } catch (error) {
        console.error('Error creating office:', error);
        res.status(500).json({ message: 'Server error during office creation' });
    }
};

exports.getOfficeTimeslots = async (req, res) => {
    const { office_id } = req.params;

    // Validate the input
    if (!office_id) {
        return res.status(400).json({ message: 'Missing required field: office_id' });
    }

    const correlationId = uuidv4();
    const topic = 'offices/timeslots/retrieve';

    try {
        console.log(`Publishing to topic: ${topic} with office_id: ${office_id}`);

        // Publish the message to RabbitMQ
        const response = await publishMessage(topic, { office_id }, correlationId);

        if (!response.success) {
            return res.status(404).json({ message: response.error || 'Timeslots not found for the specified office' });
        }

        res.status(200).json({
            message: 'Office timeslots retrieved successfully',
            timeslots: response.timeslots,
        });
    } catch (error) {
        console.error('Error retrieving office timeslots:', error);
        res.status(500).json({ message: 'Failed to retrieve office timeslots', error: error.message });
    }
};


