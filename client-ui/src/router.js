import { createRouter, createWebHistory } from 'vue-router';
import registerUser from './components/registerPatient.vue';
import login from './components/login.vue';
import dentist from './components/dentist.vue';
import patientUI from './components/patientUI.vue';
import registerDentist from './components/registerDentist.vue';

const routes = [
    {
        path: '/register',
        name: 'Register',
        component: registerUser,
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
        component: patientUI,
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
