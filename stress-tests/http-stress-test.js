const axios = require('axios');

const NUM_REQUESTS = 1000; // Total number of requests
const CONCURRENCY = 50; // Number of requests to run in parallel

// Test 1: Fetch available timeslots
async function fetchAvailableTimeslots() {
    try {
        const response = await axios.get(`http://timeslot:3003/api/timeslots/available`);
        console.log('Available timeslots:', response.status);
    } catch (error) {
        console.error('Error fetching available timeslots:', error.message);
    }
}
