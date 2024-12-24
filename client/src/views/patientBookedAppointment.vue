<template>
    <div class="container mt-5">
        <h1 class="text-primary text-center">Your Booked Timeslots</h1>

        <div v-if="loading" class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>

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
import { ref, onMounted, onUnmounted } from "vue";
import { io } from "socket.io-client";
import axios from "axios";

// WebSocket setup
const socket = io("http://localhost:4000"); // API Gateway WebSocket server URL

const offices = ref([]);
const selectedOfficeId = ref("");
const bookedTimeslots = ref([]);
const loading = ref(true);
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
    loading.value = true;

    try {
        const patientSSN = sessionStorage.getItem("userIdentifier");
        if (!patientSSN) {
            throw new Error("Patient identifier not found.");
        }

        console.log("Making API request with: ", {
            patientSSN,
            officeId: selectedOfficeId.value,
        });
        const response = await axios.get(`http://localhost:4000/api/patients/${patientSSN}/timeslots`,
            { params: { officeId: selectedOfficeId.value } });
        console.log("Fetched Booked Timeslots:", response.data);
        bookedTimeslots.value = response.data.timeslots.filter((t) => t.isBooked);
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
    fetchOffices();

    socket.on("connect", () => {
        console.log("WebSocket connected:", socket.id);
    });
    socket.on("timeslot/update", (updatedTimeslot) => {
        if (updatedTimeslot.isBooked && updatedTimeslot.patient === sessionStorage.getItem("userIdentifier")) {
            const existingIndex = bookedTimeslots.value.findIndex((slot) => slot.id === updatedTimeslot.timeslot_id);
            if (existingIndex === -1) {
                bookedTimeslots.value.push(updatedTimeslot);
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