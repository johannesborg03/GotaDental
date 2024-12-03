var express = require('express');
var mongoose = require('mongoose');
var cors = require('cors');
require('dotenv').config();

const { initializeSubscriptions } = require('./src/events/eventHandler'); // RabbitMQ
const { connectToBookingDB } = require('./src/utils/dbConnect');

const TimeslotModel = require('./src/models/Timeslot'); // Timeslot model loader
const timeslotsRoutes = require('./src/apiRoutes/timeslotRoutes');

// Initialize the database connection
const bookingDbConnection = connectToBookingDB();

// Verify the database connection
if (!process.env.BOOKING_DB_URI) {
    console.error('Error: BOOKING_DB_URI is not defined in the environment variables.');
    process.exit(1);
}

bookingDbConnection.on('connected', () => {
    console.log('Connected to Booking Database');
});

bookingDbConnection.on('error', (err) => {
    console.error('Failed to connect to Booking Database:', err.message);
    process.exit(1);
});

// Load the Timeslot model
const Timeslot = TimeslotModel(bookingDbConnection);

// Variables
var port = process.env.PORT || 3003;

// Create Express app
var app = express();

// Middleware
app.use(express.json()); // Parse JSON payloads
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded payloads
app.use(cors()); // Enable CORS

// Initialize RabbitMQ Subscriptions
initializeSubscriptions();

// Modular Routes
app.use('/api/timeslots', timeslotsRoutes);

// 404 Handler
app.use('/api/*', (req, res) => {
    res.status(404).json({ message: 'Not Found' });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/api/`);
});

module.exports = app;
