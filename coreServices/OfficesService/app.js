var express = require('express');
var mongoose = require('mongoose');
var cors = require('cors');
const { connectToBookingDB } = require('./src/utils/dbConnect');

const OfficeModel = require('./src/models/Office'); // Model loader
//const officeRoutes = require('./routes/officeRoutes'); // Routes for Office-related REST API
const { initializeOfficeSubscriptions } = require('./src/events/eventHandler');
const officeRoutes = require('./src/apiRoutes/officeRoutes'); // Correct relative path


require('dotenv').config();

// Initialize the database connection
const bookingDbConnection = connectToBookingDB();

// Load the Appointment model
const Office = OfficeModel(bookingDbConnection);


// Variables
var port = process.env.PORT || 3002;

var officesController = require('./src/controllers/Offices');




// Create Express app
var app = express();

// Middleware
app.use(express.json()); // Parse JSON payloads
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded payloads
app.use(cors()); // Enable CORS


//app.use(officesController);

app.use('/api', officeRoutes);

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
