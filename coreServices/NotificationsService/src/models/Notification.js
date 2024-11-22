var mongoose = require('mongoose');
const { bookingDbConnection }  = require('../utils/dbConnect');

var Schema = mongoose.Schema;









var Notification = bookingDbConnection.model('Notification', notificationSchema);

module.exports = Notification;