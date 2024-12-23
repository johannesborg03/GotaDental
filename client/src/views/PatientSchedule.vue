<template>
  <b-container fluid>
    <b-row>
      <b-col md="4" class="text-left" style="margin-top: 65px;">
        <h4>Select an Office:</h4>
        <b-form-select v-model="selectedOfficeId" @change="handleOfficeChange" class="mb-3">
          <option disabled value="" >Select an office</option>
          <option v-for="office in offices" :key="office._id" :value="office._id">
            {{ office.office_name }}
          </option>
        </b-form-select>

        <div v-if="!selectedOfficeId" class="alert alert-info mt-3">
          Please select an office to view available timeslots.
        </div>

        <div v-if="selectedOfficeId">
          <p>
            Welcome to our office! Here you can manage your schedule.
          </p>
          <p>
            Address: {{ officeAddress }}<br />
            Contact: (123) 456-7890<br />
            Email: info@office.com
          </p>
        </div>
      </b-col>

      <!-- Right Side: Calendar -->
      <b-col md="8" class="text-right">
        <div class="mb-3" style="text-align: right; margin-top: 10px;">
          <b-button @click="prevWeek" variant="secondary" class="mr-2">Previous Week</b-button>
          <b-button @click="nextWeek" variant="secondary">Next Week</b-button>
        </div>
        <DayPilotCalendar :config="calendarConfig" />
        <div v-if="selectedTimeslot" class="mt-3">
          <p>Selected Timeslot:</p>
          <p>Status: {{ selectedTimeslot.isBooked ? "Booked" : "Unbooked" }}</p>
          <p>Start: {{ selectedTimeslot.start }}</p>
          <p>End: {{ selectedTimeslot.end }}</p>
          <b-button @click="saveTimeslot" variant="primary">Save Timeslot</b-button>
        </div>
      </b-col>
    </b-row>
  </b-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { DayPilotCalendar } from "@daypilot/daypilot-lite-vue";
import axios from "axios";
import { io } from "socket.io-client";




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


// WebSocket setup
const socket = io("http://localhost:4000"); // API Gateway WebSocket server URL


// State for events fetched from the backend
const selectedOfficeId = ref("");
const offices = ref([]);
const events = ref([]);
const officeAddress = ref("");
const officeName = ref("");

// Reactive configuration
// Updated onEventClick logic to handle both booking and cancellation
const calendarConfig = ref({
  viewType: "Week",
  startDate: getCurrentWeekStart(),
  weekStarts: 1,
  events: [],
  timeRangeSelectedHandling: "Disabled",
  eventClickHandling: "Enabled", // Enable event clicking
  
  onEventClick: async (args) => {
    const timeslotId = args.e.id();
    console.log("Timeslot ID:", timeslotId); // Add a log to verify
    const selectedTimeslot = events.value.find((event) => event.id === timeslotId);

    const patientid = sessionStorage.getItem("userIdentifier")
    console.log("log id "+ patientid);
   
    const response = await axios.get(`http://localhost:3004/api/patients/${patientid}`);

    console.log("Axios Response:", response);
    
    const patient = response.data; 
    const patientID = patient.patient._id; 

        console.log(patientID);
       
        const timeslotPatient = selectedTimeslot["patient"];
        console.log("Timeslot Patient:", timeslotPatient);
        
    if (selectedTimeslot.text === "Booked" &&  timeslotPatient  ===  patientID) {
    // If the timeslot is booked and the current user is the one who booked it("userIdentifier")) {
      const confirmCancel = confirm(`Do you want to cancel this appointment? ${args.e.start()} - ${args.e.end()}`);
      if (confirmCancel) {
        await cancelTimeslot(timeslotId); // Call cancel function
      }
    }
    
    // If the timeslot is unbooked, allow the user to book it
    else if (selectedTimeslot.text === "Unbooked") {
      const confirmBooking = confirm(`Do you want to book this timeslot: ${args.e.start()} - ${args.e.end()}?`);
      if (confirmBooking) {
        await bookTimeslot(timeslotId); // Call book function
      }
    } else {
      alert("This timeslot is already booked by another user.");
    }
  },
});


