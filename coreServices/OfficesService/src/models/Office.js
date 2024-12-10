var mongoose = require('mongoose');
const { connectToBookingDB } = require('../utils/dbConnect');

// Initialize the connection
const bookingDbConnection = connectToBookingDB();

var Schema = mongoose.Schema;

var officeSchema = new mongoose.Schema({
    office_id: {
        type: String,
        required: true,
        unique: true
    },
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
    dentists: {
        type: [String], // Array of dentist usernames
        required: true
    },
    office_address: { // Check if this exists in your schema
        type: String,
        required: true
    },
    dentist_username: { // Check if this exists in your schema
        type: String,
        required: true
    }
});

module.exports = bookingDbConnection.model('Office', officeSchema);