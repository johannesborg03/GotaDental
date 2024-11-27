const { subscribeToTopic } = require('./subscriber');
const mqtt = require('mqtt');

const Patient = require('../models/Patient'); 
const Dentist = require('../models/Dentist'); 

// Handle patient login
async function handlePatientLogin(message) {
    const { identifier, password } = message;

    const patient = await Patient.findOne({ patient_ssn: identifier });
    if (!patient || patient.password !== password) {
        return { error: 'Invalid SSN or password' };
    }

    // Return a success response with a token
    return { token: 'jwt-token-for-patient', userType: 'patient' };
}

// Handle dentist login
async function handleDentistLogin(message) {
    const { identifier, password } = message;

    const dentist = await Dentist.findOne({ username: identifier });
    if (!dentist || dentist.password !== password) {
        return { error: 'Invalid username or password' };
    }

    // Return a success response with a token
    return { token: 'jwt-token-for-dentist', userType: 'dentist' };
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



// Initialize all subscriptions
async function initializeSubscriptions() {
    try {
        await subscribeToTopic('patients/register', handlePatientRegistration);
        //console.log('Subscribed to "patients/register"');

        //   await subscribeToTopic('appointments/book', handleAppointmentBooking);
        //  console.log('Subscribed to "appointments/book"');

        //   await subscribeToTopic('notifications/send', handleNotification);
        //   console.log('Subscribed to "notifications/send"');
        console.log('Subscriptions initialized!');
    } catch (error) {
        console.error('Error initializing subscriptions:', error);
    }
}

module.exports = { initializeSubscriptions, handleDentistLogin, handlePatientLogin };
