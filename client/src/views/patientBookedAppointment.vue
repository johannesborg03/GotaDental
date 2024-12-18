<template>
    <div class="container py-4">
        <div class="mb-4 text-center">
            <h1 class="text-primary">Your Booked Appointments</h1>
        </div>

        <div>
            <!-- Booked Appointments Section -->
            <div v-if="appointments && appointments.length > 0">
                <div v-for="appointment in appointments" :key="appointment._id" class="card my-2 p-2">
                    <p>
                        <strong>Date:</strong> {{ new Date(appointment.date_and_time).toLocaleDateString() }} <br>
                        <strong>Time:</strong> {{ new Date(appointment.date_and_time).toLocaleTimeString() }} <br>
                        <strong>Dentist:</strong> {{ appointment.dentist_username }}
                    </p>
                    <button class="btn btn-danger" @click="cancelAppointment(appointment._id)" :disabled="isCanceling">
                        Cancel Appointment
                    </button>
                </div>
            </div>
            <!-- Messages for No Booked appointments -->
            <p v-else class="text-muted text-center mt-4">No booked appointments found.</p>
        </div>

    </div>
</template>

<script>
import axios from "axios";

export default {

    data() {
        return {
            appointments: [],
            isCanceling: false,
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
        // Cancel a booked appointment
        async cancelAppointment(appointmentId) {
            if (!confirm("Are you sure you want to cancel this appointment?")) return;

            this.isCanceling = true; // Disable button during API call

            try {
                const response = await axios.delete(`http://localhost:4000/api/appointments/${appointmentId}`);
                if (response.status === 200) {
                    alert("Appointment canceled successfully!");
                    this.fetchAppointments(); // Refresh appointments after cancellation
                }
            } catch (error) {
                console.error("Error canceling appointment:", error.response?.data || error.message);
                alert("Failed to cancel the appointment. Please try again.");
            } finally {
                this.isCanceling = false;
            }
        },
    },
};
</script>