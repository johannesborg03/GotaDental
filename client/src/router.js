import { createRouter, createWebHistory } from 'vue-router';
import registerPatient from './views/registerPatient.vue';
import login from './views/login.vue';
import dentist from './views/dentist.vue';
import patient from './views/patient.vue';
import registerDentist from './views/registerDentist.vue';
import Home from './views/Home.vue';

const routes = [

    { path: '/Home', name: 'Home', component: Home, meta: { hideNavbar: true }},

    { path: '/registerPatient', name: 'RegisterPatient', component: registerPatient, meta: { hideNavbar: true }},

    { path: '/login',name: 'Login',component: login,meta: { hideNavbar: true } },
    
    { path: '/dentist', name: 'Dentist', component: dentist },
    
    { path: '/patient', name: 'Patient', component: patient},

    { path: '/registerDentist', name: 'RegisterDentist',component: registerDentist, meta: { hideNavbar: true }},
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
