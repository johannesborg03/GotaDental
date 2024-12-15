<template>
  <div>

    <h3>Select an Office:</h3>
    <select v-model="selectedOfficeId" @change="fetchTimeslots" class="form-select mb-3">
      <option disabled value="">Select an office</option>
      <option v-for="office in offices" :key="office._id" :value="office._id">
        {{ office.office_name }}
      </option>
    </select>

    <div v-if="!selectedOfficeId" class="alert alert-info mt-3">
      Please select an office to view available timeslots.
    </div>

    <button @click="prevWeek">Previous Week</button>
    <button @click="nextWeek">Next Week</button>
    <DayPilotCalendar :config="calendarConfig" />

   



    <div v-if="selectedTimeslot" class="mt-3">
      <p>Selected Timeslot:</p>
      <p>Title: {{ selectedTimeslot.title }}</p>
      <p>Start: {{ selectedTimeslot.start }}</p>
      <p>End: {{ selectedTimeslot.end }}</p>
      <button @click="saveTimeslot" class="btn btn-primary">Save Timeslot</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { DayPilotCalendar } from "@daypilot/daypilot-lite-vue";
import axios from "axios";

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
const selectedOfficeId = ref("");
const offices = ref([]);
const events = ref([]);

// Reactive configuration
const calendarConfig = ref({
  viewType: "Week",
  startDate: getCurrentWeekStart(), // Initial week
  weekStarts: 1,
  events: [],
  onTimeRangeSelected: (args) => {
    // Callback triggered when a time range is selected
    const title = prompt("Enter the appointment title:", "New Appointment");
    if (title) {
      selectedTimeslot.value = {
        title,
        start: args.start,
        end: args.end,
      };
    }
  },
});

// Fetch all offices for the dropdown
async function fetchOffices() {
  try {
    const response = await axios.get("http://localhost:4000/api/offices");
    offices.value = response.data.offices; // Replace with actual API response
    console.log("OFFICES:", response.data.offices);
  } catch (error) {
    console.error("Error fetching offices:", error);
    alert("Failed to fetch offices. Please try again.");
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
      text: timeslot.title,
      start: timeslot.start,
      end: timeslot.end,
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


// Fetch timeslots when the component is mounted
onMounted(() => {
  fetchTimeslots();
  fetchOffices();
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