const { subscribeToTopic } = require('./subscriber');
const mqtt = require('mqtt');

const Patient = require('../models/Patient'); // Adjust the path to your model


async function handlePatientRegistration(message) {
    console.log('Processing patient registration:', message);
    


    // Save the patient data to the database
    // saveToPatientDatabase(message);
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
