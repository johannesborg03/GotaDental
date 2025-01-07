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
  
  </div>

   <!-- Modal for saving timeslot -->
   <b-modal
    id="save-timeslot-modal"
    v-model="isModalVisible"
    title="Save Timeslot"
    centered
    static
    no-close-on-backdrop
  >
    <template v-if="modalMessage.title">
      <h5 class="text-center">{{ modalMessage.title }}</h5>
      <ul class="list-unstyled text-center" v-if="modalMessage.details">
        <li v-for="detail in modalMessage.details" :key="detail">{{ detail }}</li>
      </ul>
    </template>
    <p class="text-center" v-else>{{ modalMessage.text }}</p>
    <template #footer>
      <b-button v-if="showOkButton" variant="primary" @click="confirmAction">Save</b-button>
      <b-button v-if="showCancelButton" variant="secondary" @click="cancelAction">Cancel</b-button>
    </template>
  </b-modal>

  <b-modal
  id="notification-modal"
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
  <b-button v-if="showOkButton" variant="primary" @click="confirmAction">OK</b-button>
  <b-button v-if="showCancelButton" variant="secondary" @click="cancelAction">Cancel</b-button>
</template>
</b-modal>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { DayPilotCalendar } from "@daypilot/daypilot-lite-vue";
import axios from "axios";
import { io } from "socket.io-client";
import { nextTick } from "vue";
import { BModal } from "bootstrap-vue-next";

const officeName = ref("");

const isModalVisible = ref(false); // Modal visibility state
const modalMessage = ref(""); // Dynamic modal message
const isSaving = ref(false); // State to prevent interactions
const showCancelButton = ref(true); // Controls visibility of the Cancel button
const showOkButton = ref(true); // Controls the visibility of the OK button
const modalResolve = ref(null); // Resolver for modal confirmation

// WebSocket setup
const socket = io("http://localhost:4000"); // API Gateway WebSocket server URL
const officeAddress = ref("");

function resetModal() {
  modalMessage.value = "";
  showOkButton.value = true;
  showCancelButton.value = true;
}


function showModal(message, showOk = true, showCancel = true) {
  return new Promise((resolve) => {
    modalMessage.value = typeof message === "string" ? { text: message } : message;
    showOkButton.value = showOk; // Explicitly set the OK button visibility
    showCancelButton.value = showCancel; // Explicitly set the Cancel button visibility
    modalResolve.value = resolve; // Set the promise resolver
    isModalVisible.value = true; // Show the modal
  });
}

function showModalNoPromise(message, showOk = true, showCancel = true) {
  resetModal();
  modalMessage.value = typeof message === "string" ? { text: message } : message;
  showOkButton.value = showOk; // Hide the OK button
  showCancelButton.value = showCancel; // Hide the Cancel button
  isModalVisible.value = true; // Show the modal
}
function confirmAction() {
  if (modalResolve.value) {
    modalResolve.value(true);
    modalResolve.value = null;
    isModalVisible.value = false;
  }
}

function cancelAction() {
  if (modalResolve.value) {
    modalResolve.value(false);
    modalResolve.value = null;
    isModalVisible.value = false;
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
  eventClickHandling: "Enabled",
  onEventClick: async (args) => {
    const timeslotId = args.e.id();
    const selectedTimeslot = events.value.find((event) => event.id === timeslotId);

    if (!selectedTimeslot) {
      await showModal("Invalid timeslot selected.", false);
      return;
    }

    // Check if the timeslot is booked using its text or isBooked property
    if (selectedTimeslot.text !== "Booked" && !selectedTimeslot.isBooked) {
      await showModal("You can only cancel booked timeslots.", true, false);
      return;
    }
    const confirmCancel = await showModal({
      title: "Cancel Timeslot",
      details: [`Start: ${args.e.start()}`, `End: ${args.e.end()}`],
    });
    

    if (confirmCancel) {
      resetModal();
      showModalNoPromise("Cancelling...", true, false);
      await cancelTimeslot(timeslotId, selectedTimeslot.patient);
    }
  },
  onTimeRangeSelected: async (args) => {
    // Callback triggered when a time range is selected
    // Default to "Unbooked" and set the selected timeslot
    selectedTimeslot.value = {
      title: "Unbooked", // Default title
      start: args.start,
      end: args.end,
      isBooked: false, // Default state
      patient: ""
    };
    
  // Show confirmation modal with timeslot details
  const confirmSave = await showModal({
    title: "Confirm Save",
    details: [
      `Start: ${selectedTimeslot.value.start}`,
      `End: ${selectedTimeslot.value.end}`,
    ],
  });

  // If user confirms, call saveTimeslot
  if (confirmSave) {
    saveTimeslot();
  } else {
    // Optionally, clear the selected timeslot if the user cancels
    selectedTimeslot.value = null;
  }
},

});

