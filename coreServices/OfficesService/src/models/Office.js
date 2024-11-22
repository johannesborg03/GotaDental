var mongoose = require('mongoose');
const { connectToBookingDB } = require('../utils/dbConnect');

// Initialize the connection
const bookingDbConnection = connectToBookingDB();

var Schema = mongoose.Schema;

var officeSchema = new mongoose.Schema({
    office_id : {
        type : String,
        required : true,
        unique : true,
    },
    office_name : {
        type : String,
        required : true,
    },

    office_address : {
        type : String,
        required : true,
    },

    dentist_username: {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'Dentist',
        required: true
    },

    latitude: {
        type : Number,
        required : true,
        min: -90,  // Ensuring latitude is within valid range
        max: 90    // Ensuring latitude is within valid range
    },

    longitude: {
        type : Number,
        required : true,
        min: -180, // Ensuring longitude is within valid range
        max: 180   // Ensuring longitude is within valid range
    }

    


   
});

module.exports = bookingDbConnection.model('Office', officeSchema);