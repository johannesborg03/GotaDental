<template>
   <div>
    <button @click="prevWeek">Previous Week</button>
    <button @click="nextWeek">Next Week</button>
    <DayPilotCalendar :config="calendarConfig" />
  </div>
  </template>
  
  <script setup>
  import { ref } from "vue";
  import { DayPilotCalendar } from "@daypilot/daypilot-lite-vue";
  

// Function to calculate the start of the current week (Monday)
function getCurrentWeekStart() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 (Sunday) to 6 (Saturday)
  const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek; // Adjust to Monday
  now.setDate(now.getDate() + diffToMonday);
  return now.toISOString().split("T")[0]; // Return in "YYYY-MM-DD" format
}



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
      const newEvent = {
        id: String(calendarConfig.value.events.length + 1), // Generate unique ID
        text: title,
        start: args.start, // Selected start time
        end: args.end, // Selected end time
      };
      calendarConfig.value.events.push(newEvent); // Add new appointment to events
    }
  },
  });
  
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