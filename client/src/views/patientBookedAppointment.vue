<template>
    <div class="container mt-5">
        <h1 class="text-primary text-center">Your Booked Timeslots</h1>

        <div v-if="loading" class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>

        <div v-if="error" class="alert alert-danger" role="alert">
            {{ error }}
        </div>

        <div v-if="bookedTimeslots.length > 0">
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
                    <tr v-for="(timeslot, index) in bookedTimeslots" :key="timeslot.id">
                        <td>{{ index + 1 }}</td>
                        <td>{{ formatDate(timeslot.start) }}</td>
                        <td>{{ formatDate(timeslot.end) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-else-if="!loading" class="alert alert-info mt-3">
            You currently have no booked timeslots.
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const bookedTimeslots = ref([]);
const loading = ref(true);
const error = ref(null);


        // Fetch patient timeslots 
        async function fetchBookedTimeslots() {
            loading.value = true;
            try {
                const patientSSN = sessionStorage.getItem("userIdentifier");
                if (!patientSSN) {
                    throw new Error("Patient identifier not found.");
                }

                const response = await axios.get(`http://localhost:4000/api/patients/${patientSSN}/timeslots`);
                console.log("Fetched Booked Timeslots:", response.data);
                bookedTimeslots.value = response.data.timeslots.filter(timeslot => timeslot.isBooked);
            } catch (error) {
                console.error("Error fetching appointments:", error);
                error.value = error.response?.data?.message || "Failed to load booked timeslots.";
            } finally {
                loading.value = false;
            }
        }

        function formatDate(date) {
            return new Date(date).toLocaleString();
        }

        onMounted(() => {
            fetchBookedTimeslots();
        });
</script>