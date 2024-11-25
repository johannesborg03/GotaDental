import { createRouter, createWebHistory } from 'vue-router';
import registerPatient from './views/registerPatient.vue';
import login from './views/login.vue';
import dentist from './views/dentist.vue';
import patient from './views/patient.vue';
import registerDentist from './views/registerDentist.vue';

const routes = [
    {
        path: '/registerPatient',
        name: 'RegisterPatient',
        component: registerPatient,
    },

    {
        path: '/login',
        name: 'Login',
        component: login,
    },
    
    {
        path: '/dentist',
        name: 'Dentist',
        component: dentist,
    },
    
    {    path: '/patient',
        name: 'Patient',
        component: patient,
    },
    {    path: '/registerDentist',
        name: 'RegisterDentist',
        component: registerDentist,
    },
    

];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
