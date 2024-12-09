<template>
  <div class="container py-4">
    <div class="mb-4 text-center">
      <h1 class="text-primary">Dentist Interface</h1>
    </div>

    <div class="card shadow-sm">
      <div class="card-body">
        <h2 class="card-title text-secondary">Register a Slot</h2>
        <form @submit.prevent="registerSlot" class="needs-validation" novalidate>

          <!-- List of offices -->
          <div class="mb-3">
            <label class="form-label">Select Office:</label>
            <div v-if="offices.length > 0">
              <div
                v-for="office in offices"
                :key="office.office_id"
                class="card my-2 p-2"
                :class="{ 'bg-primary text-white': selectedOffice === office.office_id }"
                @click="selectOffice(office.office_id)"
                style="cursor: pointer;"
              >
                <h5>{{ office.office_name }}</h5>
                <p>Address: {{ office.office_address }}</p>
                <p>Latitude: {{ office.latitude }}, Longitude: {{ office.longitude }}</p>
              </div>
            </div>
            <div v-else>
              <p class="text-danger">No offices available.</p>
            </div>
          </div>

          <!-- Input for selecting the date -->
          <div class="mb-3">
            <label for="slotDate" class="form-label">Select Date:</label>
            <input type="date" id="slotDate" class="form-control" v-model="slotDate" required />
            <div class="invalid-feedback">Please select a valid date.</div>
          </div>

          <!-- Input for selecting the time -->
          <div class="mb-3">
            <label for="slotTime" class="form-label">Select Time:</label>
            <input type="time" id="slotTime" class="form-control" v-model="slotTime" required />
            <div class="invalid-feedback">Please select a valid time.</div>
          </div>

          <!-- Submission Button -->
          <div>
            <button class="btn btn-primary w-100" type="submit">
              <i class="bi bi-calendar-check"></i> Register Slot
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      slotDate: '',
      slotTime: '',
      selectedOffice: null,
      offices: [],
      username: '',
    };
  },

  async mounted() {
    this.username = sessionStorage.getItem('userIdentifier');
    await this.fetchOffices();
  },

  methods: {
    async fetchOffices() {
    try {
        console.log('Fetching offices from API...');
        const response = await axios.get('http://localhost:4000/api/offices');
        console.log('Response from API:', response.data);

        if (response.data.offices && response.data.offices.length > 0) {
            this.offices = response.data.offices;
        } else {
            this.offices = [];
            alert('No offices available.');
        }
    } catch (error) {
        console.error('Error fetching offices:', error.response ? error.response.data : error.message);
        alert('Failed to load offices. Please try again.');
    }
},

    async selectOffice(officeId) {
      this.selectedOffice = officeId;
      console.log("Selected Office:", officeId);
    },

    async registerSlot() {
      if (!this.slotDate || !this.slotTime || !this.selectedOffice) {
        alert('Fill in all the fields');
        return;
      }

      try {
        const dateTimeString = `${this.slotDate}T${this.slotTime}:00`;
        const slotDetails = {
          date_and_time: dateTimeString,
          dentist_username: this.username,
          office_id: this.selectedOffice,
        };

        console.log("Registering slot with details:", slotDetails);

        const response = await axios.post('http://localhost:4000/api/timeslots/create', slotDetails);

        if (response.status === 201) {
          alert('Time slot registered successfully!');
          this.slotDate = '';
          this.slotTime = '';
          this.selectedOffice = null;
        } else {
          alert(`Failed to register slot: ${response.data.message}`);
        }
      } catch (error) {
        console.error('Error registering slot:', error.response ? error.response.data : error.message);
        alert('An error occurred while registering the time slot. Please try again.');
      }
    },
  },
};
</script>
