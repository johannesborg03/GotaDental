const { subscribeToTopic } = require('./subscriber');  
const Appointment = require('../models/Appointment');  


// Handle creating a new appointment
async function handleCreateAppointment(message, replyTo, correlationId, channel) {
    console.log('Received create appointment message:', message);

    const { patient_ssn, dentist_username, office_id, date_and_time, notes } = message;

    try {
        // Validate the input
        if (!patient_ssn || !dentist_username || !office_id || !date_and_time) {
            const errorResponse = { success: false, error: 'Missing required fields' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        const newAppointment = new Appointment({ patient_ssn, dentist_username, office_id, date_and_time, notes: notes });
        await newAppointment.save();

        console.log('Appointment created:', newAppointment);
        const successResponse = { success: true, appointment: newAppointment };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
    } catch (error) {
        console.error('Error creating appointment:', error);
        const errorResponse = { success: false, error: 'Failed to create appointment' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
    }
}

module.exports = {
    initializeAppointmentSubscriptions,
    handleCreateAppointment,
    handleGetAppointmentsForPatient,
    handleGetAppointmentById,
    handleCancelAppointmentByPatient,
    handleCancelAppointmentByDentist,
    handleAddNoteToAppointment,
};