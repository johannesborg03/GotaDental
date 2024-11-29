<template>
  <div id="app">
  <!-- <Navbar v-if="!$route.meta.hideNavbar" /> --> 
    <button class="btn btn-primary">
      <router-link to="/registerPatient" class="text-white text-decoration-none">Register Patient</router-link>
    </button>
    <button class="btn btn-primary">
      <router-link to="/login" class="text-white text-decoration-none">Login</router-link>
    </button>
    <router-view />
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue'

export default {
  name: 'App',
  components: {
    Navbar 
  }
}
</script>


