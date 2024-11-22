const axios = require('axios');

//  Reusable Axios instance with default configuration
const httpClient = axios.create({
  baseURL: 'http://localhost:3000/api', // Change the port  
  timeout: 5000, // Timeout in milliseconds
  headers: {
    'Content-Type': 'application/json',
  },
});

module.exports = { postToEndpoint };