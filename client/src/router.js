import { createRouter, createWebHistory } from 'vue-router';
import registerPatient from './views/registerPatient.vue';
import dentist from './views/dentist.vue';
import patient from './views/patient.vue';
import registerDentist from './views/registerDentist.vue';
import Home from './views/Home.vue';
import Map from './views/Map.vue';
import dentistAppointments from './views/dentistAppointments.vue';
import schedule from './views/Schedule.vue';
import PatientSchedule from './views/PatientSchedule.vue';
import PatientBookedAppointment from './views/patientBookedAppointment.vue';

const routes = [

    { path: '/', name: 'Home', component: Home, meta: { hideNavbar: true }},

    { path: '/registerPatient', name: 'RegisterPatient', component: registerPatient, meta: { hideNavbar: true }},

    { path: '/dentist', name: 'Dentist', component: dentist },
    
    { path: '/patient', name: 'Patient', component: patient},

    { path: '/registerDentist', name: 'RegisterDentist',component: registerDentist, meta: { hideNavbar: true }},

    { path: '/Map', name: 'Map',component: Map},

    { path: '/dentistAppointments', name: 'dentistAppointments',component: dentistAppointments},

    { path: '/schedule', name: 'schedule',component: schedule},

    { path: '/PatientSchedule', name: 'PatientSchedule',component: PatientSchedule},

    { path: '/PatientBookedAppointment', name: 'PatientBookedAppointment',component: PatientBookedAppointment},


];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
