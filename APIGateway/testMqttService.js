/*const { connectRabbitMQ, publishMessage, subscribeToTopic } = require('./src/mqttService.js');

connectRabbitMQ().then(() => {
  // Once connected, test publishing and subscribing

  // Define a callback to handle messages from the queue
  const handleMessage = (message) => {
    console.log('Callback received message:', message);
  };


  subscribeToTopic('test_topic', handleMessage);

  const testMessage = { text: 'Hello RabbitMQ from the test!' };
  publishMessage('test_topic', testMessage);
});*/ 