var express = require('express');
var mongoose = require('mongoose');
var cors = require('cors');

// Variables
var mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/group10';
var port = process.env.PORT || 3000;

// Controllers:
var dentistsController = require('./coreServices/userManagementService/src/controllers/Appointments');
//--

// Connect to MongoDB
mongoose.connect(mongoURI).then(() => {
    console.log(`Connected to MongoDB with URI: ${mongoURI}`);
}).catch(err => {
    console.error(`Failed to connect to MongoDB: ${err.message}`);
    process.exit(1);
});

// Create Express app
var app = express();

// Middleware
app.use(express.json()); // Parse JSON payloads
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded payloads
app.use(cors()); // Enable CORS



//app.use each controller:
app.use(dentistsController);
//--


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
