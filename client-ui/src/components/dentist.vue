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
      username: '', // Username fetched from route or localStorage // should be change to ssn 
    };
  },

  mounted() {
  const routeUsername = this.$route.params.username;

  // Prefer route username; fallback to stored username
  const username = routeUsername || storedUsername;

  if (username) {
    this.fetchUserData(username);
  } else {
    console.log('No username available in route or localStorage.');
  }
  },

  methods: {
    async fetchUserData() {
      try {
  
        const response = await fetch(`http://localhost:3005/api/dentist/${username}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.status}`);
        }

        const userData = await response.json();
        console.log('Fetched user data:', userData);

      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    },

     // Register a time slot for the specified username
     async registerSlot() {
      // Validate required fields
      if (!this.slotDate || !this.slotTime) {
        alert('Please select a valid date and time!');
        return;
      }
  }
}
};
</script>