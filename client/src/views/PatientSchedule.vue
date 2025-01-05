<template>
  <b-container fluid>
    <b-row>
      <b-col md="4" class="text-left" style="margin-top: 65px;">
        <h4>Select an Office:</h4>
        <b-form-select v-model="selectedOfficeId" @change="handleOfficeChange" class="mb-3">
          <option disabled value="">Select an office</option>
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
const bookedTimeslots = ref([]);

// Reactive configuration
// Updated onEventClick logic to handle both booking and cancellation
const calendarConfig = ref({
  viewType: "Week",
  startDate: getCurrentWeekStart(),
  weekStarts: 1,
  events: [],
  timeRangeSelectedHandling: "Enabled",
  onTimeRangeSelected: async (args) => {
    const startTime = args.start.toString();
    const endTime = args.end.toString();

    const confirmCreation = confirm(`Do you want to create a timeslot from ${startTime} to ${endTime}?`);

    if (confirmCreation) {
        try {
            const payload = {
                start: startTime,
                end: endTime,
                patient: sessionStorage.getItem('userIdentifier'),
                createdBy: 'patient',
                officeId: sessionStorage.getItem('OfficeId'),
            };

            const response = await axios.post("http://localhost:4000/api/timeslots", payload);

            if (response.status === 201) {
                alert("Timeslot created successfully!");

                // Add the created timeslot to the calendar
                events.value.push({
                    id: response.data.timeslot._id,
                    text: "Requested",
                    start: response.data.timeslot.start,
                    end: response.data.timeslot.end,
                    backColor: "#FFCC00", // Yellow for patient-created timeslots
                });
                calendarConfig.value.events = [...events.value];
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error("Error creating timeslot:", error);
            alert(error.response?.data?.message || "Failed to create timeslot. Please try again.");
        }
    }

    args.preventDefault();
},
  onEventRender: (args) => {
    // Dynamically change the event background color based on booking status
    const event = args.data;
    if (event.color) {
      args.element.style.backgroundColor = event.color; // Apply background color for booked or unbooked
    }
  },
  eventClickHandling: "Enabled", // Enable event clicking

  onEventClick: async (args) => {
    const timeslotId = args.e.id();
    console.log("Timeslot ID:", timeslotId); // Add a log to verify
    const selectedTimeslot = events.value.find((event) => event.id === timeslotId);

    const sessionID = sessionStorage.getItem("userIdentifier")
    console.log("log id " + sessionID);

    const response = await axios.get(`http://localhost:4000/api/patients/${sessionID}`);

    console.log("Axios Response:", response);

    const patient = response.data.patient;
    const patientID = patient.patientId;
    console.log(patientID);

    const timeslotPatient = selectedTimeslot["patient"];
    console.log("Timeslot Patient:", timeslotPatient);

    if (selectedTimeslot.text === "Booked" && timeslotPatient === patientID) {

      const confirmCancel = confirm(`Do you want to cancel this appointment? ${args.e.start()} - ${args.e.end()}`);
      if (confirmCancel) {
        await cancelTimeslot(timeslotId);
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
    // console.log ('OfficeAddress', response.data.office.OfficeAddress);
    // console.log('OfficeId in response:', response.data.offices.selectedOfficeId);

  } catch (error) {
    console.error("Error fetching offices:", error);
  }
}

function handleOfficeChange() {
  if (selectedOfficeId.value) {
    console.log("Joining office room:", selectedOfficeId.value);
    // Fetch timeslots for the selected office
    sessionStorage.setItem('OfficeId', selectedOfficeId.value);

    // Emit WebSocket event to join the selected office's room
    if (socket.connected) {
      socket.emit("joinOffice", { officeId: selectedOfficeId.value });
    }
    fetchTimeslots();

  }
}


async function fetchUserId() {

  try {
    let patient = sessionStorage.getItem("userIdentifier");
    const response = await axios.get(`http://localhost:4000/api/patients/${patient}`);
    const patientId = response;
    console.log("Response:", response);
    // Store the patientId in sessionStorage
    sessionStorage.setItem("patientId", response.data.patient.patientId);
    console.log("patient ID:", response.data.patient.patientId);


  } catch (error) {
    console.error("Error fetching PatientId:", error);
    alert("Failed to fetch PatientId. Please try again.");
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



    // fetchUserId();
    const patientId = sessionStorage.getItem("patientId");
    // Map the response data to the format expected by DayPilotCalendar
    events.value = response.data.timeslots.map((timeslot) => ({
      id: timeslot._id,
      text: timeslot.isBooked ? "Booked" : "Unbooked", // Set text dynamically
      start: timeslot.start,
      end: timeslot.end,
      patient: timeslot.patient,
      backColor: timeslot.patient === patientId ? 'yellow' : (timeslot.isBooked ? '#EC1E1E' : '#62FB08')
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
      patient: sessionStorage.getItem("userIdentifier"),
      action: "book",
      officeId: sessionStorage.getItem("OfficeId")

    });

    alert("Timeslot booked successfully!");

    console.log(response);

    // Update the calendar
    const updatedTimeslot = response.data.timeslot;
    const eventIndex = events.value.findIndex((event) => event.id === updatedTimeslot._id);
    if (eventIndex !== -1) {
      events.value[eventIndex].text = "Booked";
      events.value[eventIndex].backColor = 'yellow'; // Set color to yellow for the booked timeslot
      calendarConfig.value.events = [...events.value];
    }
  } catch (error) {
    console.error("Error booking timeslot:", error);

    // Check for specific error message from the backend
    if (error.response) {
      const { data } = error.response;

      // Handle the "maximum timeslots" error
      if (data && data.error === "You have already booked 5 timeslots for this office.") {
        alert("You cannot book more than 5 timeslots for this office. Please cancel an existing one to book a new timeslot.");
      } else {
        alert(data.error || "Failed to book the timeslot. Please try again.");
      }
    } else {
      alert("Failed to book the timeslot. Please try again.");
    }
  }
}

// Function to cancel a timeslot
async function cancelTimeslot(timeslotId) {
  sessionStorage.setItem('OfficeId', selectedOfficeId.value);
  const officeId = sessionStorage.getItem("OfficeId");
  try {
    const response = await axios.patch(`http://localhost:4000/api/timeslots/${timeslotId}`, {
      isBooked: false,
      patient: sessionStorage.getItem("userIdentifier"),
      action: "cancel",
      officeId: officeId

    });

    alert("Appointment cancelled successfully!");

  
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
  fetchUserId();

  socket.on("connect", () => {
    console.log("WebSocket connected:", socket.id);
  });


  socket.on("timeslot/create", (newTimeslot) => {
    console.log("Received timeslot new Timeslot Created", newTimeslot);
    console.log("Current selectedOfficeId:", selectedOfficeId.value, "NewTimeslot OfficeId:", newTimeslot);


    if (newTimeslot.office === selectedOfficeId.value) {
      events.value.push({
        id: newTimeslot._id,
        text: newTimeslot.isBooked ? "Booked" : "Unbooked", // Update dynamically
        start: newTimeslot.start,
        end: newTimeslot.end,
        backColor: '#62FB08'

      });
      calendarConfig.value.events = [...events.value];
      console.log("Updated events after WebSocket create:", events.value);
    }
  });

  // Listen for timeslot updates
  socket.on("timeslot/update", (updatedTimeslot) => {
    console.log("Received timeslot update:", updatedTimeslot);

    const patientId = sessionStorage.getItem("patientId");



    // Find the corresponding timeslot in the events array
    const eventIndex = events.value.findIndex(event => event.id === updatedTimeslot._id);
    if (eventIndex !== -1) {
      // Update the event text to "Booked" or "Unbooked" based on the isBooked status
      events.value[eventIndex].text = updatedTimeslot.isBooked ? "Booked" : "Unbooked";
      // Update the event data
      events.value[eventIndex].isBooked = updatedTimeslot.isBooked; // Update isBooked status
      events.value[eventIndex].patient = updatedTimeslot.patient; // Optionally update patient
      

         // Update the color logic
    events.value[eventIndex].backColor = updatedTimeslot.patient === null
      ? '#62FB08' // Green for unbooked timeslots
      : (updatedTimeslot.patient === patientId 
          ? 'yellow' // Yellow for the patient who booked
          : '#EC1E1E'); // Red for other patients

          console.log("Updated event color:", events.value[eventIndex].backColor);
        console.log("patientUpdated Timeslot:", updatedTimeslot.patient, "patientId:", patientId);
      // Re-render the calendar
      calendarConfig.value.events = [...events.value];
      console.log("Updated events after WebSocket update:", events.value);
    } else {
      console.error(`No event found with id ${updatedTimeslot.timeslot_id}`);
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
