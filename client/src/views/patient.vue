<template>
    <div class="container py-4">
        <div class="mb-4 text-center">
            <h1 class="text-primary">Book an Appointment</h1>
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
            username: '', // should be change to ssn 
        };
    },

    async mounted() {
        this.username = sessionStorage.getItem('userIdentifier');
        await this.fetchOffices();
    },
    mounted() {
        this.username = this.$route.params.username || localStorage.getItem('username'); // Prefer route, fallback to storage
        this.fetchUserData();
    },

    methods: {
        async fetchUserData() {
            try {
                const response = await fetch(`http://localhost:3005/api/patient/${this.username}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch user data: ${response.status}`);
                }

                const userData = await response.json();
                console.log('Fetched user data:', userData);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        },
    },
};
</script>
