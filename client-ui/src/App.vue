<script setup>
</script>

<template>
  <div>
    <nav>
      <a href="/register" class="nav-link">Register</a>
      <a href="/login" class="nav-link">Login</a>
    </nav>
    <div>
      <a href="/dentist" class="nav-link">Dentist</a>
    </div>
    <router-view /> 
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
