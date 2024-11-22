var mongoose = require('mongoose');
const { bookingDbConnection }  = require('../utils/dbConnect');

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

module.exports = (connection) => connection.model('Timeslot', timeslotSchema);