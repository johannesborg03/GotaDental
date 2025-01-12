const { subscribeToTopic } = require('./subscriber');
const { publishMessage } = require('./publisher');
const mqtt = require('mqtt');
const { v4: uuidv4 } = require('uuid');

const Patient = require('../models/Patient');
const Dentist = require('../models/Dentist');

const redisClient = require('../utils/redisClient');

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

        const successResponse = { 
            success: true, 
            token: 'jwt-token-for-patient', 
            userType: 'patient',
            name: patient.name,
            email: patient.email
         };
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
    const sessionKey = `dentist:${identifier}`;

    try {
        // Check if session exists in Redis
        const cachedSession = await redisClient.get(sessionKey);
        if (cachedSession) {
            console.log('Dentist session found in cache.');
            const sessionData = JSON.parse(cachedSession);
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(sessionData)), { correlationId });
            return;
        }

        // I session is not found in Redis, proceed to check the database
        const dentist = await Dentist.findOne({ dentist_username: identifier });
        if (!dentist || dentist.password !== password) {
            const errorResponse = { success: false, error: 'Invalid username or password' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        // Fetch office details
        const officeCorrelationId = uuidv4();
        const officeResponse = await publishMessage('offices/retrieve', { office_id: dentist.office }, officeCorrelationId);

        if (!officeResponse || officeResponse.success === false) {
            const errorResponse = { success: false, error: 'Failed to retrieve office details.' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        // Successful login response
        const successResponse = {
            success: true,
            token: 'jwt-token-for-dentist', // Replace with actual JWT generation
            userType: 'dentist',
            office: officeResponse.office_name || "No office assigned",
            officeId: dentist.office,
            dentistId: dentist._id,
            name: dentist.name,
            email: dentist.email
        };

        // Cache the successful login in Redis for 96 hours
        await redisClient.setEx(sessionKey, 96 * 60 * 60, JSON.stringify(successResponse));

        console.log('Dentist login cached in Redis.');
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

        // Convert `date_of_birth` to a Date object
        const dateOfBirth = new Date(date_of_birth);
        if (isNaN(dateOfBirth)) {
            console.error('Invalid date_of_birth format:', date_of_birth);
            const response = { success: false, error: 'Invalid date_of_birth format' };
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
            date_of_birth: dateOfBirth,
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

async function handleGetDentistByUsername(message, replyTo, correlationId, channel) {
    console.log('Received request to fetch Dentist ID:', message);

    const { username } = message;

    try {
        // Find the dentist document and only retrieve `_id` and `office` fields
        const dentist = await Dentist.findOne(
            { dentist_username: username },
            '_id office' // Limit the fields retrieved
        );


        if (!dentist) {
            const errorResponse = { success: false, error: 'Dentist not found' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        const successResponse = {
            success: true,
            dentistId: dentist._id,
            officeId: dentist.office,
        };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
        console.log("Published Dentist id:", successResponse.dentistId);
        console.log("Published Dentist Office id:", successResponse.officeId);
    } catch (error) {
        console.error('Error fetching Dentist ID:', error);
        const errorResponse = { success: false, error: 'Internal server error' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
    }
}

async function handleGetPatientBySSN(message, replyTo, correlationId, channel) {
    const { patient_ssn } = message;

    console.log('Received get patient by SSN message:', message);

    try {
        if (!patient_ssn) {
            const errorResponse = { success: false, error: 'Missing SSN' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        const patient = await Patient.findOne({ patient_ssn });

        if (!patient) {
            const errorResponse = { success: false, error: 'Patient not found' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }
        // Construct the success response, including patientId and email
        const successResponse = {
            success: true,
            patientId: patient._id,
            email: patient.email,
            name: patient.name
        };

        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
    } catch (error) {
        console.error('Error retrieving patient:', error);
        const errorResponse = { success: false, error: 'Failed to retrieve patient' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
    }
}

async function handleUpdateAppointments(message, replyTo, correlationId, channel) {
    const { patientId, timeslotId, action } = message; // Added action to the message

    console.log('Received update appointments message:', message);
    console.log('Received action message:', action);
    try {
        if (!timeslotId) {
            const errorResponse = { success: false, error: 'Missing patientId or timeslotId' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        let updatedPatient;

        if (action === 'cancel') {
            // Remove the timeslot from the patient's appointments array
            updatedPatient = await Patient.findByIdAndUpdate(
                patientId,
                { $pull: { appointments: timeslotId } }, // $pull removes the timeslotId
                { new: true }
            );

            console.log("Trying to cancel")
            if (!updatedPatient) {
                const errorResponse = { success: false, error: 'Patient not found' };
                channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
                return;
            }

            console.log('Patient appointments updated successfully (cancel):', updatedPatient);
        } else if (action === 'book') {
            // Add the timeslot to the patient's appointments array
            updatedPatient = await Patient.findByIdAndUpdate(
                patientId,
                { $addToSet: { appointments: timeslotId } }, // $addToSet avoids duplicates
                { new: true }
            );

            if (!updatedPatient) {
                const errorResponse = { success: false, error: 'Patient not found' };
                channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
                return;
            }

            console.log('Patient appointments updated successfully (book):', updatedPatient);
        }

        const successResponse = { success: true, patient: updatedPatient };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
    } catch (error) {
        console.error('Error updating patient appointments:', error);
        const errorResponse = { success: false, error: 'Failed to update patient appointments' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
    }
}

async function handleGetPatientById(message, replyTo, correlationId, channel) {
    console.log('Received request to fetch patient by ID:', message);
    const { patientId } = message;

    console.log('Received request to fetch patient by ID:', message);

    try {
        if (!patientId) {
            const errorResponse = { success: false, error: 'Missing patientId' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        const patient = await Patient.findById(patientId);

        if (!patient) {
            const errorResponse = { success: false, error: 'Patient not found' };
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
            return;
        }

        // Construct the success response
        const successResponse = {
            success: true,
            email: patient.email,
            name: patient.name,
        };

        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(successResponse)), { correlationId });
        console.log('Patient details retrieved successfully:', successResponse);
    } catch (error) {
        console.error('Error retrieving patient by ID:', error);
        const errorResponse = { success: false, error: 'Failed to retrieve patient' };
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(errorResponse)), { correlationId });
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

        await subscribeToTopic('dentist/getByUsername', handleGetDentistByUsername);
        console.log('Subscribed to dentist/getByUsername');

        await subscribeToTopic('patients/getBySSN', handleGetPatientBySSN);
        console.log('Subscribed to patients/getBySSN');

        await subscribeToTopic('patients/getById', handleGetPatientById);
        console.log('Subscribed to patients/getById');

        
        await subscribeToTopic('patient/updateAppointments', handleUpdateAppointments);


        //   await subscribeToTopic('appointments/book', handleAppointmentBooking);
        //  console.log('Subscribed to "appointments/book"');

        //   await subscribeToTopic('notifications/send', handleNotification);
        //   console.log('Subscribed to "notifications/send"');


        console.log('Subscriptions initialized!');
    } catch (error) {
        console.error('Error initializing subscriptions:', error);
    }
}

module.exports = {
    initializeSubscriptions,
    handleDentistLogin,
    handlePatientLogin,
    handleUpdateDentistTimeslot,
    handleGetDentistByUsername,
    handleGetPatientBySSN,
    handleUpdateAppointments,
};
