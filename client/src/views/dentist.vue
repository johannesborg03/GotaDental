<template>
  <div class="container py-4">
    <div class="mb-4 text-center">
      <h1 class="text-primary">Dentist Interface</h1>
    </div>

    <div class="card shadow-sm">
      <div class="card-body">
        <h2 class="card-title text-secondary">Register a Slot</h2>
        <form @submit.prevent="registerSlot" class="needs-validation" novalidate>

          <div class="mb-3">
            <label for="slotDate" class="form-label">Select Date:</label>
            <input type="date" id="slotDate" class="form-control" v-model="slotDate" required />
            <div class="invalid-feedback">Please select a valid date.</div>
          </div>

          <div class="mb-3">
            <label for="slotTime" class="form-label">Select Time:</label>
            <input type="time" id="slotTime" class="form-control" v-model="slotTime" required />
            <div class="invalid-feedback">Please select a valid time.</div>
          </div>

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
      username: '',
    };
  },

  mounted() {
     this.username = sessionStorage.getItem('userIdentifier');
    console.log(this.username);

  },

  methods: {

    async registerSlot() {
      if (!this.slotDate || !this.slotTime) {
        alert('Please select a valid date and time!');
        return;
      }

      try {
        // Combine date and time into a single Date object
        const dateTimeString = `${this.slotDate}T${this.slotTime}:00`; // 'T' separates date and time
        const dateTime = new Date(dateTimeString);

        // Check if the dateTime is valid
        if (isNaN(dateTime)) {
          alert('Invalid date or time. Please check your input.');
          return;
        }

        const slotDetails = {
          date_and_time: dateTime,
          dentist_username: this.username,
        };

        console.log(dateTime);

        console.log(this.username);
        // Make the POST request to create the time slot 
        const response = await axios.post('http://localhost:4000/api/create', {
         slotDetails
        });

        if (response.status === 201) {
          console.log('Slot registered successfully:', response.data);
          alert('Time slot registered successfully!');

          // Reset form fields
          this.slotDate = '';
          this.slotTime = '';
        } else {
          alert(`Failed to register slot: ${response.data.message}`);
        }

      } catch (error) {
        console.error('Error registering slot:', error);
        alert('An error occurred while registering the time slot. Please try again later.');
      }
    }
  }
};
</script>