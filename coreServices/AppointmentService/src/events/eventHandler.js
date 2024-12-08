const { subscribeToTopic } = require('./subscriber');  
const Appointment = require('../models/Appointment');  
const Timeslot = require('../models/Timeslot'); // Import Timeslot model


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

         const timeslot = await Timeslot.findOne({
            dentist_username,
            date_and_time,
            timeslot_state: 0, 
        });

                 // Check for available timeslot
         if (!timeslot) {
             const errorResponse = { success: false, error: 'No available timeslot' };
             channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
             return;
        }

        const newAppointment = new Appointment({ patient_ssn, dentist_username, office_id, date_and_time, notes: notes });
        await newAppointment.save();

        // Update the timeslot status to "booked" by marking tht state with 1
        timeslot.timeslot_state = 1; 
        await timeslot.save();

        console.log('Appointment created:', newAppointment);
        const successResponse = { success: true, appointment: newAppointment };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
    } catch (error) {
        console.error('Error creating appointment:', error);
        const errorResponse = { success: false, error: 'Failed to create appointment' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
    }
}

// Handle retrieving all appointments for a patient
async function handleGetAppointmentsForPatient(message, replyTo, correlationId, channel) {
    console.log('Received retrieve all appointments message:', message);

    const { patient_ssn } = message;

    try {
        if (!patient_ssn) {
            const errorResponse = { success: false, error: 'Missing patient_ssn' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        const appointments = await Appointment.find({ patient_ssn });
        console.log('Retrieved appointments:', appointments);

        const successResponse = { success: true, appointments };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
    } catch (error) {
        console.error('Error retrieving appointments:', error);
        const errorResponse = { success: false, error: 'Failed to retrieve appointments' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
    }
}

// Handle retrieving a specific appointment
async function handleGetAppointmentById(message, replyTo, correlationId, channel) {
    console.log('Received retrieve appointment message:', message);

    const { appointment_id } = message;

    try {
        if (!appointment_id) {
            const errorResponse = { success: false, error: 'Missing appointment_id' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        const appointment = await Appointment.findById(appointment_id);
        if (!appointment) {
            const errorResponse = { success: false, error: 'Appointment not found' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        const successResponse = { success: true, appointment };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
    } catch (error) {
        console.error('Error retrieving appointment:', error);
        const errorResponse = { success: false, error: 'Failed to retrieve appointment' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
    }
}

// Handle canceling an appointment by patient
async function handleCancelAppointmentByPatient(message, replyTo, correlationId, channel) {
    console.log('Received cancel appointment by patient message:', message);

    const { patient_ssn, appointment_id } = message;

    try {
        if (!patient_ssn || !appointment_id) {
            const errorResponse = { success: false, error: 'Missing required fields' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        const deletedAppointment = await Appointment.findByIdAndDelete(appointment_id);
        if (!deletedAppointment) {
            const errorResponse = { success: false, error: 'Appointment not found' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        const timeslot = await Timeslot.findOne({
            dentist_username: deletedAppointment.dentist_username,
            date_and_time: deletedAppointment.date_and_time,
        });

          if (timeslot) {
               timeslot.timeslot_state = 0; // Mark timeslot as available
             await timeslot.save();
         }
        const successResponse = { success: true, appointment: deletedAppointment };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
    } catch (error) {
        console.error('Error canceling appointment by patient:', error);
        const errorResponse = { success: false, error: 'Failed to cancel appointment' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
    }
}

// Handle canceling an appointment by dentist
async function handleCancelAppointmentByDentist(message, replyTo, correlationId, channel) {
    console.log('Received cancel appointment by dentist message:', message);

    const { dentist_username, appointment_id } = message;

    try {
        if (!dentist_username || !appointment_id) {
            const errorResponse = { success: false, error: 'Missing required fields' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        const deletedAppointment = await Appointment.findByIdAndDelete(appointment_id);
        if (!deletedAppointment) {
            const errorResponse = { success: false, error: 'Appointment not found' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        const successResponse = { success: true, appointment: deletedAppointment };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
    } catch (error) {
        console.error('Error canceling appointment by dentist:', error);
        const errorResponse = { success: false, error: 'Failed to cancel appointment' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
    }
}

// Handle adding a note to an appointment
async function handleAddNoteToAppointment(message, replyTo, correlationId, channel) {
    console.log('Received add note to appointment message:', message);

    const { appointment_id, content, dentist_username } = message;

    try {
        if (!appointment_id || !content || !dentist_username) {
            const errorResponse = { success: false, error: 'Missing required fields' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        const appointment = await Appointment.findById(appointment_id);
        if (!appointment) {
            const errorResponse = { success: false, error: 'Appointment not found' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        // Add the note to the appointment
        appointment.notes = appointment.notes + "\n" + content;  // Append the note to existing ones
        await appointment.save();

        const successResponse = { success: true, appointment };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
    } catch (error) {
        console.error('Error adding note to appointment:', error);
        const errorResponse = { success: false, error: 'Failed to add note to appointment' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
    }
}


// Handle updating an appointment
async function handleUpdateAppointment(message, replyTo, correlationId, channel) {
    console.log('Received update appointment message:', message);

    const { appointment_id, new_date_and_time, new_dentist_username } = message;

    try {
        if (!appointment_id || !new_date_and_time || !new_dentist_username) {
            const errorResponse = { success: false, error: 'Missing required fields' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        const appointment = await Appointment.findById(appointment_id);
        if (!appointment) {
            const errorResponse = { success: false, error: 'Appointment not found' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        const oldTimeslot = await Timeslot.findOne({
            dentist_username: appointment.dentist_username,
            date_and_time: appointment.date_and_time,
            timeslot_state: 1, // Booked
        });

        if (oldTimeslot) {
            oldTimeslot.timeslot_state = 0; // Free the old timeslot
            await oldTimeslot.save();
        }
        
         appointment.dentist_username = new_dentist_username;
         appointment.date_and_time = new_date_and_time;
          await appointment.save();

       
          const successResponse = { success: true, appointment };
       
          channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
    } catch (error) {
        console.error('Error updating appointment:', error);
        const errorResponse = { success: false, error: 'Failed to update appointment' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
    }
}

// Initialize subscriptions
async function initializeAppointmentSubscriptions() {
    try {
        await subscribeToTopic('appointments/create', handleCreateAppointment);
        await subscribeToTopic('appointments/patient/retrieveAll', handleGetAppointmentsForPatient);
        await subscribeToTopic('appointments/retrieve', handleGetAppointmentById);
        await subscribeToTopic('appointments/patient/cancel', handleCancelAppointmentByPatient);
        await subscribeToTopic('appointments/dentist/cancel', handleCancelAppointmentByDentist);
        await subscribeToTopic('appointments/notes/add', handleAddNoteToAppointment);

        console.log('Appointment subscriptions initialized!');
    } catch (error) {
        console.error('Error initializing appointment subscriptions:', error);
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