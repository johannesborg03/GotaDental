<template>
  <div id="app" class="container">
    <Navbar v-if="!$route.meta.hideNavbar" />
    
    <div class="col-1">
      <button class="btn btn-primary">
        <router-link to="/Home" class="text-white text-decoration-none">Home</router-link>
      </button>
    </div>

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
