<template>
  <BNavbar v-b-color-mode="'dark'" sticky="top" class="bg-custom px-3">
    <BNavbarBrand class="mb-0" href="#" style="color: white; font-family: 'Filson Pro', sans-serif;">
      GötaDental
    </BNavbarBrand>

    <BNavbarToggle target="main-navbar-nav" />

    <!-- Navbar Collapse -->
    <BCollapse id="main-navbar-nav" is-nav>
      <BNavbarNav class="navbuttons">
        <BNavItem href="#">Home</BNavItem>
        <BNavItem href="#">Book</BNavItem>
        <BNavItem href="#">Appointment</BNavItem>
        <BNavItem href="#">Map</BNavItem>
      </BNavbarNav>

      <!-- Right-Side Section with Token Name and Avatar -->
      <BNavbarNav class="ms-auto d-flex align-items-center">
        <!-- Display session token name -->
        <span class="text-white me-3" style="font-family: 'Filson Pro', sans-serif;">
          {{ sessionTokenName }}
        </span>
        <NavAvatar />
      </BNavbarNav>
    </BCollapse>
  </BNavbar>
</template>

<script>
import NavAvatar from './NavAvatar.vue';

export default {
  name: 'MainNavbar',
  components: {
    NavAvatar,
  },
  data() {
    return {
      sessionTokenName: '', // To store the token name
    };
  },
  created() {
    const tokenName = sessionStorage.getItem('name');
    this.sessionTokenName = tokenName || 'Guest'; // Default to 'Guest' if no name is found
  },
};
</script>

<style scoped>
/* Custom background color */
.bg-custom {
  background-color: #356bbb !important;
}

/* Navbar link styles */
a.nav-link {
  color: #356bbb;
  font-family: 'Filson Pro', sans-serif;
  transition: color 0.3s ease;
}

/* Responsive styles for small screens */
@media (max-width: 768px) {
  .navbuttons {
    display: none;
  }

  .navbar-toggler {
    display: block;
  }

  .ms-auto {
    display: block;
  }
}
</style>