async function cancelTimeslot(timeslotId, patientId) {
  const officeId = sessionStorage.getItem("OfficeId");
// Show "Cancelling..." modal

  try {
    
    const response = await axios.patch(`http://localhost:4000/api/timeslots/${timeslotId}`, {
      isBooked: false,
      action: "cancel",
      officeId: officeId,
      patient: patientId,
      dentist: sessionStorage.getItem("userIdentifier"),
    });

    // Close "Cancelling..." modal
    isModalVisible.value = false;

     // Update modal with success message
     await showModal("Timeslot cancelled successfully!", true, false);

    // Update the calendar to reflect the cancellation
    const updatedTimeslot = response.data.timeslot;
    const eventIndex = events.value.findIndex((event) => event.id === updatedTimeslot._id);
    if (eventIndex !== -1) {
      events.value[eventIndex].text = "Unbooked";
      events.value[eventIndex].backColor = "#62FB08";
      calendarConfig.value.events = [...events.value];
    }
  } catch (error) {
    console.error("Error cancelling the timeslot:", error);
     // Update modal with error message
     await showModal("Failed to cancel the timeslot. Please try again.", true);
  }
}

async function saveTimeslot() {

  if (!selectedTimeslot.value) {
    await showModal("No timeslot selected.", true, false);
    return;
  }


  try {
    isSaving.value = true; // Prevent interactions

    modalMessage.value = {
  title: "Saving timeslot, please wait"
};
showOkButton.value = true; // Explicitly set the OK button visibility
    showCancelButton.value = false;
    isModalVisible.value = true; // Show modal


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
   // modalMessage.value = "Timeslot saved successfully!";
    console.log("Saved timeslot:", response.data);

    await showModal("Timeslot created successfully!", true, false);
    // Clear selected timeslot
    selectedTimeslot.value = null;
      // Allow the modal to display success for a short period before closing
      setTimeout(() => {
      isModalVisible.value = false;
      isSaving.value = false; // Allow interactions again
    }, 2000); // Adjust duration as needed
  } catch (error) {
    console.error("Error saving timeslot:", error);
    modalMessage.value = "Failed to save timeslot. Please try again.";

    // Allow the modal to display error for a short period before closing
    setTimeout(() => {
      isModalVisible.value = false;
      isSaving.value = false; // Allow interactions again
    }, 2000); // Adjust duration as needed
  }
}
//



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

    // Filter out timeslots created by patients
    events.value = response.data.timeslots
      .filter((timeslot) => timeslot.createdBy !== "patient") // Exclude patient-created timeslots
      .map((timeslot) => ({
        id: timeslot._id,
        text: timeslot.isBooked ? "Booked" : "Unbooked", // Display based on isBooked
        start: timeslot.start,
        end: timeslot.end,
        patient: timeslot.patient,
        backColor: timeslot.isBooked ? '#EC1E1E' : '#62FB08' // Red for booked, green for unbooked
      }));

    // Update the calendar configuration
    calendarConfig.value.events = events.value;
  } catch (error) {
    console.error("Error fetching timeslots:", error);
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
        backColor: '#62FB08'
      });
      calendarConfig.value.events = [...events.value];
      console.log("Updated events after WebSocket create:", events.value);
    }
  });

  // Listen for timeslot updates
  socket.on("timeslot/update", (updatedTimeslot) => {
    console.log("Received timeslot update:", updatedTimeslot);



    // Find the corresponding timeslot in the events array
    const eventIndex = events.value.findIndex(event => event.id === updatedTimeslot._id);
    if (eventIndex !== -1) {
      // Update the event text to "Booked" or "Unbooked" based on the isBooked status
      events.value[eventIndex].text = updatedTimeslot.isBooked ? "Booked" : "Unbooked";
      // Update the event data
      events.value[eventIndex].isBooked = updatedTimeslot.isBooked; // Update isBooked status
      events.value[eventIndex].patient = updatedTimeslot.patient; // Optionally update patient
      events.value[eventIndex].backColor = updatedTimeslot.isBooked ? '#EC1E1E' : '#62FB08';

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