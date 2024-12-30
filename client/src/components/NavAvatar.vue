<template>
    <BDropdown no-caret
      toggle-class="p-0 border-0 bg-transparent d-flex align-items-center" class="d-inline-block">
      <!-- Avatar as the button with the first letter of the session name -->
      <template #button-content>
        <div
          class="rounded-circle bg-white  d-flex justify-content-center align-items-center"
          style="width: 30px; height: 30px; font-size: 20px; color:  #356bbb  ">
          {{ avatarLetter }}
        </div>
      </template>
  
      <!-- Dropdown Menu -->
      <BDropdownItemButton class="py-2 px-3 d-flex flex-column align-items-start">
        <strong class="fs-5">{{ sessionName }}</strong>
        <span class="text-muted fs-6">{{ sessionEmail }}</span>
      </BDropdownItemButton>
  
      <BDropdownDivider />
  
      <BDropdownItemButton class="text-danger" @click="logout">Logout</BDropdownItemButton>
    </BDropdown>
  </template>
  
  <script>
  export default {
    name: "AvatarDropdown",
    data() {
      return {
        sessionName: sessionStorage.getItem('name') || 'User',  // Default name if no session data
        sessionEmail: sessionStorage.getItem('email') 
      };
    },
    computed: {
      avatarLetter() {
        return this.sessionName.charAt(0).toUpperCase();
      },
    },
    methods: {
      logout() {
        sessionStorage.clear();
        window.location.href = '/login';  // Replace with your actual logout logic
      }
    }
  };
  </script>
  
  <style scoped>
  .fs-5 {
    font-size: 12px;
  }
  .fs-6 {
    font-size: 8px;
  }
  </style>  