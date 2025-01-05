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

// Test 2: Create a new timeslot
async function createTimeslot(dentistUsername) {
    try {
        const response = await axios.post(
            `http://timeslot:3003/api/timeslots/${dentistUsername}/timeslot`,
            {
                date_and_time: new Date().toISOString(),
                timeslot_state: 0
            }
        );
        console.log('Created timeslot:', response.status);
    } catch (error) {
        console.error('Error creating timeslot:', error.message);
    }
}

// Test 3: Delete a timeslot
async function deleteTimeslot(officeId, dentistUsername, timeslotId) {
    try {
        const response = await axios.delete(
            `http://timeslot:3003/api/timeslots/${officeId}/${dentistUsername}/${timeslotId}`
        );
        console.log('Deleted timeslot:', response.status);
    } catch (error) {
        console.error('Error deleting timeslot:', error.message);
    }
}

// Run stress test
(async () => {
    const tasks = [];
    for (let i = 0; i < NUM_REQUESTS; i++) {
        // Alternate between the tests
        if (i % 3 === 0) {
            tasks.push(fetchAvailableTimeslots());
        } else if (i % 3 === 1) {
            tasks.push(createTimeslot(`dentist_${Math.floor(Math.random() * 100)}`));
        } else {
            tasks.push(deleteTimeslot('office_1', 'dentist_1', `timeslot_${i}`));
        }

        // Limit concurrency
        if (tasks.length >= CONCURRENCY) {
            await Promise.all(tasks);
            tasks.length = 0; // Clear completed tasks
        }
    }

    // Wait for any remaining tasks
    await Promise.all(tasks);
    console.log('HTTP stress test completed.');
})();