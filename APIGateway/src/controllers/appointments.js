const { publishMessage, setupReplyQueue } = require('../mqttService');
const { v4: uuidv4 } = require('uuid');

// Controller to create a new appointment
exports.createAppointment = async (req, res) => {
    const { patient_ssn, dentist_username, office_id, date_and_time, notes } = req.body;

    if (!patient_ssn || !dentist_username || !office_id || !date_and_time) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const appointmentData = {
        patient_ssn,
        dentist_username,
        office_id,
        date_and_time,
        notes: "" // Default empty notes
    };

    const correlationId = uuidv4();
    const topic = 'appointment/create';

    try {
        const response = await publishMessage(topic, appointmentData, correlationId);

        res.status(201).json({
            message: 'Appointment created successfully',
            appointment: response,
        });
    } catch (error) {
        console.error('Error publishing to MQTT:', error);
        res.status(500).json({
            message: 'Failed to create appointment',
            error: error.message,
        });
    }
};

// Controller to retrieve all appointments for a patient
exports.getAppointmentsForPatient = async (req, res) => {
    const { patient_ssn } = req.params;

    const correlationId = uuidv4();
    const topic = `appointment/patient/${patient_ssn}/retrieve`;

    try {
        const response = await publishMessage(topic, { patient_ssn }, correlationId);

        res.status(200).json({
            message: 'Appointments retrieved successfully',
            appointments: response,
        });
    } catch (error) {
        console.error('Error publishing to MQTT:', error);
        res.status(500).json({
            message: 'Failed to retrieve appointments',
            error: error.message,
        });
    }
};