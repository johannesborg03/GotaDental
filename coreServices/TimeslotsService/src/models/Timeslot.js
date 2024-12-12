var mongoose = require('mongoose');
const { connectToBookingDB } = require('../utils/dbConnect');

// Initialize the connection
const bookingDbConnection = connectToBookingDB();
var Schema = mongoose.Schema;

var timeslotSchema = new mongoose.Schema({

    timeslot_state : {
        type : Number,
        required : true,
        enum: [0, 1], // Only allows values 0 or 1
        default: 0
    },
    office_id: {
        type: String,
        ref : 'Office',
        required: false
    },

    dentist_username: { 
        type: String, // Store username directly as String
        required: true,
    },

    date_and_time: {
        type: Date, // Use Date type for date handling
        required: true
    }
});

module.exports = bookingDbConnection.model('Timeslot', timeslotSchema);