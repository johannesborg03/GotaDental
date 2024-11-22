const mongoose = require('mongoose');
require('dotenv').config();

const dentistDbConnection = mongoose.createConnection(process.env.DENTIST_DB_URI, {
   
});

const patientDbConnection = mongoose.createConnection(process.env.PATIENT_DB_URI, {

});

dentistDbConnection.once('connected', () => {
    console.log('Connected to Dentist Database');
});

dentistDbConnection.on('error', (err) => {
    console.error(`Failed to connect to Dentist Database: ${err.message}`);
    process.exit(1);
});


patientDbConnection.once('connected', () => {
    console.log('Connected to Patient Database');
});

patientDbConnection.on('error', (err) => {
    console.error(`Failed to connect to Patient Database: ${err.message}`);
    process.exit(1);
});

module.exports = { dentistDbConnection, patientDbConnection };


