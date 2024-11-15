import { createRouter, createWebHistory } from 'vue-router';
import registerUser from './components/registerUser.vue';

const routes = [
    {
        path: '/register',
        name: 'Register',
        component: registerUser,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
