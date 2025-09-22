<!--
 * CreateWorkCase.vue
 * This component is used to create a new work case.
 * It includes a form with various fields and dropdowns for creating new work case.
 * The form data is managed using the useCreateWorkCaseModal composable.
 *
 * @author Yogeesh Narasegowda
 * @version 1.0
-->
<template>
  <div class="modal">
    <div class="modal-header">
      <span class="model-title">{{$t('workCaseCreationLabel')}}</span>
      <button class="close-icon" @click="closeModal">&times;</button>
    </div>

    <div class="modal-body">
      <div class="form-row">
        <!-- Left Column -->
        <div class="form-column">
          <div class="input-pair">
            <!-- <label>{{$t('workCaseNameLabel')}}:</label> -->
            <label>
              {{ $t('workCaseNameLabel') }}
              <span style="color: red">*</span> :
            </label>
            <input type="text" v-model="createForm.workcaseName" :placeholder="$t('enterWorkCaseNameLabel')" />
          </div>

          <div class="input-pair">
            <label>{{$t('departmentNameLabel')}}
               <span style="color: red">*</span> :
            </label>
            <div class="dropdown-wrapper">
              <div class="department-dropdown">
                <div class="dropdown-selected" @click="toggleDropdown">
                  {{ selectedDepartment || $t('selectDepartmentLabel') }}
                  <span class="dropdown-arrow">&#9662;</span>
                </div>

                <!-- Dropdown list for departments and teams -->
                <ul v-if="showDropdown" class="dep-dropdown-list">
                  <li v-for="(teams, department) in departmentRelatedItems" :key="department" class="dropdown-item">
                    <div
                      class="main-option"
                      @mouseenter="onMainOptionEnter(department)"
                      @mouseleave="onMainOptionLeave"
                    >
                      {{ department }}
                      <span class="nested-dropdown-arrow">&#9662;</span>

                      <ul
                        v-if="activeDepartment === department"
                        class="sub-dropdown-list"
                        @mouseenter="onSubOptionEnter(department)"
                        @mouseleave="onSubOptionLeave"
                      >
                        <li
                          v-for="team in teams"
                          :key="team"
                          class="sub-dropdown-item"
                          @click="selectSubDepartment(department, team)"
                        >
                          {{ team }}
                        </li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div class="input-pair">
            <label>{{$t('projectNameLabel')}}
               <span style="color: red">*</span> :
            </label>
            <select v-model="createForm.projectName" :disabled="selectedDepartment === ''">
              <option value="" disabled selected>{{$t('selectProjectLabel')}}</option>
              <option v-for="project in teamProjects[selectedDepartment]" :key="project.projectId" :value="project">
                {{ project.projectName }}
              </option>
            </select>
          </div>

          <div class="input-pair">
            <label>{{$t('resourceMigrationDateLabel')}} :</label>
            <input type="text" v-model="createForm.resourceMigrationDate" 
              :placeholder="$t('enterResourceMigrationDateLabel')"
              @input="validateDateInput"
            />
          </div>
          <!-- TODO: Implementing custom date picker with input text -->
          <!-- <div class="input-pair">
            <label>{{$t('resourceMigrationDateLabel')}}:</label>
            <DateTextInput v-model="form.resourceMigrationDate" placeholder="Select date or enter text" />
          </div> -->

          <div class="input-pair">
            <label>{{$t('businessUseStartDateLabel')}} :</label>
            <input type="text" v-model="createForm.businessUseStartDate" 
              :placeholder="$t('enterBusinessUseStartDateLabel')" 
              @input="validateDateInput"
            />
          </div>
          <!-- TODO: Implementing custom date picker with input text -->
          <!-- <div class="input-pair">
            <label>{{$t('businessUseStartDateLabel')}}:</label>
            <DateTextInput v-model="form.businessUseStart" placeholder="Select date or enter text" />
          </div> -->
        </div>

        <!-- Right Column -->
        <div class="form-column">

          <div class="input-pair">
            <label>{{$t('workCaseStatusLabel')}}
               <span style="color: red">*</span> :
            </label>
            <select v-model="createForm.workcaseStatus">
              <option value="" disabled>-- {{$t('selectWorkCaseStatusLabel')}} --</option>
              <option v-for="(label, key) in statuses" :key="key" :value="key">
                {{ label }}
              </option>
            </select>
          </div>

          <!-- category -->
          <div class="input-pair">
            <label>{{$t('workCaseCategoryLabel')}} :</label>
            <select v-model="createForm.workcaseCategory">
              <option value="" disabled>-- {{$t('selectWorkCaseCategoryLabel')}} --</option>
              <option v-for="(label, key) in categories" :key="key" :value="key">
                {{ label }}
              </option>
            </select>
          </div> 

          <div class="input-pair">
            <label>{{$t('workCaseSubSystemLabel')}} :</label>
            <select v-model="createForm.workcaseSubSystem">
              <option value="" disabled>-- {{$t('selectWorkCaseSubSystemLabel')}} --</option>
              <option v-for="(label, key) in subSystems" :key="key" :value="key">
                {{ label }}
              </option>
            </select>
          </div>

          <div class="input-pair">
            <label>{{$t('initialOperationDateLabel')}}:</label>
            <input type="text" v-model="createForm.initialOperationDate" 
              :placeholder="$t('enterInitialOperationDateLabel')"
              @input="validateDateInput"
            />
          </div>
          <!-- TODO: Implementing custom date picker with input text -->
          <!-- <div class="input-pair">
            <label>{{$t('initialOperationDateLabel')}}:</label>
            <DateTextInput v-model="form.initialOperationDate" placeholder="Select date or enter text" />
          </div> -->

         <div class="input-pair">
            <label>{{$t('workcaseDelayLabel')}} :</label>
            <select v-model="createForm.delayFlag" disabled>
              <option value="" disabled selected>-- {{ $t('selectWorkcaseDelayLabel') }} --</option>
              <option v-for="(label, key) in delays" :key="key" :value="key">
                {{ label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div class="form-row textarea-row">
        <label>{{$t('currentChanllengesLabel')}} :</label>
        <textarea class="create-textarea" rows="4" 
          v-model="createForm.currentChallenges" :placeholder="$t('commentPlaceholder')"></textarea>
      </div>
    </div>

    <div class="modal-footer">
      <button class="btn-save" @click="saveWorkcase">{{$t('saveButton')}}</button>
      <button class="btn-cancel" @click="closeModal">{{$t('cancelButton')}}</button>
    </div>
  </div>
</template>

  
<script setup>
  import useCreateWorkCaseModal  from '@/js/createWorkCase.js';
  import useUtilities from '@/js/common.js';
  import { defineEmits } from 'vue';
  const emit = defineEmits(['close']);
  const validateDateInput = (event) => {
    event.target.value = event.target.value.replace(/[^\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}a-zA-Z0-9-/]/gu, '');
  };

  const {
    saveWorkcase,
    createForm,
    statuses,
    categories,
    subSystems,
    delays
  } = useCreateWorkCaseModal(emit);

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
    activeDepartment,
    closeModal} = useUtilities(emit);
</script>

<style scoped>
  @import '@/assets/styles/base.css';
  @import '@/assets/styles/modal.css';
  @import '@/assets/styles/create_edit_workcase.css';
</style>
  