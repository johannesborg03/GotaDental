<template>
    <div class="container mt-5">
        <h1 class="text-primary text-center">Your Booked Timeslots</h1>

        <div v-if="error" class="alert alert-danger" role="alert">
            {{ error }}
        </div>

        <h3>Select an Office:</h3>
        <select v-model="selectedOfficeId" @change="handleOfficeChange" class="form-select mb-3">
            <option disabled value="">Select an office</option>
            <option v-for="office in offices" :key="office._id" :value="office._id">
                {{ office.office_name }}
            </option>
        </select>

        <!-- Display Booked Timeslots-->
        <div v-if="bookedTimeslots.length > 0" class="booked-timeslots-container">
            <div v-for="(timeslot, index) in bookedTimeslots" :key="timeslot._id" class="timeslot-box">
                <h5>Timeslot {{ index + 1 }}</h5>
                <p><strong>Start:</strong> {{ formatDate(timeslot.start) }}</p>
                <p><strong>End:</strong> {{ formatDate(timeslot.end) }}</p>
            </div>
        </div>
        <div v-else>
            <p class="text-muted">You currently have no booked timeslots.</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { io } from "socket.io-client";
import axios from "axios";

// WebSocket setup
const socket = io("http://localhost:4000"); // API Gateway WebSocket server URL

const offices = ref([]);
const selectedOfficeId = ref("");
const bookedTimeslots = ref([]);
const error = ref(null);

// Fetch available offices
async function fetchOffices() {
    try {
        const response = await axios.get("http://localhost:4000/api/offices");
        offices.value = response.data.offices;
        console.log("OFFICES:", response.data.offices);
        console.log('OfficeId in response:', response.data.offices.selectedOfficeId);
    } catch (err) {
        console.error("Error fetching offices:", err);
        error.value = "Failed to load offices. Please try again.";
    }
}

function handleOfficeChange() {
    if (selectedOfficeId.value) {
        console.log("Joining office room:", selectedOfficeId.value);
        // Fetch timeslots for the selected office

        // Emit WebSocket event to join the selected office's room
        if (socket.connected) {
            socket.emit("joinOffice", { officeId: selectedOfficeId.value });
        }
        fetchBookedTimeslots();
    }
}
// Fetch booked timeslots for the selected office
async function fetchBookedTimeslots() {
    if (!selectedOfficeId.value) {
        alert("No office selected.");
        return;
    }

    try {
        const patient = sessionStorage.getItem("userIdentifier");
        if (!patient) {
            error.value = "User not logged in. Please log in to view your timeslots.";
            return;
        }

        console.log("Making API request with: ", {
            patient
        });
        const response = await axios.get(`http://localhost:4000/api/patients/${patient}/timeslots`);
        console.log("Fetched Booked Timeslots:", response.data);
        // Ensure timeslots are returned in the response
        bookedTimeslots.value = response.data.timeslots || [];

    } catch (error) {
        console.error("Error fetching appointments:", error);
        error.value = error.response?.data?.message || "Failed to load booked timeslots.";
    }
}

function formatDate(date) {
    return new Date(date).toLocaleString();
}

onMounted(() => {
    fetchOffices();

    socket.on("connect", () => {
        console.log("WebSocket connected:", socket.id);
    });
    socket.on("timeslot/update", (updatedTimeslot) => {
        const patientSSN = sessionStorage.getItem("userIdentifier");
        if (updatedTimeslot.isBooked && updatedTimeslot.patient === patientSSN && updatedTimeslot.office === selectedOfficeId.value) {
            const existingIndex = bookedTimeslots.value.findIndex((slot) => slot.id === updatedTimeslot.timeslot_id);
            if (existingIndex !== -1) {
                bookedTimeslots.value[existingIndex] = updatedTimeslot;
            } else {
                bookedTimeslots.value.push(updatedTimeslot); // Add new timeslot
            }
        }
    });

    socket.on("disconnect", () => {
        console.log("WebSocket disconnected");
    });
});

// Cleanup WebSocket connection
onUnmounted(() => {
    socket.disconnect();
});

</script>

<style>
.booked-timeslots-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-top: 20px;
}

.timeslot-box {
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 20px;
    width: 250px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>