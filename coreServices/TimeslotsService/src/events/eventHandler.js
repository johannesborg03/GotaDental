const { subscribeToTopic } = require('./subscriber');
const Timeslot = require('../models/Timeslot');
const { publishMessage } = require('./publisher');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose'); // Import mongoose
const eventEmitter = require('./eventEmitter'); // Import the global event emitter
const { sendNotificationEmail } = require('../utils/emailService');
// const { create } = require('rabbitmq-stream-js-client/dist/connection');
const redisClient = require('../utils/redisClient');


const adjustToCET = (dateStr) => {
    const date = new Date(dateStr);
    const offsetInHours = 0; // CET is UTC+1
    date.setHours(date.getHours() + offsetInHours);
    return date;
};

async function handleCreatePatientTimeslot(message, replyTo, correlationId, channel) {

    // Extract data from the received message
    const { start, end, patient, officeId, createdBy } = message;

    console.log("Message:", message);
    try {
        // Validate the input data
        if (!start || !end || !patient || !officeId || !createdBy) {
            const errorResponse = { success: false, error: 'Missing required fields' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }



        const startCET = adjustToCET(start);
        const endCET = adjustToCET(end);

        console.log(`Manually adjusted times to CET: Start=${startCET}, End=${endCET}`);

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

        // Validate the resolved Patient ID
        if (!mongoose.Types.ObjectId.isValid(patientId)) {
            const errorResponse = { success: false, error: 'Invalid Patient ID' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        // Check for existing timeslot created by the same patient in the same office
        const existingTimeslot = await Timeslot.findOne({
            patient: patientId,
            office: officeId,
            createdBy: 'patient'
        });
        console.log("existingTimeslot after query:", existingTimeslot);
        console.log("officeId:", officeId);
        console.log("patientId:", patientId);
        console.log("createdBy:", createdBy);
        console.log("existingTimeslot:", existingTimeslot);

        console.log("existing timeslot:", officeId, patientId, createdBy);
        console.log("existingTimeslot", existingTimeslot);
        if (existingTimeslot) {
            const errorResponse = { success: false, error: 'A timeslot created by this patient already exists in this office.' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });

            return; // This prevents further execution
        }



        // Check for overlapping timeslots
        const overlappingTimeslot = await Timeslot.findOne({

            officeId,
            $or: [
                { start: { $lt: endCET.toISOString() }, end: { $gt: startCET.toISOString() } }, // Overlap
                { start: { $gte: startCET.toISOString(), $lt: endCET.toISOString() } },        // New within existing
                { end: { $gt: startCET.toISOString(), $lte: endCET.toISOString() } }          // Existing within new
            ]
        });

        if (overlappingTimeslot) {
            const errorResponse = { success: false, error: 'Overlapping timeslot exists.' };
            console.error('Overlapping timeslot:', overlappingTimeslot);
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        if (!mongoose.Types.ObjectId.isValid(officeId)) {
            const errorResponse = { success: false, error: 'Invalid Office ID' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        // Create the timeslot
        const newTimeslot = new Timeslot({
            start: startCET.toISOString(), // Save as ISO string in UTC
            end: endCET.toISOString(),     // Save the converted CET time
            patient: patientId,
            office: officeId,
            isBooked: false,
            createdBy: 'patient',
        });

        await newTimeslot.save();


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

async function handleCreateTimeslot(message, replyTo, correlationId, channel) {

    // Extract data from the received message
    const { start, end, dentist, office, createdBy } = message;

    console.log("Message:", message);
    try {
        // Validate the input data
        if (!start || !end || !dentist || !office) {
            const errorResponse = { success: false, error: 'Missing required fields or invalid "createdBy"' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }



        const startCET = adjustToCET(start);
        const endCET = adjustToCET(end);

        console.log(`Manually adjusted times to CET: Start=${startCET}, End=${endCET}`);

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


        console.log(`Creating dentist timeslot: Start=${startCET.toISOString()}, End=${endCET.toISOString()}, Office=${officeId}`);

        // Step 1: Check for overlapping patient-created timeslots
        const overlappingPatientTimeslots = await Timeslot.find({
            createdBy: 'patient',
            office: officeId,
            $or: [
                { start: { $lt: endCET.toISOString() }, end: { $gt: startCET.toISOString() } },
                { start: { $gte: startCET.toISOString(), $lt: endCET.toISOString() } },
                { end: { $gt: startCET.toISOString(), $lte: endCET.toISOString() } }
            ]
        });

        if (overlappingPatientTimeslots.length > 0) {
            console.log("Found overlapping patient timeslots:", overlappingPatientTimeslots);

            const patientTimeslotIds = overlappingPatientTimeslots.map((ts) => ts._id);
            const patientIds = overlappingPatientTimeslots.map((ts) => ts.patient);

            await Timeslot.deleteMany({ _id: { $in: patientTimeslotIds } });

            console.log("Deleted overlapping patient timeslots:", patientTimeslotIds);
            // Print each patientId
            console.log("Patient IDs of overlapping timeslots:");
            for (const patientId of patientIds) {
                console.log("Patient ID:", patientId);
            }

            // Step 2: Notify affected patients via email
            for (const patientId of patientIds) {
                const patientTopic = 'patients/getById';
                const patientMessage = { patientId };
                const patientCorrelationId = uuidv4();

                const patientResponse = await publishMessage(patientTopic, patientMessage, patientCorrelationId);

                if (patientResponse && patientResponse.success) {
                    const { email, name } = patientResponse;

                    const emailSubject = 'Requested Timeslot Now Available';
                    const emailText = `Dear ${name},\n\nThe timeslot you requested has become available. Please check your account to book the timeslot.\n\nBest regards,\nThe Team`;

                    await sendNotificationEmail(email, emailSubject, emailText);
                    console.log('Notification email sent to:', email);
                } else {
                    console.error('Failed to fetch patient details for email notification:', patientResponse);
                }
            }
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

/*
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
    */

async function handleUpdateTimeslot(message, replyTo, correlationId, channel) {
    const { timeslot_id, isBooked, patient, dentist, action, officeId } = message;

    console.log('Received update timeslot message:', message);

    try {
        // Validate inputs
        if (!timeslot_id || !officeId) {
            const errorResponse = { success: false, error: 'Missing timeslot_id or officeId' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        let resolvedDentistId = null;

        // If the request is from a dentist, resolve the dentist ID
        if (dentist && action === 'cancel') {
            console.log('Resolving dentist ID from User Management Service for username:', dentist);

            const dentistCorrelationId = uuidv4();
            const dentistTopic = 'dentist/getByUsername';
            const dentistMessage = { username: dentist };

            // Fetch Dentist ID using RabbitMQ
            const dentistResponse = await publishMessage(dentistTopic, dentistMessage, dentistCorrelationId);

            if (!dentistResponse || !dentistResponse.success) {
                console.error('Failed to fetch Dentist ID:', dentistResponse);
                const errorResponse = { success: false, error: 'Dentist not found' };
                channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
                return;
            }

            resolvedDentistId = dentistResponse.dentistId;
            console.log('Resolved Dentist ID:', resolvedDentistId);
        }

        // Fetch the existing timeslot
        const existingTimeslot = await Timeslot.findById(timeslot_id);

        if (!existingTimeslot) {
            const errorResponse = { success: false, error: 'Timeslot not found' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        // Handle cancellation
        if (action === 'cancel') {
            console.log('Processing timeslot cancellation:', message);

            if (resolvedDentistId) {
                console.log('Cancelation initiated by dentist');
                console.log("existingTimeslot.dentist:", existingTimeslot.dentist, "resolvedDentistId:", resolvedDentistId);

                // Check if the resolved dentist ID matches the one associated with the timeslot
                if (!existingTimeslot.dentist.equals(resolvedDentistId)) {
                    const errorResponse = { success: false, error: 'Unauthorized: Dentist does not match the timeslot' };
                    channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
                    return;
                }
            } else if (patient) {
                console.log('Cancelation initiated by patient');

                // Validate the patient identifier
                if (!patient || existingTimeslot.patient.equals(patient)) {
                    const errorResponse = { success: false, error: 'Unauthorized: Patient does not match the timeslot' };
                    channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
                    return;
                }
            } else {
                const errorResponse = { success: false, error: 'Invalid cancelation request: No patient or dentist provided' };
                channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
                return;
            }

            // Check if the timeslot is not booked
            if (!existingTimeslot.isBooked) {
                const errorResponse = { success: false, error: 'Timeslot is already unbooked' };
                channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
                return;
            }

            console.log("patient:", patient);
            // Unbook the timeslot
            const oldTimeslotPatient = existingTimeslot.patient;

            existingTimeslot.isBooked = false;
            existingTimeslot.patient = null;

            await existingTimeslot.save();

            console.log('Timeslot unbooked successfully:', existingTimeslot);


            // Send email notification to the patient
            if (oldTimeslotPatient && resolvedDentistId) {
                console.log("email SENDING FUNCTION");
                const patientTopic = 'patients/getById';
                const patientMessage = { patientId: oldTimeslotPatient }; // Ensure patient_ssn is used
                const patientCorrelationId = uuidv4();

                const patientResponse = await publishMessage(patientTopic, patientMessage, patientCorrelationId);

                if (patientResponse && patientResponse.success) {
                    const { email, name } = patientResponse;

                    const emailSubject = 'Your Appointment Has Been Cancelled';
                    const emailText = `Dear ${name},\n\nWe regret to inform you that your appointment scheduled for ${existingTimeslot.start} has been cancelled by your dentist. Please contact the office to reschedule.\n\nBest regards,\nThe Team`;

                    await sendNotificationEmail(email, emailSubject, emailText);
                    console.log('Notification email sent to:', email);
                } else {
                    console.error('Failed to fetch patient details for email notification:', patientResponse);
                }
            }


            // Publish message to update Patient Appointments if patient exists
            if (oldTimeslotPatient) {
                const updatePatientTopic = 'patient/updateAppointments';
                const updatePatientMessage = {
                    patientId: oldTimeslotPatient,
                    timeslotId: timeslot_id,
                    action: 'cancel',
                };

                console.log('Publishing message to update Patient Appointments:', updatePatientMessage);

                await publishMessage(updatePatientTopic, updatePatientMessage, uuidv4());
            }

            // Publish message to update Dentist Appointments
            if (resolvedDentistId) {
                const updateDentistTopic = 'dentists/updateTimeslot';
                const updateDentistMessage = {
                    dentistId: resolvedDentistId,
                    timeslotId: timeslot_id,
                    action: 'cancel',
                };

                console.log('Publishing message to update Dentist Timeslots:', updateDentistMessage);

                await publishMessage(updateDentistTopic, updateDentistMessage, uuidv4());
            }

            const successResponse = { success: true, timeslot: existingTimeslot };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });

            return;
        }


        // Handle booking (existing logic remains unchanged)
        if (action === 'book') {
            console.log('Processing timeslot booking:', message);

            if (existingTimeslot.isBooked) {
                const errorResponse = { success: false, error: 'Timeslot already booked' };
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
        }
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
    
    // Cache expiration time (inside the method)
    const CACHE_EXPIRATION = 96 * 60 * 60; // 96 hours

    try {
        // Generate cache key based on timeslot_ids
        const cacheKey = `timeslots:${timeslot_ids.join(':')}`;

        // Check if timeslots are already cached
        const cachedTimeslots = await redisClient.get(cacheKey);

        if (cachedTimeslots) {
            console.log('Cache hit for timeslots:', cacheKey);
            const successResponse = { success: true, timeslots: JSON.parse(cachedTimeslots) };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
            return;
        }

        // Cache miss: Fetch the timeslots from the database
        const timeslots = await Timeslot.find({ _id: { $in: timeslot_ids } });
        console.log('Fetched timeslots:', timeslots);

        // Cache the fetched timeslots for future requests
        await redisClient.setEx(cacheKey, CACHE_EXPIRATION, JSON.stringify(timeslots));

        // Respond with the fetched timeslots
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
    const CACHE_EXPIRATION = 96 * 60 * 60; // 96 hours
    const cacheKey = `bookedTimeslots:${patient}:${officeId}`;

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
        // Step 1: Attempt to fetch from cache
        console.log(`Attempting to fetch from cache with key: ${cacheKey}`);
        const cachedTimeslots = await redisClient.get(cacheKey);

        if (cachedTimeslots) {
            console.log('Cache hit for booked timeslots:', cacheKey);
            const successResponse = { success: true, timeslots: JSON.parse(cachedTimeslots) };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
            return;
        }

        console.log('Cache miss. Proceeding to fetch from services.');

        // Step 2: Fetch Patient ID from User Management Service using RabbitMQ
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

        // Step 3: Fetch booked timeslots from database
        const bookedTimeslots = await Timeslot.find({
            isBooked: true, patient: patientId, office: officeId,
        });

        if (!bookedTimeslots || bookedTimeslots.length === 0) {
            console.log('No booked timeslots found for patient and office.');
            const errorResponse = { success: false, error: 'No booked timeslots found' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        console.log('Fetched booked timeslots from database:', bookedTimeslots);

        // Step 4: Cache the fetched timeslots
        await redisClient.setEx(cacheKey, CACHE_EXPIRATION, JSON.stringify(bookedTimeslots));

        // Step 5: Respond with the fetched timeslots
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
        await subscribeToTopic('timeslot/update', handleUpdateTimeslot);
        await subscribeToTopic('timeslot/patient/booked/retrieve', handleRetrieveBookedTimeslots);
        await subscribeToTopic('timeslot/patient/create', handleCreatePatientTimeslot);


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
    handleCreatePatientTimeslot,
    handleRetrieveTimeslotsByIds,
    handleUpdateTimeslot,
};