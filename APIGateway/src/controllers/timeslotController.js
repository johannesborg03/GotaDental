const { publishMessage, getIO } = require('../mqttService');
const { v4: uuidv4 } = require('uuid');

// Controller to create a new timeslot
exports.createTimeslot = async (req, res) => {

    const { start, end, dentist, office, officeId, patient } = req.body;

    // Validate required fields
    if (!start || !end || !dentist || !office || !officeId) {
        return res.status(400).json({ message: 'Missing required fields' });
    }


    // Generate a unique correlation ID
    const correlationId = uuidv4();
    const topic = 'timeslot/create';


    try {
        const timeslotData = { start, end, dentist, office, officeId, isBooked: false, patient }; // Fixed variable name
        console.log(`Publishing to topic: ${topic}, Data: ${JSON.stringify(timeslotData)}, Correlation ID: ${correlationId}`);

        // Publish the message to RabbitMQ
        const response = await publishMessage(topic, timeslotData, correlationId, officeId, patient);

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
    const { isBooked, patient, action, officeId } = req.body;

    // Validate required fields
    if (!timeslot_id) {
        return res.status(400).json({ message: 'Missing timeslot_id' });
    }

    if (isBooked === undefined || (isBooked && !patient)) {
        return res.status(400).json({ message: 'Invalid data: isBooked and patient are required if booking' });
    }

    if (action === "cancel") {
        console.log("cancel appointment")
    }

    if (action === "book") {
        console.log("book appointment")
    }

    if (!officeId) {
        console.log("MISSING OFFICEID");
        return res.status(400).json({ message: 'Missing OfficeId' });
    }

    // Generate a unique correlation ID
    const correlationId = uuidv4();
    const topic = `timeslot/update`;

    console.log("TImeslotId:", timeslot_id);

    try {
        const updateData = { timeslot_id, isBooked, patient, action, officeId }; // Update payload
        console.log(`Publishing to topic: ${topic}, Data: ${JSON.stringify(updateData)}, Correlation ID: ${correlationId}`);

        console.log("OFFICE ID FOR THIS:", officeId);
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

exports.getBookedTimeslots = async (req, res) => {
    const { patientSSN } = req.params;
    const { officeId } = req.query;


    if (!patientSSN || !officeId) {
        return res.status(400).json({ message: 'Missing patientSSN or officeId' });
    }

    // Generate a unique correlation ID
    const correlationId = uuidv4();
    const topic = 'timeslot/patient/booked/retrieve';

    try {
        console.log(`Publishing message to RabbitMQ with topic: ${topic}`);
        const response = await publishMessage(topic, { patientSSN, officeId }, correlationId);

        // Query the database for timeslots that are booked and linked to the patient
        if (!response.success || !response.timeslots || response.timeslots.length === 0) {
            return res.status(404).json({ message: 'No booked timeslots found' });
        }

        const timeslots = response.timeslots;

        res.status(200).json({
            message: 'Booked timeslots retrieved successfully',
            timeslots,
        });
    } catch (error) {
        console.error('Error fetching booked timeslots:', error);
        res.status(500).json({ message: 'Failed to fetch booked timeslots', error: error.message });
    }
};