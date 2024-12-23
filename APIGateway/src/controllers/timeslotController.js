const { publishMessage } = require('../mqttService');
const { v4: uuidv4 } = require('uuid');

// Controller to create a new timeslot
exports.createTimeslot = async (req, res) => {
 
    const { start, end, dentist, office, officeId, patient } = req.body;

    // Validate required fields
    if (!start || !end || !dentist || !office || !officeId || patient) {
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

exports.getTimeslot = async (req, res) => {
    const correlationId = uuidv4();  // Unique correlation ID for tracking the request
    const topic = 'timeslot/retrieve';  // Topic to publish the request to

    const { timeslot_id } = req.params;  // Get the timeslot_id from the request params

    if (!timeslot_id) {
        return res.status(400).json({ message: 'Timeslot ID is required' });
    }

    try {
        // Publish the message to request the specific timeslot
        const response = await publishMessage(topic, { timeslot_id }, correlationId);

        if (!response.success || !response.timeslot) {
            return res.status(404).json({ message: 'Timeslot not found' });
        }

        // If timeslot is found, return it with status 'Booked' or 'Unbooked' based on the isBooked field
        const timeslot = {
            ...response.timeslot,
            status: response.timeslot.isBooked ? 'Booked' : 'Unbooked',
        };

        res.status(200).json({ message: 'Timeslot retrieved successfully', timeslot });
    } catch (error) {
        console.error('Error retrieving timeslot:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Controller to update a specific timeslot
exports.updateTimeslot = async (req, res) => {
    console.log("CALLED");
    const { timeslot_id } = req.params;
    const { isBooked, patient } = req.body;

    // Validate required fields
    if (!timeslot_id) {
        return res.status(400).json({ message: 'Missing timeslot_id' });
    }

    if (isBooked === undefined || (isBooked && !patient)) {
        return res.status(400).json({ message: 'Invalid data: isBooked and patient are required if booking' });
    }

    // Generate a unique correlation ID
    const correlationId = uuidv4();
    const topic = `timeslot/update`;

    try {
        const updateData = { timeslot_id, isBooked, patient }; // Update payload
        console.log(`Publishing to topic: ${topic}, Data: ${JSON.stringify(updateData)}, Correlation ID: ${correlationId}`);

        // Publish the message to RabbitMQ
        const response = await publishMessage(topic, updateData, correlationId);

        if (!response.success) {
            return res.status(500).json({ message: 'Failed to update timeslot', error: response.error });
        }

        // Respond with success
        res.status(200).json({
            message: 'Timeslot updated successfully',
            timeslot: response.timeslot,
        });
    } catch (error) {
        console.error('Error updating timeslot:', error);
        res.status(500).json({
            message: 'Failed to update timeslot',
            error: error.message,
        });
    }
};
