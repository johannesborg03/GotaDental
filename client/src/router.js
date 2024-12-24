import { createRouter, createWebHistory } from 'vue-router';
import registerPatient from './views/registerPatient.vue';
import login from './views/login.vue';
import dentist from './views/dentist.vue';
import patient from './views/patient.vue';
import registerDentist from './views/registerDentist.vue';
import Home from './views/Home.vue';
import Map from './views/Map.vue';
import DentistTimeslot from './views/dentistTimeslot.vue';
import schedule from './views/Schedule.vue';
import PatientTimeslot from './views/patientTimeslot.vue';
import PatientSchedule from './views/PatientSchedule.vue';

const routes = [

    { path: '/', name: 'Home', component: Home, meta: { hideNavbar: true }},

    { path: '/registerPatient', name: 'RegisterPatient', component: registerPatient, meta: { hideNavbar: true }},

    { path: '/login',name: 'Login',component: login,meta: { hideNavbar: true } },
    
    { path: '/dentist', name: 'Dentist', component: dentist },
    
    { path: '/patient', name: 'Patient', component: patient},

    { path: '/registerDentist', name: 'RegisterDentist',component: registerDentist, meta: { hideNavbar: true }},

    { path: '/Map', name: 'Map',component: Map},

    { path: '/dentistTimeslot', name: 'DentistTimeslot',component: DentistTimeslot},

    { path: '/schedule', name: 'schedule',component: schedule},

    { path: '/patientTimeslot', name: 'PatientTimeslot',component: PatientTimeslot},

    { path: '/PatientSchedule', name: 'PatientSchedule',component: PatientSchedule},

];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
