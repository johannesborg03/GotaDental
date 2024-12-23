<template>
  <BNavbar toggleable="lg" class="custom-navbar" expand="lg">
    <BNavbarBrand class="brand">GötaDental</BNavbarBrand>

    <BNavbarToggle target="nav-collapse" @click="toggleNavbar" />
    <BCollapse id="nav-collapse" is-nav v-bind:visible="isNavbarOpen">

      <!-- nav buttons -->
      <BNavbarNav class="d-flex gap-2">
        <BNavItem class="buttonsNav">
          <router-link to="/HomePage">Home</router-link>
        </BNavItem>
        <BNavItem class="buttonsNav">
          <router-link to="/Offices">Offices</router-link>
        </BNavItem>
        <BNavItem class="buttonsNav">
          <router-link to="/Appointment">Appointments</router-link>
        </BNavItem>
        <BNavItem class="buttonsNav">
          <router-link to="/Map">Map</router-link>
        </BNavItem>

        <BNavItem class="buttonsNav">

         
        </BNavItem>
      </BNavbarNav>

      <!-- Username-->
      <BNavbarNav class="ms-auto mb-2 mb-lg-0">
        <div class="d-none d-lg-flex align-items-center username">
          {{ userIdentifier }}
        </div>

        <!-- Dropdown -->
        <BDropdown class="custom-dropdown ml-3 text-center" variant="transparent" size="sm" right @show="toggleDropdown"
          @hide="toggleDropdown">
          <template #button-content>
            <span class="d-lg-none"
              style="margin-left: 26%; font-size: 16px; font-family: sans-serif; color: #FFFFFF;">Account</span>
          </template>
          <BDropdownItem @click="goToSettings">Settings</BDropdownItem>
          <BDropdownItem @click="logout">Logout</BDropdownItem>
        </BDropdown>
      </BNavbarNav>
    </BCollapse>
  </BNavbar>
</template>


<script>
export default {
  name: 'Navbar',
  data() {
    return {
      //menuVisible: false,
      isNavbarOpen: false,
      isDropdownOpen: false,
      userIdentifier: ''
    };
  },
  mounted() {
    this.userIdentifier = sessionStorage.getItem('userIdentifier') || 'Guest';
  },
  methods: {
    toggleNavbar() {
      this.isNavbarOpen = !this.isNavbarOpen;
    },
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
    },
    goToSettings() {
      const userIdentifier = localStorage.getItem('userIdentifier');
      if (userIdentifier) {
        this.$router.push({ name: 'SettingsPage', params: { userIdentifier: this.userIdentifier } });
      } else {
        console.error('No userIdentifier found in localStorage');
      }
    },
    logout() {
      // Clear the sessionStorage on logout .
      sessionStorage.removeItem("userIdentifier"); // Remove user data from session storage
      sessionStorage.clear();
      this.$router.push("/"); // Redirect to home page
    }
  }
}
</script>

<style scoped>
.brand {
  color: #E0E0E0 !important;
  font-size: 28px;
  margin-right: 5%;
  margin-left: 5%;
  font-family: 'Source Sans Pro';
}

.buttonsNav {
  font-family: sans-serif;
  gap: 30px;
}

.custom-navbar {
  background-color: #003C47;
}

.username {
  font-size: 13px;
  font-weight: bold;
  color: whitesmoke;
  padding-left: 10px;
  padding-right: 10px;
  font-family: Tahoma;
}

.buttonsNav a,
router-link {
  color: #E0E0E0;
  text-decoration: none;
  font-family: Tahoma;
}

.buttonsNav a:hover,
router-link:hover {
  color: #A8DAD7;
}

.custom-dropdown {
  padding-right: 30px;
}

.nav-collapse {
  margin-right: 5%;
}

.custom-dropdown .dropdown-item {
  color: #E0E0E0;
  background-color: transparent;
}

.custom-dropdown .dropdown-item:hover {
  color: #FFFFFF;
  background-color: #004F58;
}

</style>
