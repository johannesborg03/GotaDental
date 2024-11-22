const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env

let bookingDbConnection = null;


// Function to initialize the database connection
const connectToBookingDB = () => {
    if (!bookingDbConnection) {
        bookingDbConnection = mongoose.createConnection(process.env.BOOKING_DB_URI, {
        });

        bookingDbConnection.on('connected', () => {
            console.log('NotificationService Connected to Booking Database');
        });

        bookingDbConnection.on('error', (err) => {
            console.error(`NotificationService Failed to connect to Booking Database: ${err.message}`);
            process.exit(1);
        });
    }
    return bookingDbConnection;
};


// Export the shared connection
module.exports = { connectToBookingDB };
