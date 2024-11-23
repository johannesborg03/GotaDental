var mongoose = require('mongoose');
const { bookingDbConnection }  = require('../utils/dbConnect');

var Schema = mongoose.Schema;

const notificationSchema = new mongoose.Schema({
    patient_username: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to User (Patient or Dentist)
    required: true,
    },
type: {
    type: String,
    enum: ["booking_confirmation", "booking_cancellation", "reminder", "system_message"],
    required: true,
},

});







var Notification = bookingDbConnection.model('Notification', notificationSchema);

module.exports = Notification;