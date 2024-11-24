var mongoose = require('mongoose');
const { connectToBookingDB } = require('../utils/dbConnect');

// Initialize the connection
const bookingDbConnection = connectToBookingDB();

var Schema = mongoose.Schema;

const notificationSchema = new mongoose.Schema({
    patient_ssn: {
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
        enum: ["appointment_confirmation", "appointment_cancellation", "reminder", "available_timeslot"],
        required: true,
    },
    message: {
        type: String,
        required: false,
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


module.exports = bookingDbConnection.model('Notification', notificationSchema);