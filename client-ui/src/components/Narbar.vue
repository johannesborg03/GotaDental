<template>
    <!-- Navbar-->
    <b-navbar toggleable="lg" variant="dark" type="dark" expand="lg">
      <b-navbar-brand href="#" class="brand">Göta Dental</b-navbar-brand>
      <b-navbar-toggle target="nav-collapse" />
      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav class="d-flex gap-2">
          <b-nav-item class="buttonsNav">
            <router-link to="/">Home</router-link>
          </b-nav-item>
          <b-nav-item class="buttonsNav">
            <router-link to="/">Office</router-link>
          </b-nav-item>
          <b-nav-item class="buttonsNav">
            <router-link to="/">Appointments</router-link>
          </b-nav-item>
        </b-navbar-nav>
    
        <b-navbar-nav class="ms-auto mb-2 mb-lg-0">
          <!-- Username -->
          <div class="d-none d-lg-flex align-items-center">
            <span class="username ml-3">{{ username }}</span>
          </div>
           <!-- Dropdown settings and logout -->
          <b-dropdown class= "custom-dropdown ml-3 text-center" rightvariant="transparent" size="sm" >
            <template #button-content>
              <span class="d-lg-none" style="margin-left: 26%; font-size: 16px; font-family: sans-serif;">Account </span>
            </template>
            <b-dropdown-item @click="goToSettings">Settings</b-dropdown-item>
            <b-dropdown-item @click="logout">Logout</b-dropdown-item>
          </b-dropdown>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </template>
  