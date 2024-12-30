<template>
    <div class="container-fluid py-5">
      
      <div class="mt-5">
        <BCard border-variant="primary" class="text-center py-9" style="max-width: 80%; margin: 0 auto;">
          <h2 style="font-family: 'Filson Pro', sans-serif; color: #356bbb; font-size: 25px;">
            Welcome to Your Patient Dashboard
          </h2>
          <BCardText style="font-size: 14px;">
            Here you can manage all your schedules, appointments, and locate nearby facilities in one place.
          </BCardText>
          <div class="col-md-2 d-flex flex-column align-items-start">
          <!-- Patient Schedule Card -->
          <BCard border-variant="primary" header="Patient Schedule" align="center" class="mb-3 card-collapse" style="width: 100%; padding: 10px;">
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
        </div>
  
        <div class="col-md-2 d-flex flex-column align-items-start">
          <BCard border-variant="primary" align="center" style="width: 100%; padding: 10px;" class = "card-collapse">
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
  

  @media (max-width: 1200px) {
  .card-collapse {
    display: none;
  }
}
  </style>  