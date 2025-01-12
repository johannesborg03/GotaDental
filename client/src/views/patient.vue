<template>
  <div class="container-fluid py-5">
    <div class="text-center mb-5">
      <BCard border-variant="primary" class="text-center py-4" style="max-width: 80%; margin: 0 auto;">
        <h2 style="font-family: 'Filson Pro', sans-serif; color: #356bbb; font-size: 25px;">
          Welcome to Patient Dashboard
        </h2>
        <BCardText style="font-size: 14px;">
          Here you can manage all your schedules, appointments, and locate nearby facilities in one place.
        </BCardText>
      
    

    <!-- Cards Row -->
    <div class="d-flex justify-content-center flex-wrap gap-4">
      <!-- Patient Schedule Card -->
      <BCard
        border-variant="primary"
        class="text-center card-collapse"
        style="width: 18rem; padding: 10px;"
      >
        <template #header>
          <div class="text-primary" style="color: #356bbb; font-size: 14px;">
            Available Timeslot
          </div>
        </template>
        <BCardText style="font-size: 14px;">
          Schedule an appointment
        </BCardText>
        <button class="btn btn-primary btn-sm">
          <router-link to="/PatientSchedule" class="text-white text-decoration-none">
            View Timeslots
          </router-link>
        </button>
      </BCard>

      <BCard
        border-variant="primary"
        class="text-center card-collapse"
        style="width: 18rem; padding: 10px;"
      >
        <template #header>
          <div class="text-primary" style="color: #356bbb; font-size: 14px;">
            Bookings
          </div>
        </template>
        <BCardText style="font-size: 14px;">
          Display all your bookings
        </BCardText>
        <button class="btn btn-primary btn-sm">
          <router-link to="/PatientBookedAppointment" class="text-white text-decoration-none">
            View Bookings
          </router-link>
        </button>
      </BCard>

      <!-- Map Card -->
      <BCard
        border-variant="primary"
        class="text-center card-collapse"
        style="width: 18rem; padding: 10px;"
      >
        <template #header>
          <div class="text-primary" style="color: #356bbb; font-size: 14px;">
            Map
          </div>
        </template>
        <BCardText style="font-size: 14px;">
          Locate nearby facilities
        </BCardText>
        <button class="btn btn-primary btn-sm">
          <router-link to="/Map" class="text-white text-decoration-none">
            View Map
          </router-link>
        </button>
      </BCard>

      
      
    </div>
  </BCard>
</div>

  </div>
</template>
  
  <script>
  export default {
    name: 'PatientDashboard',
  };
  </script>
  
  <style scoped>
  body {
    font-family: 'Filson Pro', sans-serif;
    background-color: #f8f9fa;
  }
  
  .card {
    font-family: 'Filson Pro', sans-serif;
  }
  
  .btn {
    font-family: 'Filson Pro', sans-serif;
  }
  
  .d-flex {
    gap: 1rem; /* Adds spacing between the cards */
  }
  
  .card-collapse {
    transition: transform 0.3s;
  }
  
  .card-collapse:hover {
    transform: scale(1.05); /* Slight zoom on hover */
  }
  
  /* Responsive Design */
  @media (max-width: 768px) {
    .card-collapse {
      width: 100%;
    }
  }
  </style>