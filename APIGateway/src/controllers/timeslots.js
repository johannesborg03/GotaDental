const { publishMessage } = require('../mqttService');

async function registerSlot(req, res) {
  try {
    const { username } = req.params;
    const { date, time } = req.body;

    const slotDetails = { username, date, time };

    // Publish to RabbitMQ
    await publishMessage('timeslot_topic', slotDetails); 

    res.status(200).json({ message: 'Timeslot registered successfully', data: slotDetails });
  } catch (error) {
    console.error('Error registering timeslot:', error);
    res.status(500).json({ message: 'Error registering timeslot' });
  }
}

module.exports = { registerSlot };