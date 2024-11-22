var express = require('express');
var mongoose = require('mongoose');
var cors = require('cors');
const { connectToBookingDB } = require('./src/utils/dbConnect');

const TimeslotModel = require('./src/models/Timeslot'); // Model loader

//ENV port
require('dotenv').config();

// Initialize the database connection
const bookingDbConnection = connectToBookingDB();

// Load the Appointment model
const Timeslot = TimeslotModel(bookingDbConnection);

// Variables

var port = process.env.PORT || 3003;

var timeslotsController = require('./src/controllers/Timeslots.js');



// Create Express app
var app = express();

// Middleware
app.use(express.json()); // Parse JSON payloads
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded payloads
app.use(cors()); // Enable CORS


app.use(timeslotsController);

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
