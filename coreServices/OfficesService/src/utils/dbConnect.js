const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env

// Connect to Shared Database
const bookingDbConnection = mongoose.createConnection(process.env.BOOKING_DB_URI, {
   
});

// Event Listeners
bookingDbConnection.on('connected', () => {
    console.log('OfficeService Connected to Shared Database');
});

bookingDbConnection.on('error', (err) => {
    console.error(`Failed to connect to Shared Database: ${err.message}`);
    process.exit(1);
});

// Export the shared connection
module.exports = { bookingDbConnection };
