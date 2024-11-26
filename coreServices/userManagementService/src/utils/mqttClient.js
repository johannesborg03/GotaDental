// src/utils/mqttClient.js
const mqtt = require('mqtt');

const mqttClient = mqtt.connect('mqtt://localhost:1883');

mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');
});

mqttClient.on('error', (err) => {
    console.error('MQTT Error:', err.message);
});

module.exports = mqttClient;