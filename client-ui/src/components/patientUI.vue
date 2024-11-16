<template>
    <div class="patient-interface">
        <h1>Your account</h1>

        <div class="booking-appointment">
            <h2>Book a appointment</h2>
            <div>
                <label for="date">Select Date:</label>
                <input type="date" v-model="bookingDate" />
            </div>

            <div>
                <label for="time">Select Time:</label>
                <input type="time" v-model="bookingTime" />
            </div>

            <div>
                <button @click="bookAppointment">Book Dentist Slot</button>
            </div>
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
import { publishMessage, subscribeToTopic } from '../mqttClient';

export default {
    data() {
        return {
            bookingDate: '',
            bookingTime: '',
            bookingNotification: '',
            notifications: [],
        };
    },
    methods: {
        bookAppointment() {
            if (!this.bookingDate || !this.bookingTime) {
                this.bookingNotification = 'Please select a valid date and time!';
                return;
            }

            const topic = 'appointments/requests';
            const message = JSON.stringify({
                patientId: 'patient_123', //Change later to retrieve the patient id
                date: this.bookingDate,
                time: this.bookingTime,
            });

            publishMessage(topic, message);

            this.bookingNotification = `Appointment requested for ${this.bookingDate} at ${this.bookingTime}`;

            this.bookingDate = '';
            this.bookingTime = '';
        },
    },
    mounted() {
        // Subscribe to notifications for this patient
        const topic = 'appointments/notifications';
        subscribeToTopic(topic, (message) => {
            this.notifications.push(message);
        });
    },
};
</script>