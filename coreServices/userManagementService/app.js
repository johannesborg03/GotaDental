var express = require('express');
var mongoose = require('mongoose');
var cors = require('cors');
var userRoutes = require('./src/apiRoutes/userRoutes'); 
const { initializeSubscriptions } = require('./src/events/eventHandler');

const { connectToDentistDB } = require('./src/utils/userDbConnect');
const { connectToPatientDB } = require('./src/utils/userDbConnect');


const DentistModel = require('./src/models/Dentist'); 
// Initialize the database connection
const dentistDbConnection = connectToDentistDB();
// Load the Dentist model
const Dentist = DentistModel(dentistDbConnection);


const PatientModel = require('./src/models/Patient');
// Initialize the database connection
const patientDbConnection = connectToPatientDB();
// Load the Patient model
const Patient = PatientModel(patientDbConnection);

require('dotenv').config();

// Variables
var port = process.env.PORT || 3004; // Use the port defined in .env

// Controllers:
var dentistsController = require('./src/controllers/Dentists');
var patientsController = require('./src/controllers/Patients')


// Create Express app
var app = express();

// Middleware
app.use(express.json()); // Parse JSON payloads
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded payloads
app.use(cors()); // Enable CORS


// Initialize RabbitMQ Subscriptions
initializeSubscriptions();


//app.use each controller:
 app.use(dentistsController);
 app.use(patientsController);

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
