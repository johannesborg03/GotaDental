const { publishMessage } = require('../mqttService');
const { v4: uuidv4 } = require('uuid');

// Controller to create a new timeslot
exports.createTimeslot = async (req, res) => {
 
    const { start, end, dentist, office, officeId } = req.body;

    // Validate required fields
    if (!start || !end || !dentist || !office || !officeId) {
        return res.status(400).json({ message: 'Missing required fields' });
    }


    // Generate a unique correlation ID
    const correlationId = uuidv4();
    const topic = 'timeslot/create';

    
    try {
        const timeslotData = { start, end, dentist, office, officeId, isBooked: false }; // Fixed variable name
        console.log(`Publishing to topic: ${topic}, Data: ${JSON.stringify(timeslotData)}, Correlation ID: ${correlationId}`);

        // Publish the message to RabbitMQ
        await publishMessage(topic, timeslotData, correlationId, officeId);

        // Respond with success
        res.status(201).json({
            message: 'Timeslot sent to Timeslot Service',
            timeslot: timeslotData,
            correlationId,
        });
    } catch (error) {
        console.error('Error publishing timeslot to Timeslot Service:', error);
        res.status(500).json({
            message: 'Failed to create timeslot',
            error: error.message,
        });
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

              // Map response to include 'Booked' or 'Unbooked' based on isBooked
              const timeslots = response.timeslots.map(timeslot => ({
                ...timeslot,
                status: timeslot.isBooked ? 'Booked' : 'Unbooked',
            }));

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

        // Map response to include 'Booked' or 'Unbooked' based on isBooked
        const timeslots = response.timeslots.map(timeslot => ({
            ...timeslot,
            status: timeslot.isBooked ? 'Booked' : 'Unbooked',
        }));

        res.status(200).json({ message: 'Available timeslots retrieved successfully', timeslots: response.timeslots });
    } catch (error) {
        console.error('Error retrieving available timeslots:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Additional functions for updating and deleting timeslots can be added similarly...
