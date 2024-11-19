var mongoose = require('mongoose');
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
    booking_id : {
        type: mongoose.Schema.Types.ObjectId, ref: 'Booking'      // Reference to Booking, Should this be deleted?
    },
    appointments : [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Appointment'      // Reference to Appointments
    }]


}); 


var Patient = mongoose.model('Patient', patientSchema);
module.exports = Patient;
 



