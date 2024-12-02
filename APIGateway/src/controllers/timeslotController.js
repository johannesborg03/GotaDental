const { publishMessage, setupReplyQueue } = require('../mqttService');
const { v4: uuidv4 } = require('uuid');

// Controller to create a new timeslot
exports.createTimeslot = async (req, res) => {
  const { dentist_username } = req.params;
  const { date_and_time, timeslot_state } = req.body;

  if (!dentist_username || !date_and_time || !timeslot_state){
  return res.status(400).json({ message: 'Missing required parameters or body' });
  }

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

  if (!office_id){
  return res.status(400).json({ message: 'Missing office_id' });
  }

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

// Controller to retrieve a specific timeslot for a dentist
exports.getTimeslotById = async (req, res) => {
  const { office_id, dentist_username, timeslot_id } = req.params;

  if (!office_id ||! dentist_username || !timeslot_id){
  return res.status(400).json({ message: 'Missing required parameters' });
  }

  const correlationId = uuidv4();
  const topic = `timeslot/${office_id}/${dentist_username}/${timeslot_id}/retrieve`;

  try {
      const response = await publishMessage(topic, { office_id, dentist_username, timeslot_id }, correlationId);

      if (!response) {
          return res.status(404).json({ message: 'Timeslot not found' });
      }

      res.status(200).json({
          message: 'Timeslot retrieved successfully',
          timeslot: response,
      });
  } catch (error) {
      console.error('Error publishing to MQTT:', error);
      res.status(500).json({
          message: 'Failed to retrieve timeslot',
          error: error.message,
      });
  }
};

exports.updateTimeslot = async (req, res) => {

const {office_id, dentist_username, timeslot_id,  date_and_time } = req.params;

if (!office_id || !dentist_username || !timeslot_id || !date_and_time) {
    return res.status(400).json({ message: 'Missing required parameters' });
}

const correlationId = uuidv4();
const topic = `timeslot/${office_id}/${dentist_username}/${timeslot_id}/update`;

try {
const response = await publishMessage (topic, {office_id, dentist_username, date_and_time}, correlationId);


if (!response){
return res.status(404).json({ message: 'Timeslot not found' });
}

res.status(200).json ({
    message : 'Timeslot updated successfully',
    timeslot : response,
    });

} catch (error){
console.error('Error publishing to MQTT', error);
res.status(500).json({
    message: 'Failed to update timeslot',
    error: error.message,
});
}
}

exports.deleteTimeslot = async (req, res) => {

const {dentist_username, timeslot_id, office_id} = req.params;

if (!dentist_username || !timeslot_id || !office_id){
return res.status(400).json({message: 'Missing required parameters'})
}

const correlationId = uuidv4();
const topic = `timeslot/${office_id}/${dentist_username}/${timeslot_id}` 


try {

const response = await publishMessage (topic, {office_id, dentist_username, timeslot_id}, correlationId);

if (!response){
return res.status(404).json('Timeslot not found')
}

return res.status(200).json({
    message: "Timeslot Deleted",
    timeslot: response
});


} catch (error){
    console.error('Error publishing to MQTT', error);
    res.status(500).json({
        message: 'Failed to delete timeslot',
        error: error.message,
    });
    }
};