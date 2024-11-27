const { publishMessage, setupReplyQueue } = require('../mqttService');
const { v4: uuidv4 } = require('uuid');

// Controller to create a new timeslot
exports.createTimeslot = async (req, res) => {
  const { dentist_username } = req.params;
  const { date_and_time, timeslot_state } = req.body;

  // Prepare the data to send
  const timeslotData = {
      dentist_username, date_and_time, timeslot_state 
  };

  const correlationId = uuidv4(); 
  const topic = 'timeslot/dentist/create'; 

  try {
      const response = await publishMessage(topic, timeslotData, correlationId);

      res.status(201).json({
          message: 'Timeslot created successfully',
          timeslot: response, 
      });
  } catch (error) {
      console.error('Error publishing to MQTT:', error);
      res.status(500).json({
          message: 'Failed to create timeslot',
          error: error.message,
      });
  }
};


// Controller to retrieve all timeslots for a specific office
exports.getAllTimeslotsForOffice = async (req, res) => {
  const { office_id } = req.params;

  const correlationId = uuidv4();
  const topic = `timeslot/office/${office_id}/retrieveAll`;

  try {
      const response = await publishMessage(topic, { office_id }, correlationId);

      if (!response || response.length === 0) {
          return res.status(404).json({
              message: 'No timeslots found for this office',
              timeslots: [],
          });
      }

      res.status(200).json({
          message: 'Timeslots retrieved successfully',
          timeslots: response,
      });
  } catch (error) {
      console.error('Error publishing to MQTT:', error);
      res.status(500).json({
          message: 'Failed to retrieve timeslots',
          error: error.message,
      });
  }
};