const { subscribeToTopic } = require('./subscriber');
const mqtt = require('mqtt');

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

    try {
        const dentist = await Dentist.findOne({ dentist_username: identifier });
        if (!dentist || dentist.password !== password) {
            const errorResponse = { success: false, error: 'Invalid username or password' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        const successResponse = { success: true, token: 'jwt-token-for-dentist', userType: 'dentist' };
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
    const { name, username, email, date_of_birth, password } = message;

    try {
        // Validate the input data
        if (!name || !username || !email || !date_of_birth || !password)  {
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
            date_of_birth,
            appointments: [], // Empty array initially
            timeslots: []
        });

        await newDentist.save();



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


async function handleTimeSlotRegistration(message, replyTo, correlationId, channel) {
    console.log('Processing time slot registration:', message);

    const { dentist_username, date_and_time } = message;

    try {
        // Validate input
        if (!dentist_username || !date_and_time) {
            console.error('Invalid message data:', message);
            const response = { success: false, error: 'Invalid data. Dentist username and date_and_time are required.' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(response)), { correlationId });
            return;
        }

        // Parse and validate date_and_time
        const dateTime = new Date(date_and_time);
        if (isNaN(dateTime)) {
            console.error('Invalid date_and_time:', date_and_time);
            const response = { success: false, error: 'Invalid date_and_time format. Must be a valid ISO date string.' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(response)), { correlationId });
            return;
        }

        // Check if dentist exists
        const dentist = await Dentist.findOne({ dentist_username });
        if (!dentist) {
            console.log(`Dentist with username ${dentist_username} not found.`);
            const response = { success: false, error: `Dentist with username ${dentist_username} not found.` };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(response)), { correlationId });
            return;
        }

        // Check if the time slot already exists
        const existingSlot = await TimeSlot.findOne({ dentist_username, date_and_time: dateTime });
        if (existingSlot) {
            console.log(`Time slot already exists for dentist ${dentist_username} on ${date_and_time}.`);
            const response = { success: false, error: `Time slot already exists for dentist ${dentist_username} on ${date_and_time}.` };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(response)), { correlationId });
            return;
        }

        // Create and save the new time slot
        const newTimeSlot = new TimeSlot({
            dentist_username,
            date_and_time: dateTime
        });

        await newTimeSlot.save();

        console.log(`Time slot for dentist ${dentist_username} on ${date_and_time} registered successfully.`);

        // Respond with success
        const response = { success: true, timeSlot: newTimeSlot };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(response)), { correlationId });
    } catch (error) {
        console.error('Error processing time slot registration:', error);
        const response = { success: false, error: 'Internal server error while registering time slot.' };
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

        await subscribeToTopic('dentists/slot/post', handleTimeSlotRegistration);
        console.log('Subscribed to "dentists/slot/post"');

        //   await subscribeToTopic('appointments/book', handleAppointmentBooking);
        //  console.log('Subscribed to "appointments/book"');

        //   await subscribeToTopic('notifications/send', handleNotification);
        //   console.log('Subscribed to "notifications/send"');


        console.log('Subscriptions initialized!');
    } catch (error) {
        console.error('Error initializing subscriptions:', error);
    }
}

module.exports = { initializeSubscriptions, handleDentistLogin, handlePatientLogin, handleTimeSlotRegistration };
