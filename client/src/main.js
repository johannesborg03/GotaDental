import { createApp } from 'vue'
import { createBootstrap } from 'bootstrap-vue-next'
import App from './App.vue'
import router from './router'
//import "leaflet/dist/leaflet.css";
//import L from 'leaflet';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'
import 'devextreme/dist/css/dx.light.css'; // You can change 'dx.light.css' to a theme of your choice



const app = createApp(App);
app.use(createBootstrap)

app.use(router);

app.mount('#app'); 