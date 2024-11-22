const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env

// Connect to Shared Database
const sharedDbConnection = mongoose.createConnection(process.env.SHARED_DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Event Listeners
sharedDbConnection.on('connected', () => {
    console.log('Connected to Shared Database');
});

sharedDbConnection.on('error', (err) => {
    console.error(`Failed to connect to Shared Database: ${err.message}`);
    process.exit(1);
});

// Export the shared connection
module.exports = sharedDbConnection;
