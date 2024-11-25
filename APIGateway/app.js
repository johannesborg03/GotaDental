const express = require('express');
const cors = require('cors');




const bodyParser = require('body-parser');
const timeslotRoutes = require('./src/routes/timeslot'); 

const app = express();
require('dotenv').config();

// Middleware to parse JSON bodies of incoming requests
app.use(bodyParser.json());

app.use('/api/timeslot', timeslotRoutes);

// Use the patient routes
app.use('/api', patientRoutes); // Prefix all patient routes with '/api'


const port = process.env.PORT || 4000;

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded payloads
app.use(cors()); // Enable CORS


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
