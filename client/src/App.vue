<template>
  <div id="app">
    <Navbar v-if="!$route.meta.hideNavbar" />
    <DentistNavbar v-if="$route.meta.dentistNavbar" />
    <router-view />
    
   

  </div>
</template>

<script>
import DentistNavbar from './components/dentistNavbar.vue';
import Navbar from './components/Navbar.vue'

export default {
  name: 'App',
  components: {
    Navbar,
    DentistNavbar
  }
}
</script>
