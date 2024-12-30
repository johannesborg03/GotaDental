<template>
  <BNavbar v-b-color-mode="'dark'" sticky="top" class="bg-custom px-3">
    <BNavbarBrand class="mb-0" href="#" style="color: white; font-family: 'Filson Pro', sans-serif;">
      GötaDental
    </BNavbarBrand>

    <BNavbarToggle target="main-navbar-nav" />

    <!-- Navbar Collapse -->
    <BCollapse id="main-navbar-nav" is-nav>
      <BNavbarNav class="navbuttons">
        <BNavItem> <router-link to="/patient" class="nav-link">Home</router-link></BNavItem>
        <BNavItem> <router-link to="/PatientSchedule" class="nav-link">Book Appointment</router-link> </BNavItem>
        <BNavItem>  <router-link to="/Map" class="nav-link">Bookings</router-link>  </BNavItem>
        <BNavItem> <router-link to="/Map" class="nav-link">Map</router-link>
        </BNavItem>
      </BNavbarNav>

      <!-- Right-Side Section with Token Name and Avatar -->
      <BNavbarNav class="ms-auto d-flex align-items-center">
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
    const tokenName = sessionStorage.getItem('Name');
    this.sessionTokenName = tokenName || "guest";
  },
};
</script>

<style scoped>

.bg-custom {
  background-color: #356bbb !important;
}

.nav-link {
  color: white !important;
  text-decoration: none !important;
  padding: 0px;
  font-size: 15px;
}

.nav-link:hover {
  color: white !important;
  text-decoration: none !important;
}

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