import axios from 'axios';
import { useriskManagementSystemStores } from '@/stores/riskManagementSystemStores';
import i18n from '@/i18n';

/* 
 * This file is used to configure a customized Axios instance for making HTTP requests 
 * to the Risk Management System (RMS) backend, including global error handling for 
 * authentication-related issues. 
 * 
 * It handles token expiration by alerting the user and triggering a page reload to 
 * fetch a new token from the backend. 
 * 
 * @author Yogeesh Narasegowda 
 * @version 1.0 
*/

const api = axios.create({
  baseURL: 'http://localhost:8089/rms', // TODO: Replace localhost with backend IP
});

// Flag to prevent multiple reloads
let isSessionExpired = false;

api.interceptors.response.use(
  response => response,
  async error => {
    const store = useriskManagementSystemStores();

    if (error.response) {
      const status = error.response.status;

      if ((status === 401 || status === 403) && !isSessionExpired) {
        isSessionExpired = true;

        alert(i18n.global.t('sessionExpiredMessage'));

        // Clear token and reload to fetch a new one
        store.token = '';
        window.location.reload();

        // Prevent UI update by returning unresolved promise
        return new Promise(() => {});
      } else if(status === 409) {
        // Handle conflict errors (e.g., duplicate entries)
        const [label, message] = Object.entries(error.response.data)[0];
        alert(`${label} : ${message}`);
        return new Promise(() => {});
      }else if (status === 500) {
        alert(i18n.global.t('serverError'));
        window.location.reload();
        return new Promise(() => {});
      } else {
        alert(i18n.global.t('systemMessage'));
        return new Promise(() => {});
      }
    } else {
      // Likely a network issue or CORS blocked
      alert(i18n.global.t('networkError'));
      return new Promise(() => {});
    }
  }
);

export default api;
