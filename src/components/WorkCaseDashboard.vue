<!-- 
 * WorkCaseDashboard.vue
 * This component is the main dashboard for managing work cases.
 * It includes filters, action buttons, and a Tabulator table for displaying work cases.
 * The dashboard is managed using the useWorkCaseDashboard composable. 
 *
 * @author Yogeesh Narasegowda
 * @version 1.0
-->
<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="header flex items-center mb-2 justify-between">
      <img src="@/assets/risk-management-icon.webp" alt="Logo" height="30" class="project-logo" />
      <div class="header-title">{{ $t('applicationName') }}</div>
      <div class="flex items-center gap-4">
        <span class="parent-department">{{ $t('parentDepartment') }}</span>
        <div class="language-select">
          <img src="@/assets/Language icon.jpg" alt="Lang" class="lang-icon" />
          <select v-model="language" class="select-language" >
            <option value="ja_JP">日本語</option>
            <option value="en_IN">English</option>
          </select>
          <span class="lang-dropdown-arrow">&#9662;</span>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex justify-between mb-2 mt-4 w-full">
      <div class="flex flex-col dropdown-1">
        <label class="block font-medium mb-2 filter-label">{{ $t('departmentLabel') }}</label>
        <div class="dashboard-dept-dropdown">
          <div class="dropdown-selected dashboard-dep-selected" @click="toggleDropdown">
            {{ selectedDepartment ||  $t('selectDepartmentLabel') }}
            <span class="dropdown-arrow">&#9662;</span>
          </div>

          <ul v-if="showDropdown" class="dep-dropdown-list dashboard-dep-dropdownList">
            <li v-for="(items, dept) in departmentRelatedItems" :key="dept" class="dropdown-item">
              <div class="main-option"
                @mouseenter="onMainOptionEnter(dept)"
                @mouseleave="onMainOptionLeave"
              >
              {{ dept }}
              <span class="nested-dropdown-arrow dashboard-dep-dropdown-arrow">&#9662;</span>

              <ul
                v-if="activeDepartment === dept"
                class="sub-dropdown-list dashboard-sub-dropdown"
                @mouseenter="onSubOptionEnter(dept)"
                @mouseleave="onSubOptionLeave"
              >
              <li
                v-for="item in items"
                :key="item"
                class="sub-dropdown-item"
                @click="selectSubDepartment(dept, item)"
              >
                {{ item }}
              </li>
              </ul>
            </div>
            </li>
          </ul>
        </div>
      </div>

      <div class="flex flex-col dropdown-2">
        <label class="block font-medium mb-2 filter-label">{{ $t('projectLabel') }}</label>
        <select v-model="selectedProject" class="select-box mb-2" :disabled="selectedDepartment === ''">
          <option value="">{{ $t('allLabel') }}</option>
          <option v-for="project in teamProjects[selectedDepartment]" :key="project.projectId" :value="project">
            {{ project.projectName }}</option>
        </select>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-start mb-2">
      <button class="btn btn-search" @click="filterWorkCaseGrid" :disabled="!isSearchEnabled">
        {{ $t('searchButton') }}
      </button>
    </div>
    <!-- Action Buttons -->
    <div class="flex justify-end mb-2 grid-buttons">
      <button class="btn btn-new" @click="showCreateModal">{{ $t('newButton') }}</button>
      <button class="btn btn-phase" :disabled="!isPhaseEnabled" @click="showPhaseModal">{{ $t('phaseButton') }}</button>
      <button class="btn btn-risk" :disabled="!isRiskEnabled" @click="showRiskModal">{{ $t('riskButton') }}</button>
      <button class="btn btn-edit" :disabled="!isEditEnabled" @click="showEditModal">{{ $t('editButton') }}</button>
      <button class="btn btn-delete" :disabled="!isDeleteEnabled" @click="deleteCase">{{ $t('deleteButton') }}</button>
    </div>

    <!-- Tabulator Table -->
    <div class="workcase-grid">
      <div class="grid-title">{{ $t('dataGridName') }}
        <span class="grid-refresh-button" @click="refreshGrid" title="Refresh">&#x21bb;</span>
      </div>
      <div ref="tableContainer" class="tabulator-table-container grid-body"></div>
    </div>

    <!-- Footer -->
    <footer class="footer mt-1 text-center text-gray-500 text-sm">
      © {{ $t('CopyrightLabel') }} {{ currentYear }}: <a href="https://www.ksc.co.jp/" target="_blank" 
      class="text-blue-500 underline">ksc.co.jp</a> {{ $t('allRightsReserved') }}
    </footer>

    <!-- Modals -->
     <div v-if="currentModal" class = "modal-backdrop">
      <WorkCaseCreation v-if="currentModal === 'create'" 
        @close="currentModal = null"  @refresh-dashboard="refreshGrid"/>
      <WorkcasePhase v-if="currentModal === 'phase'" 
        @close="currentModal = null" @refresh-dashboard="refreshGrid"/>
      <RiskAnalysis v-if="currentModal === 'risk'" 
        @close="currentModal = null" @refresh-dashboard="refreshGrid"/>
      <WorkCaseEdit v-if="currentModal === 'edit'" 
        @close="currentModal = null" @refresh-dashboard="refreshGrid"/>
     </div>
  </div>
</template>

<script setup>
  import useWorkCaseDashboard from '@/js/workCaseDashboard.js';
  import WorkcasePhase from '@/components/WorkCasePhase.vue';
  import RiskAnalysis from '@/components/RiskAnalysis.vue';
  import WorkCaseCreation from '@/components/CreateWorkCase.vue';
  import WorkCaseEdit from '@/components/EditWorkCase.vue';
  import useUtilities from '@/js/common.js';
  import { computed } from 'vue';

  const isSearchEnabled = computed(() => {
    return selectedDepartment.value !== '';
  });

  const {
    tableContainer,
    language,
    selectedProject,
    currentModal,
    refreshGrid,
    showCreateModal,
    showPhaseModal,
    showRiskModal,
    showEditModal,
    deleteCase,
    filterWorkCaseGrid,
    isPhaseEnabled,
    isRiskEnabled,
    isEditEnabled,
    isDeleteEnabled,
    currentYear
  } = useWorkCaseDashboard();

   const { 
    showDropdown,
    toggleDropdown,
    selectSubDepartment,
    departmentRelatedItems,
    teamProjects,
    selectedDepartment,
    onMainOptionEnter,
    onMainOptionLeave,
    onSubOptionEnter,
    onSubOptionLeave,
    activeDepartment,} = useUtilities();
</script>


<style>
  @import '@/assets/styles/base.css';
</style>
