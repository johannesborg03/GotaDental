var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var bookingSchema = new mongoose.Schema({
    booking_id : {
        type : String,
        required : true,
        unique : true,
    },
    booking_state : {
        type : Number,
        required : true,
        enum: [0, 1] // Only allows values 0 or 1
    },
    patient_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'Patient',
    },

    dentist_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'Dentist',
    },

    office_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'Office',
    },

    appointment_datetime: {
    type: Date, // Use Date type for date handling
    ref : 'Appointment'
    }

   
});

var Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;