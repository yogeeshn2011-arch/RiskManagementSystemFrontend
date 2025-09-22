import { createApp } from 'vue'
import { createPinia } from 'pinia';
import App from './App.vue';
import i18n from './i18n';
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import './assets/styles/base.css';
import './assets/styles/modal.css'; 
import './assets/styles/create_edit_workcase.css';
import 'tabulator-tables/dist/css/tabulator.min.css';
import './js/common.js';
import { useriskManagementSystemStores } from '@/stores/riskManagementSystemStores';

/*
* This is the main entry point for the Vue.js application javascript file.
* It initializes the Vue application, sets up routing, state management with Pinia,
* and internationalization support using i18n. 
*
* It also imports global CSS styles and third-party CSS libraries required by the app.
* @author Yogeesh Narasegowda
* @version 1.0
*/

// Create the Vue application instance
const app = createApp(App);

// Use Pinia for state management
app.use(createPinia());

// Use i18n for internationalization
app.use(i18n);

// Use toaser for notification
app.use(Toast);

// Now you can safely create the store instance after pinia is installed
const rmsStore = useriskManagementSystemStores();

// If you want to fetch token and initialize language before mount, do:
(async () => {
  await rmsStore.fetchToken();
  await rmsStore.setLanguage(rmsStore.language);

  // Mount app after async initialization finishes
  app.mount('#app');
})();
