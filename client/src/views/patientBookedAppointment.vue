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
    } catch (err) {
        console.error("Error fetching offices:", err);
        error.value = "Failed to load offices. Please try again.";
    }
}


function handleOfficeChange() {
    if (selectedOfficeId.value) {
        
        // Fetch timeslots for the selected office

         // Clear the currently displayed timeslots
         bookedTimeslots.value = [];
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

        

        const response = await axios.get(`http://localhost:4000/api/patients/${patient}/timeslots`, {
            params: { officeId: selectedOfficeId.value }
        });

       

        // Ensure timeslots are returned in the response and adjust times
        bookedTimeslots.value = (response.data.timeslots || []).map(timeslot => {
            const adjustedStart = new Date(timeslot.start);
            const adjustedEnd = new Date(timeslot.end);

            adjustedStart.setHours(adjustedStart.getHours() - 1); // Subtract 1 hour from start
            adjustedEnd.setHours(adjustedEnd.getHours() - 1);     // Subtract 1 hour from end

            return {
                ...timeslot,
                start: adjustedStart.toISOString(),
                end: adjustedEnd.toISOString()
            };
        });

      
    } catch (error) {
        console.error("Error fetching appointments:", error);
        error.value = error.response?.data?.message || "Failed to load booked timeslots.";
    }
}

function formatDate(date) {
    return new Date(date).toLocaleString();
}
function joinOfficeRoom() {
  const officeId = sessionStorage.getItem("OfficeId");
 
  if (officeId && socket.connected) {
    socket.emit("joinOffice", { officeId });
    console.log(`Joined WebSocket room for office: ${officeId}`);
  } else {
    console.error("Failed to join room. Either OfficeId is missing or socket is not connected.");
    console.log("OfficeId:", officeId)
  }
}

onMounted(() => {
    fetchOffices();
    //fetchBookedTimeslots();

    socket.on("connect", () => {
        joinOfficeRoom();
        console.log("WebSocket connected:", socket.id);
    });
    socket.on("timeslot/update", (updatedTimeslot) => {
    

    const patientSSN = sessionStorage.getItem("userIdentifier");
    const officeId = selectedOfficeId.value;

    // Ensure the updated timeslot belongs to the current office
    if (updatedTimeslot.office === officeId) {
        const existingIndex = bookedTimeslots.value.findIndex(
            (slot) => slot._id === updatedTimeslot._id // Match by correct field (_id)
        );

        if (updatedTimeslot.isBooked && updatedTimeslot.patient === patientSSN) {
            // If the timeslot is booked and belongs to the patient
            if (existingIndex !== -1) {
                // Update the existing timeslot
                bookedTimeslots.value[existingIndex] = {
                    ...bookedTimeslots.value[existingIndex],
                    ...updatedTimeslot,
                };
            } else {
                // Add the new timeslot
                bookedTimeslots.value.push(updatedTimeslot);
            }
        
        } else if (!updatedTimeslot.isBooked) {
            // If the timeslot is unbooked (canceled), remove it
            if (existingIndex !== -1) {
                bookedTimeslots.value.splice(existingIndex, 1);
                console.log("Removed canceled timeslot:", updatedTimeslot);
            } else {
                console.error("Unable to find timeslot to remove:", updatedTimeslot);
            }
        }
    } else {
        console.log("Timeslot update ignored - does not belong to the current office.");
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
    justify-content: center; /* Centers content horizontally */
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