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
  
  // Reactive configuration
  const calendarConfig = ref({
    viewType: "Week",
    startDate: "2024-12-11", // Initial week
    events: [
   
    ],
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