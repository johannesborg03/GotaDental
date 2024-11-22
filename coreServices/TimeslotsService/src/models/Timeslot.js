var mongoose = require('mongoose');
const { connectToBookingDB } = require('../utils/dbConnect');

// Initialize the connection
const bookingDbConnection = connectToBookingDB();
var Schema = mongoose.Schema;

var timeslotSchema = new mongoose.Schema({
    timeslot_id : {
        type : String,
        required : true,
        unique : true,
    },
    timeslot_state : {
        type : Number,
        required : true,
        enum: [0, 1], // Only allows values 0 or 1
        default: 0
    },
    office_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'Office',
        required: true
    },

    dentist_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'Dentist',
        required: true
    },

    date_and_time: {
        type: Date, // Use Date type for date handling
        required: true
    }

   
});

module.exports = bookingDbConnection.model('Timeslot', timeslotSchema);