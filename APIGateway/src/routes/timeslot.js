const { publishMessage } = require('../mqttService'); 


async function registerSlot(req, res) {
  const { username } = req.params;
  const { date, time } = req.body;

  const slotDetails = {
    username,
    date,
    time,
  };

  try {
    await publishMessage('timeslot_topic', slotDetails);
    res.status(200).json({
      message: 'Time slot registered successfully',
      slotDetails,
    });
  } catch (error) {
    console.error('Error publishing to RabbitMQ:', error);
    res.status(500).json({
      message: 'Failed to register time slot',
    });
  }
}

module.exports = {
  registerSlot,
};