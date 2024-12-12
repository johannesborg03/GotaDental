<template>
    <div class="container py-4">
        <div class="mb-4 text-center">
            <h1 class="text-primary">Available Appointments</h1>
        </div>

        <button class="btn btn-primary">
      <router-link to="/patientTimeslot" class="text-white text-decoration-none">
        Available Timeslots</router-link>
    </button>
        

        <!-- Available Timeslots -->
        <div v-if="timeslots.length > 0">
            <h2 class="mt-4">Available Timeslots</h2>
            <div v-for="slot in timeslots" :key="slot.id" class="card my-2 p-2">
                <p>
                    <strong>Date:</strong> {{ new Date(slot.date_and_time).toLocaleDateString() }} <br>
                    <strong>Time:</strong> {{ new Date(slot.date_and_time).toLocaleTimeString() }} <br>
                    <strong>Dentist:</strong> {{ slot.dentist_username }}
                </p>
                <button class="btn btn-primary" @click="bookTimeslot(slot.id)" :disabled="slot.is_booked">
                    {{ slot.is_booked ? "Booked" : "Book Slot" }}
                </button>
            </div>
        </div>
        <p v-else class="text-danger mt-4">No available timeslots for the selected office.</p>
    </div>
</template>

<script>
import axios from "axios";

export default {
    data() {
        return {
            offices: [],
            timeslots: [],
            selectedOffice: null,
        };
    },
    async mounted() {
        await this.fetchOffices();
    },
    methods: {
        async fetchOffices() {
            try {
                const response = await axios.get("http://localhost:4000/api/offices");
                this.offices = response.data.offices || [];
            } catch (error) {
                console.error("Error fetching offices:", error.response?.data || error.message);
                alert("Failed to load offices. Please try again.");
            }
        },
        async fetchTimeslots() {
            if (!this.selectedOffice) return;

            try {
                const response = await axios.get(`http://localhost:4000/api/timeslots/${this.selectedOffice}`);
                this.timeslots = response.data.timeslots || [];
            } catch (error) {
                console.error("Error fetching timeslots:", error.response?.data || error.message);
                alert("Failed to load timeslots. Please try again.");
            }
        },
        async bookTimeslot(timeslotId) {
            try {
                const response = await axios.post(`http://localhost:4000/api/timeslots/book`, {
                    timeslot_id: timeslotId,
                });
                if (response.status === 200) {
                    alert("Timeslot booked successfully!");
                    this.fetchTimeslots(); // Refresh timeslots after booking
                }
            } catch (error) {
                console.error("Error booking timeslot:", error.response?.data || error.message);
                alert("Failed to book timeslot. Please try again.");
            }
        },
    },
};
</script>
