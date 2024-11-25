const mqtt = require('mqtt');

// Connect to the MQTT broker
const client = mqtt.connect('mqtt://localhost:1883'); // Adjust this if necessary

client.on('connect', () => {
    console.log('Connected to MQTT broker');

    // Subscribe to the topic you want to test
    const topic = 'patients/register';
    client.subscribe(topic, (err) => {
        if (err) {
            console.error('Failed to subscribe to topic:', err);
        } else {
            console.log(`Subscribed to topic: ${topic}`);
        }
    });
});

client.on('message', (topic, message) => {
    // Handle incoming messages
    console.log(`Message received on topic "${topic}": ${message.toString()}`);
});

client.on('error', (err) => {
    console.error('MQTT Error:', err.message);
});
