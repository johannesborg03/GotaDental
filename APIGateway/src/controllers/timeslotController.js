const { publishMessage, setupReplyQueue } = require('../mqttService');
const { v4: uuidv4 } = require('uuid');

// Controller to create a new timeslot
exports.createTimeslot = async (req, res) => {
    
  console.log('Received timeslot data:', req.body);
  const { date_and_time, dentist_username, office_id} = req.body;
   

  if (!dentist_username || !date_and_time || !office_id){
  return res.status(400).json({ message: 'Missing required parameters or body' });
  }

  // Prepare the data to send
  const timeslotData = {
        date_and_time, 
        dentist_username,
        office_id,
  };

  /* Check if a timeslot already exists for the dentist at the given date and time
  //const existingTimeslot = await checkTimeslotConflict(dentist_username, date_and_time);

  if (existingTimeslot) {
      return res.status(409).json({
          message: 'Conflict: Timeslot already exists for this dentist at the given date and time.'
      });
  }
*/
  // If no conflict, proceed to create the timeslot
  const correlationId = uuidv4(); 
  const topic = "timeslot/dentist/create"; 

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

// Check if the timeslot_id exists in the system 
const timeslotExists = await checkTimeslotExists(dentist_username, timeslot_id, office_id);

if (!timeslotExists) {
    return res.status(404).json({ message: 'Timeslot not found' });
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