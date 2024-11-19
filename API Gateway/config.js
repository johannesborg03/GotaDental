module.exports = {
  mqttBrokerUrl: '', // ADD 
   
  topics: [
    "auth/login/request",
    "auth/logout/request",
    "booking/request",
    "booking/cancel",
    "availability/check/request",
    "availability/slot/reserve",
    "availability/slot/release",
    "appointment/book",
    "appointment/cancel",
    "notifications/send",
  ],
  topicHandlers: {
    "auth/login/request": "api/auth/login",
    "auth/logout/request": "api/auth/logout",
    "booking/request": "api/booking/request",
    "booking/cancel": "api/booking/cancel",
    "availability/check/request": "api/availability/check",
    "availability/slot/reserve": "api/availability/reserve",
    "availability/slot/release": "api/availability/release",
    "appointment/book": "api/appointment/book",
    "appointment/cancel": "api/appointment/cancel",
    "notifications/send": "api/notifications/send",
  }
};