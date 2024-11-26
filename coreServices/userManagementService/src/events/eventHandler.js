const { subscribeToTopic } = require('./subscriber');
const mqtt = require('mqtt');

const Patient = require('../models/Patient'); // Adjust the path to your model


async function handlePatientRegistration(message) {



    console.log('Processing patient registration:', message);

    // Extract data from the received message
    const { ssn, email, name, password } = message;

    try {
        // Validate the input data
        if (!ssn || !email || !name || !password) {
            console.error('Invalid message data:', message);
            return;
        }

        // Check if the patient already exists
        const existingPatient = await Patient.findOne({ patient_ssn: ssn });
        if (existingPatient) {
            console.log(`Patient with SSN ${ssn} already exists.`);
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
    } catch (error) {
        console.error('Error saving patient to database:', error);
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

module.exports = { initializeSubscriptions };
