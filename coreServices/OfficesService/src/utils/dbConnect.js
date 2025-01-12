const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env

let bookingDbConnection = null;


// Function to initialize the database connection
const connectToBookingDB = () => {
    if (!bookingDbConnection) {
        bookingDbConnection = mongoose.createConnection(process.env.BOOKING_DB_URI, {
            serverSelectionTimeoutMS: 3000, // 3 seconds timeout
        });

        bookingDbConnection.on('connected', () => {
            console.log('Office Service Connected to Booking Database');
        });

        bookingDbConnection.on('error', (err) => {
            console.error(`Office Service Failed to connect to Booking Database: ${err.message}`);
        });

        // Handle disconnection
        bookingDbConnection.on('disconnected', () => {
            console.warn('Office Service Disconnected from Booking Database');
        });
    }
    return bookingDbConnection;
};


// Export the shared connection
module.exports = { connectToBookingDB };
