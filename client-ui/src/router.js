import { createRouter, createWebHistory } from 'vue-router';
import registerUser from './components/registerUser.vue';
import login from './components/login.vue';


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

];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
