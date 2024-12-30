<template>
    <BDropdown no-caret
      toggle-class="p-0 border-0 bg-transparent d-flex align-items-center" class="d-inline-block">
      <!-- Avatar as the button with the first letter of the session name -->
      <template #button-content>
        <div
          class="rounded-circle bg-white d-flex justify-content-center align-items-center"
          style="width: 30px; height: 30px; font-size: 20px; color: #356bbb;">
          {{ avatarLetter }}
        </div>
      </template>
  
      <!-- Dropdown Menu -->
      <BDropdownItem class="px-3 d-flex flex-column align-items-start" v-b-color-mode="'dark'"
        style="color: #356bbb; font-family: 'Filson Pro', sans-serif; padding: 0px;">
        <p class="fs-6" style="color: white; font-size: 12px; margin-bottom: 2px;">{{ sessionName }}</p>
        <p class="text-muted fs-7" style="font-size: 15px; margin-top: 0; margin-bottom: 4px">{{ sessionEmail }}</p>
      </BDropdownItem>
  
      <BDropdownDivider />
  
      <BDropdownItemButton 
        class="text-danger" 
        @click="logout" 
        style="font-family: 'Filson Pro', sans-serif; padding-left: 13px;">
        Logout
      </BDropdownItemButton>
    </BDropdown>
  </template>
  
  <script>
  export default {
    name: "AvatarDropdown",
    data() {
      return {
        sessionName: sessionStorage.getItem('Name') || "guest", 
        sessionEmail: sessionStorage.getItem('Email') || "guest" 
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
        this.$router.push('/'); 
      }
    }
  };
  </script>
  