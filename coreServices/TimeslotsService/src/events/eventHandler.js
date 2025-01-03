const { subscribeToTopic } = require('./subscriber');
const Timeslot = require('../models/Timeslot');
const { publishMessage } = require('./publisher');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose'); // Import mongoose
const eventEmitter = require('./eventEmitter'); // Import the global event emitter


const adjustToCET = (dateStr) => {
    const date = new Date(dateStr);
    const offsetInHours = 0; // CET is UTC+1
    date.setHours(date.getHours() + offsetInHours);
    return date;
};

async function handleCreateTimeslot(message, replyTo, correlationId, channel) {

    // Extract data from the received message
    const { start, end, dentist, office } = message;

    console.log("Message:", message);
    try {
        // Validate the input data
        if (!start || !end || !dentist || !office) {
            const errorResponse = { success: false, error: 'Missing required fields' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }



        const startCET = adjustToCET(start);
        const endCET = adjustToCET(end);

        console.log(`Manually adjusted times to CET: Start=${startCET}, End=${endCET}`);

         // Check for overlapping timeslots for the same dentist and office
         /*
         const existingTimeslot = await Timeslot.findOne({
            dentist: dentist,   // Check for the same dentist
            office: office,     // Check for the same office
            start: startCET,    // Check for the same start time
            end: endCET         // Check for the same end time
        });
        

        if (existingTimeslot) {
            const errorResponse = { success: false, error: 'Timeslot overlaps with another one' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        */


        // Fetch Dentist ID from User Management Service using RabbitMQ
        const dentistCorrelationId = uuidv4(); // Unique ID for this request
        const dentistTopic = 'dentist/getByUsername';
        const dentistMessage = { username: dentist };

        console.log(`Publishing message to fetch Dentist ID and Office Id:  ${JSON.stringify(dentistMessage)}`);

        const dentistResponse = await publishMessage(dentistTopic, dentistMessage, dentistCorrelationId);

        if (!dentistResponse || !dentistResponse.success) {
            console.error('Failed to fetch Dentist or Office ID:', dentistResponse);
            const errorResponse = { success: false, error: 'Dentist or Office not found' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        const { dentistId, officeId } = dentistResponse;
        console.log(`Resolved Dentist ID: ${dentistId}`);
        console.log(`Resolved Office ID: ${officeId}`);


        // Validate the resolved Office ID
        if (!mongoose.Types.ObjectId.isValid(officeId)) {
            const errorResponse = { success: false, error: 'Invalid Office ID' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }


        // Create the timeslot
        const newTimeslot = new Timeslot({
            start: startCET.toISOString(), // Save as ISO string in UTC
            end: endCET.toISOString(),     // Save the converted CET time
            dentist: dentistId, // Use the resolved Dentist ID
            office: officeId,   // Use the resolved Office ID
            isBooked: false,
        });

        await newTimeslot.save();

        console.log('Timeslot created successfully:', newTimeslot);


        // Publish a message to update the dentist's timeslot array
        const updateDentistTopic = 'dentists/updateTimeslot';
        const updateDentistMessage = {
            dentistId,
            timeslotId: newTimeslot._id,
        };

        await publishMessage(updateDentistTopic, updateDentistMessage, correlationId);
        console.log(`Published message to update dentist timeslot array:`, updateDentistMessage);


        // Publish a message to update the office's timeslot array
        const updateOfficeTopic = 'offices/updateTimeslot';
        const updateOfficeMessage = {
            officeId,
            timeslotId: newTimeslot._id,
        };

        await publishMessage(updateOfficeTopic, updateOfficeMessage, correlationId);
        console.log('Published message to update office timeslot array:', updateOfficeMessage);



        console.log('Timeslot created successfully:', newTimeslot);

        const successResponse = { success: true, timeslot: newTimeslot };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
    } catch (error) {
        console.error('Error creating timeslot:', error);
        const response = { success: false, error: 'Internal server error while creating timeslot.' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(response)), { correlationId });
    }
}


// Handle retrieving all timeslots for an office
async function handleGetAllTimeslots(message, replyTo, correlationId, channel) {
    console.log('Received retrieve all timeslots message:', message);

    const { office_id } = message;

    try {
        if (!office_id) {
            const errorResponse = { success: false, error: 'Missing office_id' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        const timeslots = await Timeslot.find({ office_id });
        console.log('Retrieved timeslots:', timeslots);

        const successResponse = { success: true, timeslots };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
    } catch (error) {
        console.error('Error retrieving timeslots:', error);
        const errorResponse = { success: false, error: 'Failed to retrieve timeslots' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
    }
}


async function handleGetTimeslot(message, replyTo, correlationId, channel) {
    console.log('Received request to retrieve timeslot:', message);

    const { timeslot_id } = message;

    try {
        if (!timeslot_id) {
            const errorResponse = { success: false, error: 'Missing timeslot_id' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        // Find the specific timeslot by its _id (timeslot_id)
        const timeslot = await Timeslot.findOne({ _id: timeslot_id });

        if (!timeslot) {
            const errorResponse = { success: false, error: 'Timeslot not found' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        // Successfully found the timeslot, send it back
        const successResponse = { success: true, timeslot };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
    } catch (error) {
        console.error('Error retrieving timeslot:', error);

        // Send error response back in case of a server error
        const errorResponse = { success: false, error: 'Failed to retrieve timeslot' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
    }
}

// Handle updating a timeslot
async function dentistHandleUpdateTimeslot(message, replyTo, correlationId, channel) {
    console.log('Received update timeslot message:', message);

    const { office_id, dentist_username, timeslot_id, date_and_time } = message;

    try {
        if (!office_id || !dentist_username || !timeslot_id || !date_and_time) {
            const errorResponse = { success: false, error: 'Missing required fields' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        const updatedTimeslot = await Timeslot.findByIdAndUpdate(
            timeslot_id,
            { dentist_username, office_id, date_and_time },
            { new: true }
        );

        if (!updatedTimeslot) {
            const errorResponse = { success: false, error: 'Timeslot not found' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        const successResponse = { success: true, timeslot: updatedTimeslot };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
    } catch (error) {
        console.error('Error updating timeslot:', error);
        const errorResponse = { success: false, error: 'Failed to update timeslot' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
    }
}

async function patientHandleUpdateTimeslot(message, replyTo, correlationId, channel) {
    const { timeslot_id, isBooked, patient, action, officeId } = message;

    console.log('Received update timeslot message:', message);

    try {
        // Validate inputs
        if (!timeslot_id || !patient || !officeId) {
            const errorResponse = { success: false, error: 'Missing timeslot_id or patient SSN' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        // Fetch Patient ID from User Management Service using RabbitMQ
        const patientCorrelationId = uuidv4();
        const patientTopic = 'patients/getBySSN';
        const patientMessage = { patient_ssn: patient };

        console.log(`Publishing message to fetch Patient ID for SSN: ${patient}`);

        const patientResponse = await publishMessage(patientTopic, patientMessage, patientCorrelationId);

        if (!patientResponse || !patientResponse.success) {
            console.error('Failed to fetch Patient ID:', patientResponse);
            const errorResponse = { success: false, error: 'Patient not found' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        const { patientId } = patientResponse;

        console.log(`Resolved Patient ID: ${patientId}`);

        // Check if patient already has 5 bookings for the same office
        const existingBookings = await Timeslot.find({
            isBooked: true,
            patient: patientId,
            office: officeId,
        });

        if (existingBookings.length >= 5) {
            console.error('Patient has reached the maximum booking limit.');
            const errorResponse = { success: false, error: 'You have already booked 5 timeslots for this office.' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        // Check if the timeslot is already booked
        const existingTimeslot = await Timeslot.findById(timeslot_id);

        if (!existingTimeslot) {
            const errorResponse = { success: false, error: 'Timeslot not found' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        // Handle cancellation
        if (action === 'cancel') {
            console.log('Processing timeslot cancellation:', message);

            // Check if the timeslot is not booked
            if (!existingTimeslot.isBooked) {
                const errorResponse = { success: false, error: 'Timeslot is already unbooked' };
                channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
                return;
            }

            // Unbook the timeslot


            const oldTimeslotPatient = existingTimeslot.patient;

            existingTimeslot.isBooked = false;
            existingTimeslot.patient = null;


            await existingTimeslot.save();

            console.log('Timeslot unbooked successfully:', existingTimeslot);

            const updatePatientTopic = 'patient/updateAppointments';
            const updatePatientMessage = {
                patientId: oldTimeslotPatient, // This will be null after cancellation
                timeslotId: timeslot_id,             // timeslot ID to identify which appointment to remove
                action: 'cancel',                    // Action to specify it's a cancellation
            };

            console.log('Publishing message to update Patient Appointments for Patient ID (now null):', updatePatientMessage);

            await publishMessage(updatePatientTopic, updatePatientMessage, uuidv4());

            const successResponse = { success: true, timeslot: existingTimeslot };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });

            return;
        }

        if (existingTimeslot.isBooked) {
            const errorResponse = { success: false, error: 'Timeslot already booked' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        // Update the timeslot
        existingTimeslot.isBooked = true;
        existingTimeslot.patient = patientId;

        await existingTimeslot.save();

        console.log('Timeslot updated successfully:', existingTimeslot);

        // Publish a message to update the patient's appointments array
        const updatePatientTopic = 'patient/updateAppointments';
        const updatePatientMessage = {
            patientId,
            timeslotId: timeslot_id,
            action: 'book',
        };

        console.log(`Publishing message to update Patient Appointments for Patient ID: ${patientId}`);

        await publishMessage(updatePatientTopic, updatePatientMessage, uuidv4());


        const successResponse = { success: true, timeslot: existingTimeslot };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
    } catch (error) {
        console.error('Error updating timeslot:', error);
        const errorResponse = { success: false, error: 'Failed to update timeslot' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
    }
}

// Handle retrieving available timeslots
async function handleGetAvailableTimeslots(message, replyTo, correlationId, channel) {
    console.log('Received request to retrieve available timeslots:', message);

    try {
        const availableTimeslots = await Timeslot.find({ isBooked: false });

        const successResponse = { success: true, timeslots: availableTimeslots };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });

        console.log('Available timeslots sent successfully');
    } catch (error) {
        console.error('Error retrieving available timeslots:', error);
        const errorResponse = { success: false, error: 'Failed to retrieve available timeslots' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
    }
}


// Handle deleting a timeslot
async function handleDeleteTimeslot(message, replyTo, correlationId, channel) {
    console.log('Received delete timeslot message:', message);

    const { dentist_username, timeslot_id, office_id } = message;

    try {
        if (!dentist_username || !timeslot_id || !office_id) {
            const errorResponse = { success: false, error: 'Missing required fields' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        const deletedTimeslot = await Timeslot.findByIdAndDelete(timeslot_id);

        if (!deletedTimeslot) {
            const errorResponse = { success: false, error: 'Timeslot not found' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        const successResponse = { success: true, timeslot: deletedTimeslot };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
    } catch (error) {
        console.error('Error deleting timeslot:', error);
        const errorResponse = { success: false, error: 'Failed to delete timeslot' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
    }
}

async function handleRetrieveTimeslotsByIds(message, replyTo, correlationId, channel) {
    console.log('Received request to fetch timeslots by IDs:', message);

    const { timeslot_ids } = message;

    try {
        const timeslots = await Timeslot.find({ _id: { $in: timeslot_ids } });
        console.log('Fetched timeslots:', timeslots);

        const successResponse = { success: true, timeslots };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
    } catch (error) {
        console.error('Error fetching timeslots by IDs:', error);
        const errorResponse = { success: false, error: 'Failed to fetch timeslots' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
    }
}

async function handleRetrieveBookedTimeslots(message, replyTo, correlationId, channel) {
    console.log('Received request to retrieve booked timeslots:', message);

    const { patient, officeId } = message;

    if (!patient) {
        const errorResponse = { success: false, error: 'Missing patientSSN' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
        return;
    }

    if (!officeId) {
        const errorResponse = { success: false, error: 'Missing officeId' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
        return;
    }

    try {
        // Fetch Patient ID from User Management Service using RabbitMQ
        const patientCorrelationId = uuidv4();
        const patientTopic = 'patients/getBySSN';
        const patientMessage = { patient_ssn: patient };

        console.log(`Publishing message to fetch Patient ID for SSN: ${patient}`);

        const patientResponse = await publishMessage(patientTopic, patientMessage, patientCorrelationId);

        if (!patientResponse || !patientResponse.success) {
            console.error('Failed to fetch Patient ID:', patientResponse);
            const errorResponse = { success: false, error: 'Patient not found' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        const { patientId } = patientResponse;

        console.log(`Resolved Patient ID: ${patientId}`);

        const bookedTimeslots = await Timeslot.find({
            isBooked: true, patient: patientId, office: officeId,
        });

        if (!bookedTimeslots || bookedTimeslots.length === 0) {
            const errorResponse = { success: false, error: 'No booked timeslots found' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }
        

        const successResponse = { success: true, timeslots: bookedTimeslots };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
    } catch (error) {
        console.error('Error retrieving booked timeslots:', error);
        const errorResponse = { success: false, error: 'Failed to retrieve booked timeslots' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
    }
}


// Initialize subscriptions
async function initializeSubscriptions() {
    try {
        await subscribeToTopic('timeslot/create', handleCreateTimeslot);
        await subscribeToTopic('timeslot/office/retrieveAll', handleGetAllTimeslots);
        await subscribeToTopic('timeslot/retrieve', handleGetTimeslot);
        //await subscribeToTopic('timeslot/update', dentistHandleUpdateTimeslot);
        await subscribeToTopic('timeslot/delete', handleDeleteTimeslot);
        await subscribeToTopic('timeslot/retrieveByIds', handleRetrieveTimeslotsByIds);
        await subscribeToTopic('timeslot/update', patientHandleUpdateTimeslot);
        await subscribeToTopic('timeslot/patient/booked/retrieve', handleRetrieveBookedTimeslots);


        console.log('Timeslot subscriptions initialized!');
    } catch (error) {
        console.error('Error initializing timeslot subscriptions:', error);
    }
}

module.exports = {
    initializeSubscriptions,
    handleCreateTimeslot,
    handleGetAllTimeslots,
    handleGetTimeslot,
    // dentistHandleUpdateTimeslot,
    handleDeleteTimeslot,
    handleRetrieveTimeslotsByIds,
    patientHandleUpdateTimeslot,
};