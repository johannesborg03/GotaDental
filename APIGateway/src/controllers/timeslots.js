const { publishMessage, setupReplyQueue } = require('../mqttService');
const { v4: uuidv4 } = require('uuid');



// Controller for timeslot registration
exports.registerPatient = async (req, res) => {
  const { username } = req.params;
  const { date, time } = req.body;

  const slotData= {
    username, date,time 
  };

  const correlationId = uuidv4(); // Unique ID for this request
  const topic = 'timeslot/dentist/register';

  try {
    const response = await publishMessage(topic, slotData, correlationId);

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