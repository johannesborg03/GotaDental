var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var appointmentSchema = new mongoose.Schema({
    appointment_id : {
        type : String,
        required : true,
        unique : true
    },
    notes: {
        type: String,
         default: ''
    },

    Booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'Booking'
    },

    date_and_time: {
        type: Date, // Use Date type for date handling
        required: true
    }

   
});

var Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;