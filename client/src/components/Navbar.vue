<template>
  <BNavbar v-b-color-mode="'dark'" sticky="top" class="bg-custom px-3">
    <BNavbarBrand class="mb-0" href="#" style="color: white; font-family: 'Filson Pro', sans-serif;">
      GötaDental
    </BNavbarBrand>

    <!-- Toggle Button for Mobile -->
    <BNavbarToggle target="main-navbar-nav" />

    <!-- Navbar Collapse -->
    <BCollapse id="main-navbar-nav" is-nav>
      <BNavbarNav class="navbuttons">
        <BNavItem> 
          <router-link :to="homePage" class="nav-link">Home</router-link>
        </BNavItem>
        <BNavItem> 
          <router-link :to="schedulePage" class="nav-link">{{ scheduleText }}</router-link>
        </BNavItem>
        <BNavItem>  
          <router-link :to="bookingsPage" class="nav-link">{{ bookingsText }}</router-link>
        </BNavItem>
        <BNavItem> 
          <router-link :to="mapPage" class="nav-link">Map</router-link>
        </BNavItem>
      </BNavbarNav>

       <!-- Dropdown Button for Mobile (Visible only on small screens) -->
      <BNavbarNav class="ms-auto d-block d-md-none">
        <BNavItemDropdown text="Menu" id="navbar-dropdown" class="text-white">
          <BDropdownItem>
            <router-link to="/patient" class="nav-link">Home</router-link>
          </BDropdownItem>
          <BDropdownItem>
            <router-link to="/PatientSchedule" class="nav-link">Book Appointment</router-link>
          </BDropdownItem>
          <BDropdownItem>
            <router-link to="/PatientBookedAppointment" class="nav-link">Bookings</router-link>
          </BDropdownItem>
          <BDropdownItem>
            <router-link to="/Map" class="nav-link">Map</router-link>
          </BDropdownItem>
        </BNavItemDropdown>
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
  computed: {
    isSSN() {
      // Check if sessionTokenName is a 12-digit SSN
      return /^\d{12}$/.test(this.sessionTokenName);
    },
    homePage() {
      return this.isSSN ? '/patient' : '/dentist';
    },
    schedulePage() {
      return this.isSSN ? '/PatientSchedule' : '/schedule';
    },
    bookingsPage() {
      return this.isSSN ? '/PatientBookedAppointment' : '/dentistAppointments';
    },
    mapPage() {
      return this.isSSN ? '/Map' : '/Map';
    },
    scheduleText() {
      return this.isSSN ? 'Book Appointment' : 'Timeslots';
    },
    bookingsText() {
      return this.isSSN ? 'Bookings' : 'Appointments';
    },
  },
  mounted() {
    this.sessionTokenName = sessionStorage.getItem("userIdentifier") || "Guest";
    console.log('Token Name:', this.sessionTokenName);  // Check what value is fetched from sessionStorage
   
  }
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

/* Make the Menu text white */
.text-white {
  color: white !important;
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
  .d-block.d-md-none {
    display: block;
  }
  /* Make the Menu text white */
.text-white {
  color: white !important;
}
}

</style>