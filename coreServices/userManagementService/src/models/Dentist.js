var mongoose = require('mongoose');
const { connectToDentistDB } = require('../utils/userDbConnect');

// Initialize the connection
const dentistDbConnection = connectToDentistDB();
var Schema = mongoose.Schema;

var dentistSchema = new mongoose.Schema({
    dentist_username : {
        type : String,
        required : true,
        min : 1,
        max : 25,
        unique : true
    },
    password : {
        type : String,
        required : true,
        min : 1, 
        max : 25,
    },
    name : {
        type : String,
        required : true,
        min : 1,
        max : 50,
    },
    email : {
        type : String,
        required : true,
    },
    appointments : [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Appointment'      // Reference to Appointments
    }],
    timeslots : [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Timeslot'      // Reference to Appointments
    }]
});


module.exports = dentistDbConnection.model('Dentist', dentistSchema);