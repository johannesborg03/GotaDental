var express = require('express');
var mongoose = require('mongoose');
var cors = require('cors');
const { connectToBookingDB } = require('./src/utils/dbConnect');
const NotificationModel = require('./src/models/Notification'); // Model loader
const notificationsRoutes = require('./src/apiRoutes/notificationsRoutes');


require('dotenv').config();

// Initialize the database connection
const bookingDbConnection = connectToBookingDB();

// Load the Appointment model
const Notification = NotificationModel(bookingDbConnection);



// Variables
var port = process.env.PORT || 3001;


//Require controllers here


//------


// Create Express app
var app = express();

// Middleware
app.use(express.json()); // Parse JSON payloads
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded payloads
app.use(cors()); // Enable CORS

//App.use controllers here:
app.use(notificationsRoutes);
//----

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
