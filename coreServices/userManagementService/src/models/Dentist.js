var mongoose = require('mongoose');
const { dentistDbConnection } = require('../utils/userDbConnect');
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
    },
    date_of_birth : {
        type: Date,
    },
    appointments : [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Appointment'      // Reference to Appointments
    }],
    timeslots : [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Timeslot'      // Reference to Appointments
    }]
});


var Dentist = dentistDbConnection.model('Dentist', dentistSchema);
module.exports = Dentist;