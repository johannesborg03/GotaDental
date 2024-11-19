const mqtt = require('mqtt');
const config = require('./config');
const { postToEndpoint } = require('./httpClient'); // Import the HTTP client

const client = mqtt.connect(config.mqttBrokerUrl);

client.on('connect', () => {
  console.log('Connected to MQTT broker');
  config.topics.forEach(topic => {
    client.subscribe(topic, (err) => {
      if (!err) {
        console.log(`Subscribed to topic: ${topic}`);
      }
    });
  });
});

client.on('message', (topic, message) => {
  const endpoint = config.topicHandlers[topic];
  if (endpoint) {
    console.log(`Received message on topic: ${topic}`);
    console.log(`Forwarding to endpoint: ${endpoint}`);
    
    postToEndpoint(endpoint, message.toString())
      .then(() => console.log(`Message sent to ${endpoint}`))
      .catch(error => console.error(`Failed to send message to ${endpoint}:`, error));
  } else {
    console.warn(`No handler for topic: ${topic}`);
  }
});

module.exports = client;