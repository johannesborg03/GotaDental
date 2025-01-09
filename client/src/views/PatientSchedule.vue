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
            Contact: (+46)76-305-55-31<br />
            Email: dentalgota@gmail.com
          </p>
        </div>

        <div v-if="showLegend" class="color-legend mb-4">
      <div class="legend-item">
        <span class="legend-box blue"></span>
        <span class="legend-text">Your requested timeslot</span>
      </div>
      <div class="legend-item">
        <span class="legend-box yellow"></span>
        <span class="legend-text">Your booked timeslot</span>
      </div>
      <div class="legend-item">
        <span class="legend-box red"></span>
        <span class="legend-text">Booked Timeslot</span>
      </div>
      <div class="legend-item">
        <span class="legend-box green"></span>
        <span class="legend-text">Unbooked Timeslot</span>
      </div>
    </div>
      </b-col>

          <!-- Color Legend -->
    






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

  <b-modal
  id="confirmation-modal"
  v-model="isModalVisible"
  title="Notification"
  centered
  static
  no-close-on-backdrop
>
<template v-if="modalMessage.text">
    <p class="text-center mb-0">{{ modalMessage.text }}</p>
  </template>
  <template v-else>
    <h5 class="text-center">{{ modalMessage.title }}</h5>
    <ul class="list-unstyled text-center">
      <li v-for="detail in modalMessage.details" :key="detail">{{ detail }}</li>
    </ul>
  </template>
  <template #footer>
    <b-button variant="primary" @click="confirmAction">OK</b-button>
    <b-button v-if="showCancelButton" variant="secondary" @click="cancelAction">Cancel</b-button>
  </template>
</b-modal>
  
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { DayPilotCalendar } from "@daypilot/daypilot-lite-vue";
import axios from "axios";
import { io } from "socket.io-client";

const isModalVisible = ref(false); // Controls modal visibility
const modalMessage = ref(""); // Dynamic modal message
const modalResolve = ref(null); // Resolver for modal confirmation
const showCancelButton = ref(true); // Controls the visibility of the Cancel button


// Function to show modal and wait for user confirmation
// Function to show modal and wait for confirmation
function waitForConfirmation() {
  return new Promise((resolve) => {
    showCancelButton.value = true; // Ensure Cancel button is visible for confirmations
    modalResolve.value = resolve;
  });
}

// Function to handle "OK" button click in modal
function confirmAction() {
  if (modalResolve.value) {
    modalResolve.value(true); // Resolve with true
    modalResolve.value = null; // Clear the resolver
  }
  isModalVisible.value = false; // Hide the modal
}

// Function to handle "Cancel" button click in modal
function cancelAction() {
  if (modalResolve.value) {
    modalResolve.value(false); // Resolve with false
    modalResolve.value = null;
    isModalVisible.value = false;
  }
}

