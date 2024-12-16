var mongoose = require('mongoose');
const { connectToBookingDB } = require('../utils/dbConnect');

// Initialize the connection
const bookingDbConnection = connectToBookingDB();

var Schema = mongoose.Schema;

var appointmentSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true,
    },
    dentist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dentist',
        required: true,
    },
    notes: [{
        type: String,
        default: ''
    }],

    timeSlot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TimeSlot",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },

});

module.exports = bookingDbConnection.model('Appointment', appointmentSchema);