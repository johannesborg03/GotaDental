const express = require('express');
const axios = require('axios');
const router = express.Router();

const services = {
    timeslotsService: 'http://timeslots-service:3003/api/health',
    officesService: 'http://offices-service:3005/api/health',
    userManagementService: 'http://user-management-service:3004/api/health',
};

router.get('/system-health', async (req, res) => {
    try {
        const healthResponses = await Promise.all(
            Object.values(services).map((url) => axios.get(url))
        );

        const aggregatedHealth = healthResponses.map((response, index) => ({
            service: Object.keys(services)[index],
            healthData: response.data,
        }));

        res.json(aggregatedHealth);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch health data', details: error.message });
    }
});

module.exports = router;
