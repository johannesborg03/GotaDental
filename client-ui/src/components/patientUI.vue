<template>
    <div class="container py-4">
        <!-- Account Section -->
        <div class="mb-4">
            <h1 class="text-primary">Your Account</h1>
        </div>
        <!-- Booking Appointment Section -->
        <div class="card mb-4 shadow-sm">
            <div class="card-body">
                <h2 class="card-title">Book an Appointment</h2>
                <form @submit.prevent="bookAppointment">
                    <!-- Date Input -->
                    <div class="mb-3">
                        <label for="date" class="form-label">Select Date:</label>
                        <input type="date" id="date" class="form-control" v-model="bookingDate" required />
                    </div>
                    
            </div>
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