const mqtt = require('mqtt');
const config = require('./config');

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

module.exports = client;