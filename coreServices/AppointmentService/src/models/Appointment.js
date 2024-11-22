var mongoose = require('mongoose');
const { bookingDbConnection }  = require('../utils/dbConnect');

var Schema = mongoose.Schema;

var appointmentSchema = new mongoose.Schema({
    patient_username: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true,
    },
    dentist_username: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dentist',
        required: true,
    },
    notes: [{
        type: String,
         default: ''
    }],
    state: {
        type: Number,
        required: true,
        enum: [0, 1], // 0 for pending, 1 for confirmed
    },
    office_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Office',
        required: true,
    },

    date_and_time: {
        type: Date, // Use Date type for date handling
        required: true
    }

   
});

var Appointment = bookingDbConnection.model('Appointment', appointmentSchema);

module.exports = Appointment;