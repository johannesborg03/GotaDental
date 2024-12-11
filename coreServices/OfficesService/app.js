var express = require('express');
var mongoose = require('mongoose');
var cors = require('cors');
const officeRoutes = require('./src/apiRoutes/officeRoutes'); 
const { initializeSubscriptions } = require('./src/events/eventHandler');
const { connectToOfficeDB } = require('./src/utils/officeDBConnect');
const OfficeModel = require('./src/models/Office'); 

// Initialize the database connection
const officeDbConnection = connectToOfficeDB();
// Load the office model
const Office = OfficeModel(officeDbConnection);

require('dotenv').config();

// Variables
var port = process.env.PORT || 3004; // Use the port defined in .env

// Controllers:
var officesController = require('./src/controllers/Offices');

// Create Express app
var app = express();

// Middleware
app.use(express.json()); // Parse JSON payloads
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded payloads
app.use(cors()); // Enable CORS

// Initialize RabbitMQ Subscriptions
initializeSubscriptions();

app.use(officeRoutes);

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
