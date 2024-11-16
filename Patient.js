var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var patientSchema = new mongoose.Schema({
    patientId : {
        type : String,
        required : true,
        min : 1,
        max : 50,
        unique : true
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
    

}); 


var Patient = mongoose.model('Patient', patientSchema);
module.exports = Patient;
 



