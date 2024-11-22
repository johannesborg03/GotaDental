const axios = require('axios');

//  Reusable Axios instance with default configuration
const httpClient = axios.create({
  baseURL: 'http://localhost:3000/api', // Change the port  
  timeout: 5000, // Timeout in milliseconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// POST for registering a new time slot for a dentist 
async function postSlot(username, slotDetails) {
  const endpoint = `/timeslot/${username}`; 
  try {
    const response = await httpClient.post(endpoint, slotDetails);
    console.log('Slot registered successfully:', response.data);
    return response.data; // Return for further use
  } catch (error) {
    console.error('Error registering slot:', error.message);  
    throw error;
}
}
module.exports = { postToEndpoint };