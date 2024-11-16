import mqtt from 'mqtt'

const client = mqtt.connect('ws://localhost:9001', {
    clientId: `mqttjs_${Math.random().toString(16).substr(2, 8)}`,
    clean: true, // Clean session
});


// Publish a message to a topic
export function publishMessage(topic, message) {
    mqttClient.publish(topic, message, (err) => {
        if (err) {
            console.error('Publish error:', err);
        } else {
            console.log(`Message "${message}" published to topic "${topic}"`);
        }
    });
}

// Subscribe to a topic and handle messages
export function subscribeToTopic(topic, messageHandler) {
    mqttClient.subscribe(topic, (err) => {
        if (err) {
            console.error('Subscription error:', err);
        } else {
            console.log(`Subscribed to topic "${topic}"`);
        }
    });

    // Listen for messages on the topic
    mqttClient.on('message', (receivedTopic, message) => {
        if (receivedTopic === topic) {
            messageHandler(message.toString());
        }
    });
}

client.on('connect', () => {
    console.log('Connected to MQTT broker');
});

client.on('error', (error) => {
    console.error('Connection error:', error);
});

export default client;