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
export default {
  data() {
    return {
      slotDate: '',
      slotTime: '',
      username: '',
    };
  },

 mounted() {
  const username = localStorage.getItem('userIdentifier');
  console.log(username); 

  if (username){
  this.username = username; 
  }

  
},

  methods: {

     // Register a time slot for the specified username
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
        };

        // Make the POST request to register the time slot
        const response = await fetch(`http://localhost:4000/api/timeslot/${this.username}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(slotDetails),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Slot registered successfully:', data);
          alert('Time slot registered successfully!');

          // Reset form fields
          this.slotDate = '';
          this.slotTime = '';
        } else {
          const errorData = await response.json();
          alert(`Failed to register slot: ${errorData.message}`);
        }

      } catch (error) {
        console.error('Error registering slot:', error);
        alert('An error occurred while registering the time slot. Please try again later.');
      }
    }
  }
};
</script>