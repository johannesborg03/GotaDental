<template>
  <BNavbar toggleable="lg" class="custom-navbar" expand="lg">
    <BNavbarBrand class="brand">Göta Dental</BNavbarBrand>

    <BNavbarToggle target="nav-collapse"/>
    <BCollapse id="nav-collapse" is-nav>

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
    </BNavbarNav>

    <!-- Username-->
    <BNavbarNav class="ms-auto mb-2 mb-lg-0">
      <div class="d-none d-lg-flex align-items-center">
      </div>

      <!-- Dropdown -->
      <BDropdown class="custom-dropdown ml-3 text-center" variant="transparent" size="sm" right >
        <template #button-content>
          <span class="d-lg-none" style="margin-left: 26%; font-size: 16px; font-family: sans-serif; color: #FFFFFF;"> Account</span>
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
      menuVisible: false,
      username: ''
    };
  },
  mounted() {
    this.username = localStorage.getItem('username') || 'Guest';
  },
  methods: {
    toggleMenu() {
      this.menuVisible = !this.menuVisible;
    },
    goToSettings() {
      const username = localStorage.getItem('username');
      if (username) {
        this.$router.push({ name: 'SettingsPage', params: { username: this.username } });
      } else {
        console.error('No username found in localStorage');
      }
    },
    logout() {
      // Clear the localStorage on logout .
      localStorage.removeItem('username');
      this.$router.push('/LogIn');
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
