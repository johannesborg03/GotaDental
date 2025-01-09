<template>
  <div class="container-fluid py-5">
    <div class="text-center mb-5">
      <BCard border-variant="primary" class="text-center py-4" style="max-width: 80%; margin: 0 auto;">
        <h2 style="font-family: 'Filson Pro', sans-serif; color: #356bbb; font-size: 25px;">
          Welcome to Your Dashboard
        </h2>
        <BCardText style="font-size: 14px;">
          Here you can manage all your schedules as appointments in one place.
        </BCardText>
      
    

    <!-- Cards Row -->
    <div class="d-flex justify-content-center flex-wrap gap-4">
      <!-- Timeslots Card -->
      <BCard
        border-variant="primary"
        class="text-center card-collapse"
        style="width: 18rem; padding: 10px;"
      >
        <template #header>
          <div class="text-primary" style="color: #356bbb; font-size: 14px;">
            Your Timeslots
          </div>
        </template>
        <BCardText style="font-size: 14px;">
          Manage your timeslots
        </BCardText>
        <button class="btn btn-primary btn-sm">
          <router-link to="/schedule" class="text-white text-decoration-none">
            View Timeslots
          </router-link>
        </button>
      </BCard>

      <!-- Appointments Card -->
      <BCard
        border-variant="primary"
        class="text-center card-collapse"
        style="width: 18rem; padding: 10px;"
      >
        <template #header>
          <div class="text-primary" style="color: #356bbb; font-size: 14px;">
            Your Appointments
          </div>
        </template>
        <BCardText style="font-size: 14px;">
          Review patient bookings
        </BCardText>
        <button class="btn btn-primary btn-sm">
          <router-link to="/appointments" class="text-white text-decoration-none">
            View Appointments
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


@media (max-width: 1200px) {
.card-collapse {
  display: none;
}
}
</style>  