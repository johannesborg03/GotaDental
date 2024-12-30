<template>
  <BNavbar v-b-color-mode="'dark'" sticky="top" class="bg-custom px-3">
    <BNavbarBrand class="mb-0" href="#" style="color: white; font-family: 'Filson Pro', sans-serif;">
      GötaDental
    </BNavbarBrand>

    <BNavbarToggle target="main-navbar-nav" />

    <!-- Navbar Collapse -->
    <BCollapse id="main-navbar-nav" is-nav>
      <BNavbarNav class ="navbuttons">
        <BNavItem href="#">Home</BNavItem>
        <BNavItem href="#">Book</BNavItem>
        <BNavItem href="#">Appointment</BNavItem>
        <BNavItem href="#">Map</BNavItem>
      </BNavbarNav>

      <!-- Right-Side Avatar Dropdown -->
      <BNavbarNav class="ms-auto">
        <NavAvatar /> <!-- Avatar Dropdown Component -->
      </BNavbarNav>
    </BCollapse>
  </BNavbar>
</template>

<script>
import NavAvatar from './NavAvatar.vue';  // Import AvatarDropdown component

export default {
  name: 'MainNavbar',
  components: {
    NavAvatar, // Register the AvatarDropdown component
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

</style>