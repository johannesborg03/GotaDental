const axios = require('axios');

const API_GATEWAY_URL = 'http://localhost:4000'; // Replace with your API Gateway URL
const NUM_REQUESTS = 1000; // Total number of requests
const CONCURRENCY = 50; // Number of requests to run in parallel

// Test 1: Fetch available timeslots via API Gateway
async function fetchAvailableTimeslots() {
    try {
        const response = await axios.get(`${API_GATEWAY_URL}/api/timeslots/available`);
        console.log('Available timeslots:', response.status);
    } catch (error) {
        console.error('Error fetching available timeslots:', error.message);
    }
}

// Test 2: Create a new timeslot via API Gateway
async function createTimeslot() {
    try {
        const response = await axios.post(`${API_GATEWAY_URL}/api/timeslots`, {
            date_and_time: new Date().toISOString(),
            timeslot_state: 0,
            dentist: `dentist_${Math.floor(Math.random() * 10)}`,
        });
        console.log('Created timeslot:', response.status);
    } catch (error) {
        console.error('Error creating timeslot:', error.message);
    }
}

// Run HTTP stress test
(async () => {
    const tasks = [];
    for (let i = 0; i < NUM_REQUESTS; i++) {
        if (i % 2 === 0) {
            tasks.push(fetchAvailableTimeslots());
        } else {
            tasks.push(createTimeslot());
        }

        // Limit concurrency
        if (tasks.length >= CONCURRENCY) {
            await Promise.all(tasks);
            tasks.length = 0; // Clear completed tasks
        }
    }

    await Promise.all(tasks); // Wait for remaining tasks
    console.log('HTTP stress test completed.');
})();
