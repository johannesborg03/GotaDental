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
    const checkConflictTopic = "appointments/checkConflict";
    const topic = "appointments/create";

    try {
          // Check for conflicts
          const conflictResponse = await publishMessage(
            checkConflictTopic,
            { patient_ssn, dentist_username, date_and_time },
            correlationId
        );

        if (conflictResponse.conflict) {
            return res.status(409).json({
                message: "Conflict: Dentist or patient already has an appointment at this time."
            });
        }
        // Proceed to create the appointment if no conflicts
        const response = await publishMessage(topic, appointmentData, correlationId);

        res.status(201).json({
            message: "Appointment created successfully",
            appointment: response,
        });
    } catch (error) {
        console.error("Error publishing to MQTT:", error);
        res.status(500).json({
            message: "Failed to create appointment",
            error: error.message,
        });
    }
};

// Controller to retrieve all appointments for a patient
exports.getAppointmentsForPatient = async (req, res) => {
    const { patient_ssn } = req.params;

    const correlationId = uuidv4();
    const topic = `appointments/patient/${patient_ssn}/retrieve`;

    try {
        const response = await publishMessage(topic, { patient_ssn }, correlationId);

        res.status(200).json({
            message: "Appointment retrieved successfully",
            appointments: response,
        });
    } catch (error) {
        console.error("Error publishing to MQTT:", error);
        res.status(500).json({
            message: "Failed to retrieve appointments",
            error: error.message,
        });
    }
};

// Controller to retrieve a specific appointment by ID
exports.getAppointmentById = async (req, res) => {
    const { appointment_id } = req.params;

    const correlationId = uuidv4();
    const topic = `appointments/${appointment_id}/retrieve`;

    try {
        const response = await publishMessage(topic, { appointment_id }, correlationId);

        res.status(200).json({
            message: "Appointment retrieved successfully",
            appointment: response,
        });
    } catch (error) {
        console.error("Error publishing to MQTT:", error);
        res.status(500).json({
            message: "Failed to retrieve appointment",
            error: error.message,
        });
    }
};

// Controller to cancel an appointment by patient
exports.cancelAppointmentByPatient = async (req, res) => {
    const { patient_ssn, appointment_id } = req.params;

    const correlationId = uuidv4();
    const topic = `appointments/patient/${patient_ssn}/${appointment_id}/cancel`;

    try {
        const response = await publishMessage(topic, { patient_ssn, appointment_id }, correlationId);

        res.status(200).json({
            message: "Appointment canceled successfully by patient",
            appointment: response,
        });
    } catch (error) {
        console.error("Error publishing to MQTT:", error);
        res.status(500).json({
            message: "Failed to cancel appointment",
            error: error.message,
        });
    }
};

// Controller to cancel an appointment by dentist
exports.cancelAppointmentByDentist = async (req, res) => {
    const { dentist_username, appointment_id } = req.params;

    const correlationId = uuidv4();
    const topic = `appointments/dentist/${dentist_username}/${appointment_id}/cancel`;

    try {
        const response = await publishMessage(topic, { dentist_username, appointment_id }, correlationId);

        res.status(200).json({
            message: "Appointment canceled successfully by dentist",
            appointment: response,
        });
    } catch (error) {
        console.error("Error publishing to MQTT:", error);
        res.status(500).json({
            message: "Failed to cancel appointment",
            error: error.message,
        });
    }
};

// Controller to add a note to an appointment
exports.addNoteToAppointment = async (req, res) => {
    const { appointment_id } = req.params;
    const { dentist_username, content } = req.body;

    const noteData = {
        appointment_id,
        dentist_username,
        content,
    };

    const correlationId = uuidv4();
    const topic = `appointments/${appointment_id}/notes`;

    try {
        const response = await publishMessage(topic, noteData, correlationId);

        res.status(201).json({
            message: "Note added successfully",
            appointment: response,
        });
    } catch (error) {
        console.error("Error publishing to MQTT:", error);
        res.status(500).json({
            message: "Failed to add note to appointment",
            error: error.message,
        });
    }
};