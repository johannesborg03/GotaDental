<template>
  <div class="container py-4">
    <div class="mb-4 text-center">
      <h1 class="text-primary">Dentist Interface</h1>
    </div>
    <button class="btn btn-primary">
      <router-link to="/dentistTimeslot" class="text-white text-decoration-none">
        Timeslots</router-link>
    </button>

    <button class="btn btn-primary">
      <router-link to="/schedule" class="text-white text-decoration-none">
        Schedule</router-link>
    </button>


  
  </div>
</template>


<script>
//import axios from 'axios';





export default {
  
  data() {
    return {
      
      username: '', // should be change to ssn 
    }
    
  },

  async mounted() {
    this.username = sessionStorage.getItem('userIdentifier');
   // await this.fetchOffices();
  },
 

methods: {
    async fetchUserData() {
      try {
        const response = await fetch(`http://localhost:3005/api/dentist/${this.username}`);
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



<style>


</style>
