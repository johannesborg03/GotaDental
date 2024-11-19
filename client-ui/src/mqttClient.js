import mqtt from 'mqtt';

let client;


export function connectClient(brokerUrl, options = {}) {
    console.log('Connecting to MQTT broker at:', brokerUrl);

    client = mqtt.connect(brokerUrl, {
        reconnectPeriod: 5000, // Retry every 5 seconds
        ...options,
    });

    client.on('connect', () => {
        console.log('Connected to MQTT broker:', brokerUrl);
    });

    client.on('error', (err) => {
        console.error('MQTT Connection Error:', err.message);
    });

    client.on('close', () => {
        console.warn('Disconnected from MQTT broker');
    });

    return client;
}

export function publishMessage(topic, message) {
    if (!client || client.disconnected) {
        console.error('MQTT client is not connected. Call connectClient() first.');
        return;
    }

    const payload = typeof message === 'string' ? message : JSON.stringify(message);

    client.publish(topic, payload, (err) => {
        if (err) {
            console.error(`Error publishing to topic ${topic}:`, err.message);
        } else {
            console.log(`Message published to topic ${topic}:`, payload);
        }
    });
}

export function subscribeToTopic(topic, callback) {
    if (!client || client.disconnected) {
        console.error('MQTT client is not connected. Call connectClient() first.');
        return;
    }

    client.subscribe(topic, (err) => {
        if (err) {
            console.error(`Error subscribing to topic ${topic}:`, err.message);
        } else {
            console.log(`Subscribed to topic ${topic}`);
        }
    });

    client.on('message', (receivedTopic, message) => {
        if (receivedTopic === topic) {
            const payload = message.toString();
            callback(payload);
        }
    });
}
