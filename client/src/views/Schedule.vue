<template>
  <div class="mb-4 text-center">
    <h1 class="text-primary">
      {{ officeName || "OFFICE NAME" }}
    </h1>
  </div>
  <div>
    <button @click="prevWeek">Previous Week</button>
    <button @click="nextWeek">Next Week</button>
    <DayPilotCalendar :config="calendarConfig" />
    <div v-if="selectedTimeslot" class="mt-3">
      <p>Selected Timeslot:</p>
      <p>Status: {{ selectedTimeslot.isBooked ? "Booked" : "Unbooked" }}</p>
      <p>Start: {{ selectedTimeslot.start }}</p>
      <p>End: {{ selectedTimeslot.end }}</p>
      <button @click="saveTimeslot" class="btn btn-primary">Save Timeslot</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { DayPilotCalendar } from "@daypilot/daypilot-lite-vue";
import axios from "axios";
import { io } from "socket.io-client";

const officeName = ref("");

// WebSocket setup
const socket = io("http://localhost:4000"); // API Gateway WebSocket server URL
const officeAddress = ref("");

// Function to fetch the office name from session storage
function loadOfficeName() {
  const storedOfficeName = sessionStorage.getItem("Office");
  if (storedOfficeName) {
    officeName.value = storedOfficeName;
  } else {
    officeName.value = "OFFICE NAME"; // Default fallback
  }
}

// Function to calculate the start of the current week (Monday)
function getCurrentWeekStart() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 (Sunday) to 6 (Saturday)
  const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek; // Adjust to Monday
  now.setDate(now.getDate() + diffToMonday);
  return now.toISOString().split("T")[0]; // Return in "YYYY-MM-DD" format
}

// State for selected timeslot
const selectedTimeslot = ref(null);

// State for events fetched from the backend
const events = ref([]);

// Reactive configuration
const calendarConfig = ref({
  viewType: "Week",
  startDate: getCurrentWeekStart(), // Initial week
  weekStarts: 1,
  events: [],
  onTimeRangeSelected: (args) => {
    // Callback triggered when a time range is selected
    // Default to "Unbooked" and set the selected timeslot
    selectedTimeslot.value = {
      title: "Unbooked", // Default title
      start: args.start,
      end: args.end,
      isBooked: false, // Default state
      patient: ""
      };
    
  },
});

async function saveTimeslot() {

  if (!selectedTimeslot.value) {
    alert("No timeslot selected.");
    return;
  }

  try {
    const payload = {
      start: selectedTimeslot.value.start, // Send as is without conversion
      end: selectedTimeslot.value.end, // Send as is without conversion
      dentist: sessionStorage.getItem('userIdentifier'),
      office: sessionStorage.getItem('Office'),
      officeId: sessionStorage.getItem('OfficeId'),
      isBooked: false,
      patient: ""
    };

    console.log("Sending payload", payload);
    const response = await axios.post("http://localhost:4000/api/timeslots", payload);
    alert("Timeslot saved successfully!");
    console.log("Saved timeslot:", response.data);


    // Add the new timeslot directly to the events array
    /*
    const newTimeslot = {
      id: response.data.timeslot._id,
      text: response.data.timeslot.isBooked ? "Booked" : "Unbooked",
      start: response.data.timeslot.start,
      end: response.data.timeslot.end,
      patient: ""
    };

    events.value.push(newTimeslot); // Add the new timeslot to the events array
    calendarConfig.value.events = [...events.value]; // Update the calendar configuration

    */

    // Clear selected timeslot
    selectedTimeslot.value = null;
  } catch (error) {
    console.error("Error saving timeslot:", error);
    alert("Failed to save timeslot. Please try again.");
  }
}





// Fetch all timeslots for the office
async function fetchTimeslots() {
  const officeId = sessionStorage.getItem("OfficeId");
  if (!officeId) {
    alert("No office found in session storage.");
    return;
  }

  try {
    const response = await axios.get(`http://localhost:4000/api/offices/${officeId}/timeslots`);
    console.log("Fetched timeslots:", response.data);

    // Map the response data to the format expected by DayPilotCalendar
    events.value = response.data.timeslots.map((timeslot) => ({
      id: timeslot._id,
      text: timeslot.isBooked ? "Booked" : "Unbooked", // Display based on isBooked
      start: timeslot.start,
      end: timeslot.end,
      patient: timeslot.patient
    }));

    // Update the calendar configuration
    calendarConfig.value.events = events.value;
  } catch (error) {
    console.error("Error fetching timeslots:", error);
    alert("Failed to fetch timeslots. Please try again.");
  }
}


// Navigation methods
function prevWeek() {
  const currentDate = new Date(calendarConfig.value.startDate);
  currentDate.setDate(currentDate.getDate() - 7); // Move back by 7 days
  calendarConfig.value.startDate = currentDate.toISOString().split("T")[0]; // Update startDate
}

function nextWeek() {
  const currentDate = new Date(calendarConfig.value.startDate);
  currentDate.setDate(currentDate.getDate() + 7); // Move forward by 7 days
  calendarConfig.value.startDate = currentDate.toISOString().split("T")[0]; // Update startDate
}

function joinOfficeRoom() {
    const officeId = sessionStorage.getItem("OfficeId");
    console.log("Attempting to join room. OfficeId:", officeId, "Socket connected:", socket.connected);

    if (officeId && socket.connected) {
        socket.emit("joinOffice", { officeId });
        console.log(`Joined WebSocket room for office: ${officeId}`);
    } else {
        console.error("Failed to join room. Either OfficeId is missing or socket is not connected.");
        console.log("OfficeId:", officeId)
    }
}


// Fetch timeslots when the component is mounted
onMounted(() => {
  fetchTimeslots();
  loadOfficeName();


  socket.on("connect", () => {
        console.log("WebSocket connected:", socket.id);
        joinOfficeRoom();
    });

       // Check if the new timeslot belongs to the current office
       const officeId = sessionStorage.getItem("OfficeId");
    socket.on("timeslot/create", (newTimeslot) => {
        console.log("Received timeslot new Timeslot Created", newTimeslot);
    
        console.log("New Timeslot officeID:", newTimeslot.office,)

        if (newTimeslot.office === officeId) {
            events.value.push({
                id: newTimeslot._id,
                text: newTimeslot.isBooked ? "Booked" : "Unbooked", // Update dynamically
                start: newTimeslot.start,
                end: newTimeslot.end,
            });
            calendarConfig.value.events = [...events.value];
            console.log("Updated events after WebSocket create:", events.value);
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
/* Default styling for the full date */
.calendar_default_colheader_inner {
  display: block;
}

/* Shortened date styling for screens smaller than 768px */
@media (max-width: 768px) {
  .calendar_default_colheader_inner {
    display: inline-block;
    text-align: center;
  }

}
</style>