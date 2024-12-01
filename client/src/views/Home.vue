<template>
    <div id="app" class="container">
        <Navbar v-if="!$route.meta.hideNavbar" />
        <div class="row justify-content-center">
            <div class="col-1">
                <button class="btn btn-primary">
                    <router-link to="/registerPatient" class="text-white text-decoration-none">Register
                        Patient</router-link>
                </button>
            </div>




            <div class="col-1">
                <button class="btn btn-primary">
                    <router-link to="/login" class="text-white text-decoration-none">Login</router-link>
                </button>
            </div>



            <div class="col-1">
                <button class="btn btn-primary">
                    <router-link to="/registerDentist" class="text-white text-decoration-none">Register
                        Dentist</router-link>
                </button>
            </div>


            <router-view />
        </div>
    </div>





</template>