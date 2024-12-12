var mongoose = require('mongoose');
const { connectToOfficeDB } = require('../utils/officeDBConnect');

// Initialize the connection
const officeDbConnection = connectToOfficeDB();

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
    office_address: { 
        type: String,
        required: true
    },
    dentist_username: { 
        type: String,
        required: true
    }
});

module.exports = officeDbConnection.model('Office', officeSchema);