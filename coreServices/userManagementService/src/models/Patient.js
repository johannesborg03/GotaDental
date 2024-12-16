var mongoose = require('mongoose');
const { connectToPatientDB } = require('../utils/userDbConnect');

// Initialize the connection
const patientDbConnection = connectToPatientDB();
var Schema = mongoose.Schema;

var patientSchema = new mongoose.Schema({
    patient_ssn : {
        type : String,
        required : true,
        min : 5,
        max : 20,
        unique : true
    },
    password : {
        type : String,
        required: true,
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
    notified : {
        type : Boolean,
        required : true
    },
    appointments : [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Timeslot'      // Reference to Appointments
    }]


}); 


module.exports = patientDbConnection.model('Patient', patientSchema);



