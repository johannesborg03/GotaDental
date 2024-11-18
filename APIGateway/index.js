const client = require('./mqttClient');
const { handleMessage } = require('./handlers');

client.on('message', (topic, message) => {
  console.log(`Received message on ${topic}: ${message.toString()}`);
  handleMessage(topic, message);
});