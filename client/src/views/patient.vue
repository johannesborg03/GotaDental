<template>
    <div class="container py-4">
        <div class="mb-4 text-center">
            <h1 class="text-primary">Book an Appointment</h1>
        </div>

        <!-- Select Office -->
        <div class="mb-3">
            <label for="officeSelect" class="form-label">Select Office:</label>
            <select id="officeSelect" class="form-select" v-model="selectedOffice" @change="fetchTimeslots" required>
                <option value="" disabled>Select an office</option>
                <option v-for="office in offices" :key="office.office_id" :value="office.office_id">
                    {{ office.office_name }}
                </option>
            </select>
        </div>

        <!-- Available Timeslots -->
        <div v-if="selectedOffice && timeslots.length > 0">
            <h2 class="mt-4">Available Timeslots</h2>
            <div v-for="slot in timeslots" :key="slot.id" class="card my-2 p-2">
                <p>
                    <strong>Date:</strong> {{ new Date(slot.date_and_time).toLocaleDateString() }} <br>
                    <strong>Time:</strong> {{ new Date(slot.date_and_time).toLocaleTimeString() }} <br>
                    <strong>Dentist:</strong> {{ slot.dentist_username }}
                </p>
                <button class="btn btn-primary" @click="bookTimeslot(slot.id)" :disabled="slot.is_booked">
                    {{ slot.is_booked ? "Booked" : "Book Slot" }}
                </button>
            </div>
        </div>

        <!-- Available Slots Without Office Selection -->
        <div v-if="!selectedOffice && availableSlots.length > 0">
            <h2 class="mt-4">Available General Slots</h2>
            <ul class="list-group">
                <li v-for="(slot, index) in availableSlots" :key="index"
                    class="list-group-item d-flex justify-content-between align-items-center">
                    <span>
                        <i class="bi bi-calendar-event text-primary"></i>
                        {{ formatSlot(slot.date_and_time) }}
                    </span>
                    <button class="btn btn-success btn-sm" @click="bookSlot(slot, index)">
                        Book
                    </button>
                </li>
            </ul>
        </div>

        <!-- Messages for No Available Slots -->
        <div v-if="selectedOffice && timeslots.length === 0" class="text-center mt-4 text-muted">
            <p>No available timeslots for the selected office.</p>
        </div>
        <div v-if="!selectedOffice && availableSlots.length === 0" class="text-center mt-4 text-muted">
            <p>No general available slots found.</p>
        </div>
    </div>
</template>

<script>
import axios from "axios";

export default {
    data() {
        return {
            offices: [],
            timeslots: [],
            availableSlots: [],
            selectedOffice: null,
        };
    },
    async mounted() {
        await this.fetchOffices();
        await this.fetchAvailableSlots(); // Fetch general slots without office selection
    },
    methods: {
        // Fetch list of offices
        async fetchOffices() {
            try {
                const response = await axios.get("http://localhost:4000/api/offices");
                this.offices = response.data.offices || [];
            } catch (error) {
                console.error("Error fetching offices:", error.response?.data || error.message);
                alert("Failed to load offices. Please try again.");
            }
        },

        // Fetch timeslots for a specific office
        async fetchTimeslots() {
            if (!this.selectedOffice) return;

            try {
                const response = await axios.get(`http://localhost:4000/api/timeslots/${this.selectedOffice}`);
                this.timeslots = response.data.timeslots || [];
            } catch (error) {
                console.error("Error fetching timeslots:", error.response?.data || error.message);
                alert("Failed to load timeslots. Please try again.");
            }
        },

        // Fetch general available slots
        async fetchAvailableSlots() {
            try {
                const response = await axios.get("http://localhost:4000/api/timeslots/available");
                this.availableSlots = response.data.timeslots || [];
            } catch (error) {
                console.error("Error fetching slots:", error.response?.data || error.message);
                alert("Failed to fetch slots. Please try again later.");
            }
        },

        // Book a timeslot for a specific office
        async bookTimeslot(timeslotId) {
            try {
                const response = await axios.post("http://localhost:4000/api/timeslots/book", {
                    timeslot_id: timeslotId,
                });
                if (response.status === 200) {
                    alert("Timeslot booked successfully!");
                    this.fetchTimeslots(); // Refresh timeslots after booking
                }
            } catch (error) {
                console.error("Error booking timeslot:", error.response?.data || error.message);
                alert("Failed to book timeslot. Please try again.");
            }
        },

        // Book a general available slot
        async bookSlot(slot, index) {
            try {
                const response = await axios.post("http://localhost:4000/api/appointments/book", {
                    timeslot_id: slot._id,
                });
                if (response.status === 201) {
                    alert("Time slot booked successfully!");
                    this.availableSlots.splice(index, 1);
                }
            } catch (error) {
                console.error("Error booking slot:", error.response?.data || error.message);
                if (error.response && error.response.status === 409) {
                    alert("Time slot no longer available!");
                } else {
                    alert("Failed to book time slot. Please try again later.");
                }
            }
        },

        // Format slot date and time
        formatSlot(dateTime) {
            const date = new Date(dateTime);
            return date.toLocaleString();
        },
    },
};
</script>
