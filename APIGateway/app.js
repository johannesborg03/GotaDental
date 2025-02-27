const express = require('express');
const cors = require('cors');

const mqtt = require('mqtt');

const http = require('http'); // Import HTTP for server creation
const { Server } = require('socket.io'); // Import Socket.IO

//const mqttClient = require('./src/mqttClient');
const { connectRabbitMQ, initializeWebSocket, initializeSubscriptions } = require('./src/mqttService');


const bodyParser = require('body-parser');
const timeslotRoutes = require('./src/routes/timeslotRoutes');
const patientRoutes = require('./src/routes/patientRoutes'); 
const dentistRoutes = require('./src/routes/dentistRoutes');
const loginRoutes = require('./src/routes/loginRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const officeRoutes = require('./src/routes/officeRoutes'); 
const { startHealthAggregation } = require('./src/systemHealthAggregator');


const app = express();
require('dotenv').config();

//app.options('*', cors()); // Enable preflight requests for all routes

// Enable CORS for all routes
app.use(cors({
    origin: 'http://localhost:5173', // Replace with your frontend origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true, // Allow cookies if needed
}));
// Middleware to parse JSON bodies of incoming requests
app.use(bodyParser.json());

// Use the routes
app.use('/api/patients', patientRoutes); // Prefix all patient routes with '/api'
app.use('/api/dentists', dentistRoutes); // Prefix all patient routes with '/api'
app.use('/api', loginRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', officeRoutes);
app.use('/api', timeslotRoutes);
app.use('/api/office', officeRoutes);

startHealthAggregation();

//const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL);
//mqttClient = mqtt.connect('mqtt://localhost:1883')
const port = process.env.PORT || 4000;

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded payloads
app.use(cors()); // Enable CORS

const server = http.createServer(app); // Wrap the Express app with an HTTP server
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173', // Frontend URL
        methods: ['GET', 'POST'], // Allowed methods
    },
});

// Initialize WebSocket in mqttService
initializeWebSocket(io);



// Initialize RabbitMQ connection
connectRabbitMQ().then(() => {
    console.log('RabbitMQ connection established');
    initializeSubscriptions();
}).catch((err) => {
    console.error('Failed to connect to RabbitMQ:', err);
    process.exit(1); // Exit if RabbitMQ connection fails
});


// 404 Handler
app.use('/api/*', (req, res) => {
    res.status(409).json({ message: 'Resource not found' });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ message: err.message });
});

// Start the server
server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/api/`);
});
