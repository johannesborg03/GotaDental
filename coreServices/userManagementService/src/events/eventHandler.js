const { subscribeToTopic } = require('./subscriber');
const { publishMessage } = require('./publisher');
const mqtt = require('mqtt');
const { v4: uuidv4 } = require('uuid');

const Patient = require('../models/Patient');
const Dentist = require('../models/Dentist');

// Handle patient login
async function handlePatientLogin(message, replyTo, correlationId, channel) {
    console.log('Received login message:', message);
    const { identifier, password } = message;

    try {
        const patient = await Patient.findOne({ patient_ssn: identifier });
        if (!patient || patient.password !== password) {
            const errorResponse = { success: false, error: 'Invalid SSN or password' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        const successResponse = { success: true, token: 'jwt-token-for-patient', userType: 'patient' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
    } catch (error) {
        console.error('Error during patient login:', error);
        const errorResponse = { success: false, error: 'Internal server error during login.' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
    }
}

// Handle dentist login
async function handleDentistLogin(message, replyTo, correlationId, channel) {
    console.log('Received dentist login message:', message);
    const { identifier, password } = message;

    const officeCorrelationId = uuidv4(); // Unique ID for this request
    try {
        const dentist = await Dentist.findOne({ dentist_username: identifier });
        if (!dentist || dentist.password !== password) {
            const errorResponse = { success: false, error: 'Invalid username or password' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        // Publish a request to OfficeService to fetch office details
        const officeTopic = 'offices/retrieve'; // Topic to fetch office data
        console.log(`Sending request to OfficeService for office ID: ${dentist.office}`);

        console.log(`Waiting for response with Correlation ID: ${correlationId}`);

        const officeResponse = await publishMessage(officeTopic, { office_id: dentist.office }, officeCorrelationId);

        // Check the response from OfficeService
        if (!officeResponse || officeResponse.success === false) {
            const errorResponse = { success: false, error: 'Failed to retrieve office details.' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        console.log(`Office details retrieved successfully: ${officeResponse.office_name}`);




        const successResponse = {
            success: true,
            token: 'jwt-token-for-dentist',
            userType: 'dentist',
            office: dentist.office?.office_name || "No office assigned",
        };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
    } catch (error) {
        console.error('Error during dentist login:', error);
        const errorResponse = { success: false, error: 'Internal server error during login.' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
    }
}




async function handlePatientRegistration(message, replyTo, correlationId, channel) {

    console.log('Processing patient registration:', message);

    // Extract data from the received message
    const { ssn, email, name, password } = message;

    try {
        // Validate the input data
        if (!ssn || !email || !name || !password) {
            console.error('Invalid message data:', message);
            const response = { success: false, error: 'Invalid data' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(response)), { correlationId });

            return;
        }


        // Check if the patient already exists
        const existingPatient = await Patient.findOne({ patient_ssn: ssn });
        if (existingPatient) {
            console.log(`Patient with SSN ${ssn} already exists.`);
            const response = { success: false, error: `Patient with SSN ${ssn} already exists.` };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(response)), { correlationId });
            return;
        }

        // Create and save a new patient
        const newPatient = new Patient({
            patient_ssn: ssn,
            email,
            name,
            password, // Note: Passwords should be hashed in a real-world scenario
            notified: false, // Default value
            appointments: [], // Empty array initially
        });

        await newPatient.save();

        console.log(`Patient with SSN ${ssn} registered successfully.`);
        // Respond with success
        const response = { success: true, patient: newPatient };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(response)), { correlationId });
    } catch (error) {
        console.error('Error processing patient registration:', error);
        const response = { success: false, error: 'Internal server error while registering patient.' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(response)), { correlationId });
    }
}

async function handleDentistRegistration(message, replyTo, correlationId, channel) {

    console.log('Processing dentist registration:', message);

    // Extract data from the received message
    const { name, username, email, date_of_birth, password, office } = message;

    try {
        // Validate the input data
        if (!name || !username || !email || !date_of_birth || !password) {
            console.error('Invalid message data:', message);
            const response = { success: false, error: 'Invalid data' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(response)), { correlationId });

            return;
        }


        // Check if the patient already exists
        const existingDentist = await Dentist.findOne({ dentist_username: username });
        if (existingDentist) {
            console.log(`Dentist with username ${username} already exists.`);
            const response = { success: false, error: `Dentist with username ${username} already exists.` };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(response)), { correlationId });
            return;
        }

        // Create and save a new patient
        const newDentist = new Dentist({
            dentist_username: username,
            password,
            name,
            email,
            appointments: [], // Empty array initially
            timeslots: [],
            office,
        });

        await newDentist.save();

        // Publish a message to the Office Service to update the office
        const updateOfficeTopic = 'offices/update';
        const updateOfficeMessage = {
            officeId: office,
            dentistId: newDentist._id,
        };

        await publishMessage(updateOfficeTopic, updateOfficeMessage, correlationId);
        console.log(`Published message to update office:`, updateOfficeMessage);



        console.log(`Dentist with username ${username} registered successfully.`);
        // Respond with success
        const response = { success: true, patient: newDentist };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(response)), { correlationId });
    } catch (error) {
        console.error('Error processing dentist registration:', error);
        const response = { success: false, error: 'Internal server error while registering dentist.' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(response)), { correlationId });
    }
}

async function handleUpdateDentistTimeslot(message, replyTo, correlationId, channel) {
    const { dentistId, timeslotId } = message;

    try {
        if (!dentistId || !timeslotId) {
            const errorResponse = { success: false, error: 'Missing required fields' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        // Find the dentist and update their timeslots array
        const dentist = await Dentist.findById(dentistId);
        if (!dentist) {
            const errorResponse = { success: false, error: 'Dentist not found' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        dentist.timeslots.push(timeslotId);
        await dentist.save();

        console.log('Dentist timeslot array updated successfully:', dentist);

        const successResponse = { success: true, dentist };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
    } catch (error) {
        console.error('Error updating dentist timeslot array:', error);
        const response = { success: false, error: 'Internal server error while updating dentist timeslot array.' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(response)), { correlationId });
    }
}

// Initialize all subscriptions
async function initializeSubscriptions() {
    try {
        await subscribeToTopic('patients/register', handlePatientRegistration);
        console.log('Subscribed to patients/register');

        await subscribeToTopic('patients/login', handlePatientLogin);
        console.log('Subscribed to patients/login');

        await subscribeToTopic('dentists/login', handleDentistLogin);
        console.log('Subscribed to dentists/login');

        await subscribeToTopic('dentists/register', handleDentistRegistration);
        console.log('Subscribed to dentists/register');

        await subscribeToTopic('dentists/updateTimeslot', handleUpdateDentistTimeslot);
        console.log('Subscribed to dentists/updateTimeslot');

        //   await subscribeToTopic('appointments/book', handleAppointmentBooking);
        //  console.log('Subscribed to "appointments/book"');

        //   await subscribeToTopic('notifications/send', handleNotification);
        //   console.log('Subscribed to "notifications/send"');


        console.log('Subscriptions initialized!');
    } catch (error) {
        console.error('Error initializing subscriptions:', error);
    }
}

module.exports = { initializeSubscriptions, handleDentistLogin, handlePatientLogin, handleUpdateDentistTimeslot };
