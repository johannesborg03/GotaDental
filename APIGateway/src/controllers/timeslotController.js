const { publishMessage } = require('../mqttService');
const { v4: uuidv4 } = require('uuid');

// Controller to create a new timeslot
exports.createTimeslot = async (req, res) => {
        //const { date_and_time, dentist_username, office_id } = req.body;
        const { dentist_username } = req.parms;
        const { date_and_time, timeslot_state } = req.body;



        if (!date_and_time || !dentist_username || !timeslot_state) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Call the CoreService (via MQTT or HTTP)
        const timeslotData= { date_and_time, dentist_username, timeslot_state };

        // If no conflict, proceed to create the timeslot
        const correlationId = uuidv4(); 
        const topic = 'timeslot/dentist/create'; 

        try {
            const response = await publishMessage(topic, timeslotData, correlationId);
            res.status(201).json({message: 'Timeslot created successfully', timeslot: response,});
        } catch (error) {
            console.error('Error publishing to MQTT:', error);
            res.status(500).json({message: 'Failed to create timeslot', error: error.message,});
        }
};

// Controller to retrieve all timeslots for a specific office
exports.getAllTimeslotsForOffice = async (req, res) => {
    const { office_id } = req.params;

    if (!office_id) {
        return res.status(400).json({ message: 'Missing office_id' });
    }

    const correlationId = uuidv4();
    const topic = `timeslot/office/${office_id}/retrieveAll`;

    try {
        const response = await publishMessage(topic, { office_id }, correlationId);

        if (!response.success || !response.timeslots.length) {
            return res.status(404).json({ message: 'No timeslots found for this office' });
        }

        res.status(200).json({ message: 'Timeslots retrieved successfully', timeslots: response.timeslots });
    } catch (error) {
        console.error('Error retrieving timeslots:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Controller to retrieve available timeslots
exports.getAvailableTimeslots = async (req, res) => {
    const correlationId = uuidv4();
    const topic = 'timeslot/available/retrieve';

    try {
        const response = await publishMessage(topic, {}, correlationId);

        if (!response.success || !response.timeslots.length) {
            return res.status(404).json({ message: 'No available timeslots found' });
        }

        res.status(200).json({ message: 'Available timeslots retrieved successfully', timeslots: response.timeslots });
    } catch (error) {
        console.error('Error retrieving available timeslots:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Additional functions for updating and deleting timeslots can be added similarly...
