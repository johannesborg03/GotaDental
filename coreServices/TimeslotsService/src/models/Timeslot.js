var mongoose = require('mongoose');
const { connectToBookingDB } = require('../utils/dbConnect');

// Initialize the connection
const bookingDbConnection = connectToBookingDB();
var Schema = mongoose.Schema;

var timeslotSchema = new mongoose.Schema({

    notes: {
        type: String,
      },
      start: {
        type: Date,
        required: true, // Start date and time
      },
      end: {
        type: Date,
        required: true, // End date and time
      },
      dentist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Dentist", // Reference to Dentist model
        required: true, // Each time slot must belong to a dentist
      },
      office: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Office", // Reference to Office model
        required: true, // Each time slot must belong to an office
      },
      createdAt: {
        type: Date,
        default: Date.now, // Automatically store creation timestamp
      },
      isBooked: {
        type: Boolean,
        default: false,
      },
      patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient", // Reference to the Patient who booked the slot
        default: null
      },
      
    });

module.exports = bookingDbConnection.model('Timeslot', timeslotSchema);