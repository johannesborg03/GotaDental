const { createClient } = require('redis');

// Initialize the Redis client
const redisClient = createClient({
   url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

// Handle Redis connection events
redisClient.on('connect', () => {
   console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
   console.error('Redis connection error:', err);
});

// Connect the client
(async () => {
   try {
      await redisClient.connect();
      console.log('Redis client successfully connected');
   } catch (error) {
      console.error('Error connecting to Redis:', error);
   }
})();

module.exports = redisClient;