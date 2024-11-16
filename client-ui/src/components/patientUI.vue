<template>
    <div class="patient-interface">
        <h1>Your account</h1>

        <div class="booking-appointment">
            <h2>Book a appointment</h2>
            <label for="date">Select Date:</label>
            <input type="date" v-model="bookingDate" />

            <label for="time">Select Time:</label>
            <input type="time" v-model="bookingTime" />

            <button @click="bookAppointment">Book Dentist Slot</button>
            <p v-if="bookingNotification" class="bookingNotification">{{ bookingNotification }}</p>
        </div>

        <div class="notifications">
            <h2>Notification</h2>
            <ul>
                <li v-for="(notification, index) in notifications" :key="index">
                    {{ notification.message }} - {{ notification.date }}
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import mqttClient from '../mqttClient';

export default {
    data() {
        return {
            bookingDate: "",
            bookingTime: "",
            bookingNotification: "",
            notification: [],
        }
    },
    methods: {
        bookAppointment() {
            if (!this.bookingDate || !this.bookingTime) {
                this.bookingNotification = 'Please select both a date and time.';
                return;
            }

            const message = JSON.stringify({
                date: this.bookingDate,
                time: this.bookingTime,
            });

            // Publish the booking message to the MQTT topic
            mqttClient.publish('appointments/bookings', message, (err) => {
                if (err) {
                    console.error('Publish error:', err);
                    this.bookingNotification = 'Failed to book the appointment.';
                } else {
                    console.log('Booking message published:', message);
                    this.bookingNotification = 'Appointment booked successfully!';
                }
            });
        },
    },
    mounted() {
        // Subscribe to notifications topic
        mqttClient.subscribe('appointments/notifications', (err) => {
            if (err) {
                console.error('Subscription error:', err);
            } else {
                console.log('Subscribed to appointments/notifications');
            }
        });

        // Listen for messages on the notifications topic
        mqttClient.on('message', (topic, message) => {
            if (topic === 'appointments/notifications') {
                const notification = JSON.parse(message.toString());
                this.notifications.push(notification); // Add the notification to the notifications array
            }
        });
    },
}
</script>