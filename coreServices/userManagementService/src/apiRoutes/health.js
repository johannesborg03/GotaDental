const express = require('express');
const os = require('os');
const router = express.Router();

router.get('/health', (req, res) => {
    res.json({
        service: "userManagement Service",
        cpu_usage: `${(os.loadavg()[0] * 100).toFixed(2)}%`,
        memory_usage: `${(process.memoryUsage().rss / (1024 * 1024)).toFixed(2)} MB`,
        active_requests: req.socket.server._connections || 0,
        //errors_last_minute: 0 
    });
});

module.exports = router;