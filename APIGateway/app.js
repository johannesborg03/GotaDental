const express = require('express');
const bodyParser = require('body-parser');
const timeslotRoutes = require('./src/routes/timeslot'); 

const app = express();

// Middleware to parse JSON bodies of incoming requests
app.use(bodyParser.json());

app.use('/api/timeslot', timeslotRoutes);

// Start the server
const PORT = process.env.PORT || 3005;

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
