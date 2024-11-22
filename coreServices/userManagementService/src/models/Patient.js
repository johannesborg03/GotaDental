var mongoose = require('mongoose');
const { patientDbConnection } = require('../utils/userDbConnect');
var Schema = mongoose.Schema;

var patientSchema = new mongoose.Schema({
    patient_username : {
        type : String,
        required : true,
        min : 1,
        max : 50,
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
        type: mongoose.Schema.Types.ObjectId, ref: 'Appointment'      // Reference to Appointments
    }]


}); 


module.exports = (connection) => connection.model('Patient', patientSchema);



