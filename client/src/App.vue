<template>
  <div id="app" class="container">
  <Navbar v-if="!$route.meta.hideNavbar" /> 
   
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


