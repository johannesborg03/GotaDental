<template>
    <div class="container mt-5">
        <h1 class="text-primary text-center">Your Booked Appointments</h1>

        <div v-if="loading" class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>

        <div v-if="error" class="alert alert-danger" role="alert">
            {{ error }}
        </div>

        <div v-if="appointments.length > 0">
            <table class="table table-bordered mt-4">
                <thead class="table-primary">
                    <tr>
                        <th>#</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(appointment, index) in appointments" :key="appointment.id">
                        <td>{{ index + 1 }}</td>
                        <td>{{ formatDate(appointment.start) }}</td>
                        <td>{{ formatDate(appointment.end) }}</td>
                        <td>{{ appointment.isBooked ? "Booked" : "Unbooked" }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-else-if="!loading" class="alert alert-info mt-3">
            You currently have no booked appointments.
        </div>
    </div>
</template>

<script>
import axios from "axios";

export default {

    data() {
        return {
            appointments: [],
        };
    },
    async mounted() {
        await this.fetchAppointments();
    },

    methods: {
        // Fetch patient's appointments
        async fetchAppointments() {
            try {
                const response = await axios.get("http://localhost:4000/api/appointments/patient");
                this.appointments = response.data.appointments || [];
            } catch (error) {
                console.error("Error fetching appointments:", error.response?.data || error.message);
                this.appointments = []; // Ensure appointments is always defined
                alert("Failed to load your appointments. Please try again.");
            }
        },
    },
};
</script>