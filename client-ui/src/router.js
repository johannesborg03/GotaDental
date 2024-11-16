import { createRouter, createWebHistory } from 'vue-router';
import registerUser from './components/registerUser.vue';
import login from './components/login.vue';
<<<<<<< client-ui/src/router.js
import dentist from './components/dentist.vue';
=======
import patientUI from './components/patientUI.vue';
>>>>>>> client-ui/src/router.js


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
    
<<<<<<< client-ui/src/router.js
    {
        path: '/dentist',
        name: 'Dentist',
        component: dentist,
    },
    
=======
    {    path: '/patient',
        name: 'Patient',
        component: patientUI,
    },
>>>>>>> client-ui/src/router.js
    

];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
