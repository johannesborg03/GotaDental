const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env

let officeDbConnection = null;


// Function to initialize the database connection
const connectToOfficeDB = () => {
    if (!officeDbConnection) {
        officeDbConnection = mongoose.createConnection(process.env.OFFICE_DB_URI, {
        });

        officeDbConnection.on('connected', () => {
            console.log('OfficeService Connected to Offices Database');
        });

        officeDbConnection.on('error', (err) => {
            console.error(`OfficeService Failed to connect to Offices Database: ${err.message}`);
            process.exit(1);
        });
    }
    return officeDbConnection;
};


// Export the shared connection
module.exports = { connectToOfficeDB};