import { defineStore } from 'pinia';
import api from './api.js';

import i18n from '../i18n';

/*
 * This file defines the main Pinia store (`rms`) used in the Risk Management System (RMS) frontend.
 * It handles:
 * - Managing authentication tokens
 * - Setting the app language
 * - Fetching and storing master data (statuses, categories, subsystems, departments, etc.)
 * - Performing CRUD operations on work cases and associated phases
 * - Managing risk-related data
 * 
 * This centralized store ensures shared state across components and handles API interactions 
 * via Axios, with token-based authentication and language localization.
 * 
 * @author Yogeesh Narasegowda
 * @version 1.0
 */
export const useriskManagementSystemStores = defineStore('rms', {
  state: () => ({
    // Define the default language or selected language
    language: localStorage.getItem('user-locale') || 'ja_JP',
    token: '',
    workCaseStatuses: [],
    workCaseCategories: [],
    workCaseSubsystems: [],
    workCaseDelays: [],
    workPhaseApprovers: [],
    workPhaseApproveStatuses: [],
    departmentHierarchy: [],
    selectedDepartment: '',
    selectedRowData: {}, 
    phaseList : []
  }),
  actions: {
    // Set the language
    async  setLanguage(lang) {
      this.language = lang;
      i18n.global.locale.value = lang;

      // Ensure token is set before making any authenticated requests
      if (!this.token) {
        await this.fetchToken();
      }
      
      await Promise.all([
        this.fetchWorkCaseStatuses(),
        this.fetchWorkCaseCategories(),
        this.fetchWorkCaseSubSystems(),
        this.fetchWorkCaseDelays(),
        this.fetchWorkPhaseApprovers(),
        this.fetchWorkPhaseApproveStatuses(),
        this.fetchDepartmentHierarchy(),
      ]);
    },

    // Attach the token to Axios header for authenticated requests
    getAxiosConfig() {
      return {
        headers: {
          Authorization: `Bearer ${this.token}`
        },
        params: { lang: this.language.toLowerCase() }
      };
    },

    // Fetch a new token from the backend
    async fetchToken() {
      try {
        const response = await api.get('/token');
        const token = response.data.token;

        if (!token) {
          throw new Error('Token is empty or undefined');
        }

        this.token = token;
        return token;
      } catch (error) {
        console.error('Error fetching token:', error);
      }
    },
    
    // Fetch WorkCase Data from the backend
    async fetchWorkCaseData() {
      try {
        const workCases = await api.get('/workCaseList', this.getAxiosConfig());

        return workCases.data;
      } catch (error) {
        console.error('Error fetching WorkCase data:', error);
      }
    },

     // Fetch WorkCase Statuses from the backend
    async fetchWorkCaseStatuses() {
      try {
        const statuses = await api.get('/workCaseStatus', this.getAxiosConfig());
        this.workCaseStatuses = statuses.data;
      } catch (error) {
        console.error('Error fetching WorkCase statuses:', error);
      }
    },

    // Fetch WorkCase Categories from the backend
    async fetchWorkCaseCategories() {
      try {
        const categories = await api.get('/workCaseCategory', this.getAxiosConfig());
        this.workCaseCategories = categories.data;
      } catch (error) {
        console.error('Error fetching WorkCase categories:', error);
      }
    },

    // Fetch WorkCase Subsystems from the backend
    async fetchWorkCaseSubSystems() {
      try {
        const subSystems = await api.get('/workCaseSubsystem', this.getAxiosConfig());
        this.workCaseSubsystems = subSystems.data;
      } catch (error) {
        console.error('Error fetching WorkCase subsystems:', error);
      }
    },

    // Fetch WorkCase Delays from the backend
    async fetchWorkCaseDelays() {
      try {
        const workDelays = await api.get('/workCaseDelay', this.getAxiosConfig());
        this.workCaseDelays = workDelays.data;
      } catch (error) {
        console.error('Error fetching WorkCase delays:', error);
      }
    },
    
    // Fetch departments, teams, and projects from the backend
    async fetchDepartmentHierarchy() {
      try {
        const departments = await api.get('/departments', this.getAxiosConfig());
        this.departmentHierarchy = departments.data;
      } catch (error) {
        console.error('Error fetching departments,team,projects:', error);
      }
    },
    // Register a new work case
    async createWorkCase(workcaseData) {
      try {
          const saveWorkcase = await api.post('/createWorkcase', workcaseData, this.getAxiosConfig());
          return saveWorkcase.data;
      } catch (error) {
          console.error('Error creating work case:', error);
      }
    },

    // Update an existing work case
    async updateWorkCase(workcaseData) {
      try {
        const updateWorkcase = await api.put('/updateWorkcase', workcaseData, this.getAxiosConfig());
        return updateWorkcase.data;
      } catch (error) {
        console.error('Error updating work case:', error);
      }
    },
    
    // Delete selected work cases
    async deleteWorkCases(caseIds){
      try {
        const deleteCases = await api.post('/deleteWorkcase', caseIds, this.getAxiosConfig());
        return deleteCases.data;
      } catch (error) {
        console.error('Error deleting selected work case(s):', error);
      }
    },
    // Fetch work Phase approves
    async fetchWorkPhaseApprovers() {
      try {
        const response = await api.get('/approvers', this.getAxiosConfig());
        // Convert object → array
        this.workPhaseApprovers = Object.entries(response.data).map(([key, label]) => ({
          key,
          label,
        }));
      } catch (error) {
        console.error('Error fetching WorkPhase approvers:', error);
      }
    },

    // Fetch work phase approve statuses
    async fetchWorkPhaseApproveStatuses() {
      try {
        const response = await api.get('/approveStatus', this.getAxiosConfig());

        this.workPhaseApproveStatuses = Object.entries(response.data).map(([key, label]) => ({
          key,
          label,
        }));
      } catch (error) {
        console.error('Error fetching WorkPhase approve statuses:', error);
      }
    },

    // Add or update work phases of a work case
    async addorUpdateWorkPhases(phasesData) {
      try {
        const response = await api.post('/addWorkPhases',phasesData, this.getAxiosConfig());
        return response.data;
      } catch (error) {
        console.error('Error saving Workcase Phases:', error);
      }
    },

    // Fetch work case phases details for a given work case ID
    async fetchWorkCasePhaseDetails(workcaseId) {
      try {
        const response = await api.get(`/getWorkPhases/${workcaseId}`, this.getAxiosConfig());
        return response.data;
      } catch (error) {
        console.error('Error fetching phase details:', error);
        return [];
      }
    },

    // Add or update risk details for a work case
    async addOrUpdateRiskDetails(riskData) {
      try {
        const response = await api.post('/addRiskDetails', riskData, this.getAxiosConfig());
        return response.data;
      } catch (error) {
        console.error('Error saving risk details:', error);
      }
    },

    // Fetch risk details for a given work case Id
    async fetchRiskDetails(workCaseId) {
      try {
        const response = await api.get(`/getRiskDetails/${workCaseId}`, this.getAxiosConfig());
        return response.data;
      } catch (error) {
        console.error('Failed to fetch risk details', error);
        return [];
      }
    },

    // Reset the selected department to avoid displaying previous selections as common code used in multiple components
    resetSelectedDepartment() {
      this.selectedDepartment = '';
    },
  }
});
