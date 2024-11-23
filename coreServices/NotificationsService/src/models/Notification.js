var mongoose = require('mongoose');
const { bookingDbConnection } = require('../utils/dbConnect');

var Schema = mongoose.Schema;

const notificationSchema = new mongoose.Schema({
    patient_username: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient', // Reference to Patient
        required: false,
    },
    dentist_username: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dentist',
        required: false,
    },
    type: {
        type: String,
        enum: ["booking_confirmation", "booking_cancellation", "reminder", "system_message"],
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    appointment_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
    }
});







var Notification = bookingDbConnection.model('Notification', notificationSchema);

module.exports = Notification;