function showModal(message, showCancel = true) {
  modalMessage.value = typeof message === "string" ? { text: message } : message;
  showCancelButton.value = showCancel; // Set whether the Cancel button should be visible
  isModalVisible.value = true;

  return new Promise((resolve) => {
    modalResolve.value = resolve; // Set the resolver
  });
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
const showLegend = ref(true);


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

   
    modalMessage.value = {
  title: "Do you want to be notified when this timeslot is available?",
  details: [`Start: ${startTime}`, `End: ${endTime}`],
};
isModalVisible.value = true;
     // Wait for user interaction
  const confirmed = await waitForConfirmation();

    if (confirmed) {
      try {
        const payload = {
          start: startTime,
          end: endTime,
          patient: sessionStorage.getItem('userIdentifier'),
          createdBy: 'patient',
          officeId: sessionStorage.getItem('OfficeId'),
        };

        const response = await axios.post("http://localhost:4000/api/timeslots", payload);

        const patientId = sessionStorage.getItem('patientId');
        if (response.status === 201) {
          showModal("You will be notified by email if this slot gets available.", false); // Hide Cancel button
          // Add the created timeslot to the calendar
          events.value.push({
            id: response.data.timeslot._id,
            text: "Requested",
            patient: patientId,
            start: response.data.timeslot.start,
            end: response.data.timeslot.end,
            backColor: "#05D5E6", // Yellow for patient-created timeslots
          });
          calendarConfig.value.events = [...events.value];
        } else {
          throw new Error(response.data.message);
        }
      } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to create timeslot. Please try again.";

      if (
        errorMessage ===
        "A timeslot created by this patient already exists in this office."
      ) {
        showModal(
          "You already have a timeslot you want to be notified of in this office.", false
        ); // Use modal instead of alert
      } else {
        showModal(errorMessage); // Use modal instead of alert
      }
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

     // If the timeslot is booked and belongs to the user, allow cancellation
  if (selectedTimeslot.text === "Booked" && timeslotPatient === patientID) {
    const confirmCancel = await showModal({
      title: "Do you want to cancel this timeslot?",
      details: [`Start: ${args.e.start()}`, `End: ${args.e.end()}`],
    });
    if (confirmCancel) {
      await cancelTimeslot(timeslotId);
    }
  }

  else if (selectedTimeslot.text === "Requested" && timeslotPatient === patientID) {
    await showModal(`This is a timeslot you want to be notified of when its available.`, false);
  }
    // If the timeslot is unbooked, allow the user to book it
   else if (selectedTimeslot.text === "Unbooked") {
    const confirmBooking =await showModal({
      title: "Do you want to book this timeslot?",
      details: [`Start: ${args.e.start()}`, `End: ${args.e.end()}`],
    });
      if (confirmBooking) {
        await bookTimeslot(timeslotId); // Call book function
      }
    }   // If the timeslot is booked and does not belong to the user, notify them
  else {
    
    await showModal("This timeslot is already booked by another user.", false);
  }
},
});
function updateLegendVisibility() {
  showLegend.value = window.innerWidth >= 768;
}


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
     // Filter and map the response data
     events.value = response.data.timeslots
      .filter((timeslot) => {
        // Only display:
        // - Timeslots created by the dentist
        // - Timeslots created by the patient themselves
        return timeslot.createdBy === "dentist" || timeslot.patient === patientId;
      })
      .map((timeslot) => ({
        id: timeslot._id,
        text: timeslot.patient === patientId && timeslot.createdBy === "patient" 
          ? "Requested" 
          : timeslot.isBooked 
          ? "Booked" 
          : "Unbooked",
        start: timeslot.start,
        end: timeslot.end,
        patient: timeslot.patient,
        backColor: timeslot.patient === patientId && timeslot.createdBy === "patient" 
          ? '#05D5E6' //Blue-ish For notification slot
          : timeslot.patient === patientId 
          ? 'yellow' // Yellow for patient-booked timeslots
          : timeslot.isBooked 
          ? '#EC1E1E' // Red for other booked timeslots
          : '#62FB08' // Green for unbooked timeslots
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

    showModal("Timeslot booked successfully!", false); // Replaced alert with modal
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

    if (error.response) {
      const { data } = error.response;
      if (data && data.error === "You have already booked 5 timeslots for this office.") {
        showModal("You cannot book more than 5 timeslots for this office. Please cancel an existing one to book a new timeslot."); // Replaced alert with modal
      } else {
        showModal(data.error || "Failed to book the timeslot. Please try again."); // Replaced alert with modal
      }
    } else {
      showModal("Failed to book the timeslot. Please try again."); // Replaced alert with modal
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

     // Use modal to display success message
     await showModal("Appointment cancelled successfully!", false); // Hide Cancel button
  } catch (error) {
    console.error("Error cancelling the timeslot:", error);

    // Use modal to display error message
    const errorMessage = error.response?.data?.message || "Failed to cancel the timeslot. Please try again.";
    await showModal(errorMessage, false); // Hide Cancel button
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

  updateLegendVisibility();
  window.addEventListener("resize", updateLegendVisibility);

  socket.on("connect", () => {
    console.log("WebSocket connected:", socket.id);
  });


  socket.on("timeslot/create", (newTimeslot) => {
  console.log("Received new timeslot:", newTimeslot);

  // Check if the new timeslot belongs to the current office
  if (newTimeslot.office === selectedOfficeId.value) {
    const patientId = sessionStorage.getItem("patientId");

    
    // Find if there's a "Requested" timeslot created by this patient with overlapping time
    const overlappingNoticeIndex = events.value.findIndex((event) => {
  // Adjust event start and end times by adding one hour
  const adjustedStart = new Date(event.start);
  const adjustedEnd = new Date(event.end);

  adjustedStart.setHours(adjustedStart.getHours() + 1); // Add 1 hour to start
  adjustedEnd.setHours(adjustedEnd.getHours() + 1);     // Add 1 hour to end

  console.log("Checking event with adjustments:");
  console.log("Event Patient ID:", event.patient, "Patient ID:", patientId);
  console.log("Event Text:", event.text);
  console.log("Adjusted Event Start:", adjustedStart, "New Timeslot End:", new Date(newTimeslot.end));
  console.log("Adjusted Event End:", adjustedEnd, "New Timeslot Start:", new Date(newTimeslot.start));

  return (
    event.patient === patientId && // Match patient ID
    event.text === "Requested" && // Match "Requested" timeslot
    adjustedStart < new Date(newTimeslot.end) && // Overlap condition with adjusted start
    adjustedEnd > new Date(newTimeslot.start)   // Overlap condition with adjusted end
  );
});

console.log("overlap", overlappingNoticeIndex);

    if (overlappingNoticeIndex !== -1) {
      console.log(
        "Removing overlapping notice timeslot:",
        events.value[overlappingNoticeIndex]
      );
      events.value.splice(overlappingNoticeIndex, 1); // Remove the overlapping notice timeslot
    }

    // Add the new dentist timeslot to the events array
    events.value.push({
      id: newTimeslot._id,
      text: newTimeslot.isBooked ? "Booked" : "Unbooked", // Dynamically set text
      start: newTimeslot.start,
      end: newTimeslot.end,
      backColor: "#62FB08", // Green for unbooked timeslot
    });

    // Update the calendar events
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
  window.removeEventListener("resize", updateLegendVisibility);
});


</script>

<style>

.color-legend {
  display: flex;
  justify-content: center;
  gap: 20px; /* Adjust spacing between legend items */
  margin-bottom: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
}

.legend-box {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  margin-right: 8px;
}

.legend-box.blue {
  background-color: #05D5E6;
}

.legend-box.yellow {
  background-color: yellow;
}

.legend-box.red {
  background-color: #EC1E1E;
}

.legend-box.green {
  background-color: #62FB08;
}

.legend-text {
  font-size: 14px;
  font-family: 'Arial', sans-serif;
}


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
