<template>
    <div class="container py-4">
        <div class="mb-4 text-center">
            <h1 class="text-primary">Available Appointments</h1>
        </div>

        <button class="btn btn-primary">
            <router-link to="/patientTimeslot" class="text-white text-decoration-none">
                Available Timeslots</router-link>
        </button>
    </div>
</template>

<script>
import axios from "axios";

export default {
    data() {
        return {

        };
    },
    async mounted() {
    },
};
</script>
