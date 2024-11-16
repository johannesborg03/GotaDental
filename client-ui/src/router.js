import { createRouter, createWebHistory } from 'vue-router';
import registerUser from './components/registerUser.vue';
import login from './components/login.vue';
import dentist from './components/dentist.vue';
import patientUI from './components/patientUI.vue';


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
    

];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
