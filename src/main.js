import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate' 
import App from './App.vue'
import router from './router'
import i18n from './i18n'

// Import Bootstrap and FontAwesome
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '@fortawesome/fontawesome-free/css/all.min.css'

// Import global styles
import './assets/main.css'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate) // ✅ enable plugin

app.use(pinia)
app.use(router)
app.use(i18n)

app.mount('#app')
