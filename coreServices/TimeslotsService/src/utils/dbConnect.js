const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env

let bookingDbConnection = null;

// Function to initialize the database connection
const connectToBookingDB = () => {
    if (!process.env.BOOKING_DB_URI) {
        throw new Error('BOOKING_DB_URI is not defined in the environment variables.');
    }

    if (!bookingDbConnection) {
        bookingDbConnection = mongoose.createConnection(process.env.BOOKING_DB_URI, {
            useNewUrlParser: true, // Ensure compatibility with MongoDB
            useUnifiedTopology: true, // Recommended option for MongoDB driver
        });

        // Event handlers for the connection
        bookingDbConnection.on('connected', () => {
            console.log('TimeslotService Connected to Booking Database');
        });

        bookingDbConnection.on('error', (err) => {
            console.error(`TimeslotService Failed to connect to Booking Database: ${err.message}`);
            process.exit(1);
        });

        bookingDbConnection.on('disconnected', () => {
            console.warn('TimeslotService Disconnected from Booking Database');
        });
    }
    return bookingDbConnection;
};

// Export the shared connection
module.exports = { connectToBookingDB };

