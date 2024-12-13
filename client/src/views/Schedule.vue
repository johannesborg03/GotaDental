<template>
   <div>
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
  import { ref } from "vue";
  import { DayPilotCalendar } from "@daypilot/daypilot-lite-vue";
  import  axios from "axios";

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

  // Reactive configuration
  const calendarConfig = ref({
    viewType: "Week",
    startDate: getCurrentWeekStart(), // Initial week
    weekStarts: 1,
    events: [ ],
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

async function saveTimeslot() {
  if (!selectedTimeslot.value) {
    alert("No timeslot selected.");
    return;
  }

  try {
    const payload = {
      title: selectedTimeslot.value.title,
      start: selectedTimeslot.value.start,
      end: selectedTimeslot.value.end,
      dentist: sessionStorage.getItem('userIdentifier') || 'Guest', // Replace with actual dentist ID
      office: "your-office-id", // Replace with actual office ID
    };

    const response = await axios.post("http://localhost:4000/api/timeslots", payload);
    alert("Timeslot saved successfully!");
    console.log("Saved timeslot:", response.data);

    // Clear selected timeslot
    selectedTimeslot.value = null;
  } catch (error) {
    console.error("Error saving timeslot:", error);
    alert("Failed to save timeslot. Please try again.");
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



  </script>