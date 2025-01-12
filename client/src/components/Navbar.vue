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

      <!-- Right-Side Section for Mobile and Desktop -->
      <BNavbarNav class="ms-auto d-flex align-items-center avatarNav">
        <!-- Session Token Name (Hidden on small screens) -->
        <span class="text-white me-3 sessionTokenName" style="font-family: 'Filson Pro', sans-serif;">
          {{ sessionName }}
        </span>

        <!-- Dropdown Menu (Visible only on small screens) -->
        <BNavItemDropdown
  text="Menu"
  toggle-class="nav-link-custom"
  id="navbar-dropdown"
  style="color: white;"
  class="text-white ms-3 d-block d-md-none"
>
          <BDropdownItem>
            <router-link :to="homePage" class="nav-link">Home</router-link>
          </BDropdownItem>
          <BDropdownItem>
            <router-link :to="schedulePage" class="nav-link">{{ scheduleText }}</router-link>
          </BDropdownItem>
          <BDropdownItem>
            <router-link :to="bookingsPage" class="nav-link">{{ bookingsText }}</router-link>
          </BDropdownItem>
          <BDropdownItem>
            <router-link :to="mapPage" class="nav-link">Map</router-link>
          </BDropdownItem>
        </BNavItemDropdown>


        <!-- Avatar -->
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
      sessionTokenName: '',
      sessionName: sessionStorage.getItem('Name'), // To store the token name
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






#navbar-dropdown .dropdown-toggle {
  color: white !important;
  /* Forces white color for the text */
}

.bg-custom {
  background-color: #356bbb !important;
}

.nav-link {
  color: white !important;
  text-decoration: none !important;
  padding: 0px;
  font-size: 15px;
}


.text-white {
  color: white !important;
}




@media (max-width: 768px) {
  .navbuttons {
    display: none;
    color: white;
  }

  .navbar-toggler {
    display: block;
  }

  /* Ensure everything is aligned in a row on small screens */
  .avatarNav {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .sessionTokenName {
    display: none;
  }

  .ms-auto {
    display: block;
  }

  .d-block.d-md-none {
    display: block;
  }

  .d-block.d-md-none {
    order: -1;
    /* Reorder the menu to appear first on the left */
  }

  /* Remove padding on dropdown menu */
  .navbar-nav .dropdown-menu {
    padding: 0;
    color: white;
  }

  .nav-link {
    color: #356bbb !important;
    text-decoration: none !important;
    padding: 0px;
    font-size: 15px;
  }

  #navbar-dropdown .dropdown-toggle {
    color: white !important;
    /* Ensures the text "Menu" is white */
    text-decoration: none;
    /* Removes underline if applied */
    font-size: 15px;
    /* Optional: Adjust font size */
  }


}
</style>