import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import dotenv from 'dotenv';

dotenv.config();

const app = createApp(App)
    .use(router)
    .mount('#app')
console.log("App started");