// Fetch all offices for the dropdown
async function fetchOffices() {
  try {
    const response = await axios.get("http://localhost:4000/api/offices");
    offices.value = response.data.offices; // 
    console.log("OFFICES:", response.data.offices);
    console.log ('OfficeAddress', response.data.office.OfficeAddress);
    console.log('OfficeId in response:', response.data.offices.selectedOfficeId);

  } catch (error) {
    console.error("Error fetching offices:", error);
    alert("Failed to fetch offices. Please try again.");
  }
}

function handleOfficeChange() {
  if (selectedOfficeId.value) {
    console.log("Joining office room:", selectedOfficeId.value);
    // Fetch timeslots for the selected office

       // Emit WebSocket event to join the selected office's room
       if (socket.connected) {
            socket.emit("joinOffice", { officeId : selectedOfficeId.value});
        }
    fetchTimeslots();
   
  }
}

  // Fetch all timeslots for the office
  async function fetchTimeslots() {
    if (!selectedOfficeId.value) {
      alert("No office selected.");
      return;
    }

    try {
      const response = await axios.get(`http://localhost:4000/api/offices/${selectedOfficeId.value}/timeslots`);
      console.log("Fetched timeslots:", response.data);

      // Map the response data to the format expected by DayPilotCalendar
      events.value = response.data.timeslots.map((timeslot) => ({
        id: timeslot._id,
        text: timeslot.isBooked ? "Booked" : "Unbooked", // Set text dynamically
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

  //Function to book a timeslot
  async function bookTimeslot(timeslotId) {
  try {
    const response = await axios.patch(`http://localhost:4000/api/timeslots/${timeslotId}`, {
      isBooked: true,
      patient: sessionStorage.getItem("userIdentifier"), // Assuming the patient ID is stored here
    });

    alert("Timeslot booked successfully!");

    console.log(response);

    // Update the calendar
    const updatedTimeslot = response.data.timeslot;
    const eventIndex = events.value.findIndex((event) => event.id === updatedTimeslot._id);
    if (eventIndex !== -1) {
      events.value[eventIndex].text = "Booked";
      calendarConfig.value.events = [...events.value];
    }
  } catch (error) {
    console.error("Error booking timeslot:", error);
    alert("Failed to book the timeslot. Please try again.");
  }
}

// Function to cancel a timeslot
async function cancelTimeslot(timeslotId) {
  try {
    const response = await axios.patch(`http://localhost:4000/api/timeslots/${timeslotId}`, {
      isBooked: false,
      patient: sessionStorage.getItem("userIdentifier"),
      action: "cancel"
    });

    alert("Appointment cancelled successfully!");

    // Update the calendar to reflect the cancellation
    const updatedTimeslot = response.data.timeslot;
    const eventIndex = events.value.findIndex((event) => event.id === updatedTimeslot._id);
    if (eventIndex !== -1) {
      events.value[eventIndex].text = "Unbooked"; // Change the status back to "Unbooked"
      calendarConfig.value.events = [...events.value]; // Re-render the calendar
    }
  } catch (error) {
    console.error("Error cancelling the timeslot:", error);
    alert("Failed to cancel the timeslot. Please try again.");
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

  function loadOfficeAddress() {
  const storedAddress = sessionStorage.getItem("OfficeAddress");
  if (storedAddress) {
    officeAddress.value = storedAddress;
  } else {
    officeAddress.value = "OFFICE ADDRESS"; // Default fallback
  }
}

// Function to fetch the office name from session storage
function loadOfficeName() {
  const storedOfficeName = sessionStorage.getItem("Office");
  if (storedOfficeName) {
    officeName.value = storedOfficeName;
  } else {
    officeName.value = "OFFICE NAME"; // Default fallback
  }
}

 // WebSocket connection and event handling
onMounted(() => {
  fetchOffices();
  loadOfficeAddress();
  loadOfficeName();

  socket.on("connect", () => {
        console.log("WebSocket connected:", socket.id);
    });

    socket.on("timeslot/create", (newTimeslot) => {
        console.log("Received timeslot update:", newTimeslot);
        if (newTimeslot.officeId === selectedOfficeId.value) {
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

      // Listen for timeslot updates
      socket.on("timeslot/update", (updatedTimeslot) => {
        console.log("Received timeslot update:", updatedTimeslot);
        

        // Update the calendar with the new state
        const eventIndex = events.value.findIndex(event => event.id === updatedTimeslot.timeslot_id);
        if (eventIndex !== -1) {
            events.value[eventIndex].text = updatedTimeslot.isBooked ? "Booked" : "Unbooked";
            calendarConfig.value.events = [...events.value];
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