const mongoose = require('mongoose');
require('dotenv').config();

let patientDbConnection = null;
// Function to initialize the database connection
const connectToPatientDB = () => {
    if (!patientDbConnection) {
        patientDbConnection = mongoose.createConnection(process.env.PATIENT_DB_URI, {
        });

        patientDbConnection.on('connected', () => {
            console.log('UserManagementService Connected to Patient Database');
        });

        patientDbConnection.on('error', (err) => {
            console.error(`UserManagementService Failed to connect to Patient Database: ${err.message}`);
            process.exit(1);
        });
    }
    return patientDbConnection;
};

//   

let dentistDbConnection = null;
// Function to initialize the database connection
const connectToDentistDB = () => {
    if (!dentistDbConnection) {
        dentistDbConnection = mongoose.createConnection(process.env.DENTIST_DB_URI, {
        });

        dentistDbConnection.on('connected', () => {
            console.log('UserManagementService Connected to Dentist Database');
        });

        dentistDbConnection.on('error', (err) => {
            console.error(`UserManagementService Failed to connect to Dentist Database: ${err.message}`);
            process.exit(1);
        });
    }
    return dentistDbConnection;
};

module.exports = { connectToPatientDB, connectToDentistDB };


