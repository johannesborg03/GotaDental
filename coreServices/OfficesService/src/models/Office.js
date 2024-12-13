var mongoose = require('mongoose');
const { connectToBookingDB } = require('../utils/dbConnect');

// Initialize the connection
const bookingDbConnection = connectToBookingDB();

var Schema = mongoose.Schema;

var officeSchema = new mongoose.Schema({
    office_name: {
        type: String,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    dentists: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Dentist", // Reference to the Dentist model
        },
      ],
    office_address: { 
        type: String,
        required: true
    },
   
});

module.exports = bookingDbConnection.model('Office', officeSchema);