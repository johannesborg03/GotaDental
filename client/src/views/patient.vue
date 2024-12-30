<template>
    <div class="container py-4">
        <div class="mb-4 text-center">
            <h1 class="text-primary">Book an Appointment</h1>
        </div>

        <button class="btn btn-primary">
            <router-link to="/PatientSchedule" class="text-white text-decoration-none">
                Patient Schedule</router-link>
        </button>

        <button class="btn btn-primary">
            <router-link to="/Appointment" class="text-white text-decoration-none">
                Booked appointments</router-link>
        </button>
    </div>
</template>