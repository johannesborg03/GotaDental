<template>
    <BDropdown
      no-caret
      toggle-class="p-0 border-0 bg-transparent d-flex align-items-center"
      class="d-inline-block"
    >
      <!-- Avatar as the button -->
      <template #button-content>
        <img
          src="https://via.placeholder.com/40"
          alt="User Avatar"
          class="rounded-circle"
          style="width: 40px; height: 40px;"
        />
      </template>
  
      <!-- Dropdown Menu -->
      <BDropdownItemButton class="py-2 px-3 d-flex flex-column align-items-start">
        <strong class="fs-5">shadcn</strong>
        <span class="text-muted fs-6">m@example.com</span>
      </BDropdownItemButton>
  
      <BDropdownDivider />
  
      <BDropdownItemButton class="text-danger">Logout</BDropdownItemButton>
    </BDropdown>
  </template>
  
  <script>
  export default {
    name: "AvatarDropdown",
  };
  </script>
  
  <style scoped>
  .fs-5 {
    font-size: 1.25rem; /* Larger text for "shadcn" */
  }
  .fs-6 {
    font-size: 0.875rem; /* Smaller text for the email */
  }
  </style>  