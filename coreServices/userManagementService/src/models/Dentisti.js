var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var dentistSchema = new mongoose.schema({
    dentist_id : {
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
    date_of_birth : {
        type: Date,
    },
    booking_id : {
        type: mongoose.Schema.Types.ObjectId, ref: 'Booking'      // Reference to Booking, Should this be deleted?
    },
})


var Dentist = mongoose.model('Dentist', dentistSchema);
module.exports = Dentist;