var express = require('express');
var mongoose = require('mongoose');
var cors = require('cors');
var userRoutes = require('./src/apiRoutes/userRoutes'); 

const { connectToDentistDB } = require('./src/utils/userDbConnect');
const { connectToPatientDB } = require('./src/utils/userDbConnect');


const DentistModel = require('./src/models/Dentist'); // Model loader
// Initialize the database connection
const dentistDbConnection = connectToDentistDB();
// Load the Dentist model
const Dentist = DentistModel(dentistDbConnection);


const PatientModel = require('./src/models/Patient'); // Model loader
// Initialize the database connection
const patientDbConnection = connectToPatientDB();
// Load the Patient model
const Patient = PatientModel(patientDbConnection);

require('dotenv').config();

// Import reusable database connection utility
//const connectToDatabase = require('./src/utils/userDbConnect');

// Variables
var port = process.env.PORT || 3004; // Use the port defined in .env
//const dentistDbUri = process.env.DENTIST_DB_URI; // Dentist Database URI
//const patientDbUri = process.env.PATIENT_DB_URI; // Patient Database URI

// Controllers:
var dentistsController = require('./src/controllers/Dentists');
var patientsController = require('./src/controllers/Patients')
//--



// Connect to Both Databases
//connectToDatabase(dentistDbUri, 'Dentist Database');
//connectToDatabase(patientDbUri, 'Patient Database');

// Create Express app
var app = express();

// Middleware
app.use(express.json()); // Parse JSON payloads
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded payloads
app.use(cors()); // Enable CORS


// Initialize RabbitMQ Subscriptions
initializeSubscriptions();


//app.use each controller:
// app.use(dentistsController);
// app.use(patientsController);

app.use(userRoutes);

// 404 Handler
app.use('/api/*', (req, res) => {
    res.status(404).json({ message: 'Not Found' });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ message: err.message });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/api/`);
});

module.exports = app;
