<!--
 * WorkCasePhase.vue
 * This component is used to manage the phases of a work case.
 * It includes a table for displaying phases, approvers, approval statues, and comments.
 * The data is managed using the useWorkPhase composable.
 *
 * @author Yogeesh Narasegowda
 * @version 1.0
-->

<template>
  <div class="modal">
    <div class="modal-header">
      <span class="model-title">{{$t('workCasePhaseLabel') }}</span>
      <button class="close-icon" @click="$emit('close')">&times;</button>
    </div>

    <div class="modal-body phase-table-layout">
      <div class="workcase-input-wrapper">
        <label for="workcase-name">{{$t('workCaseNameLabel') }}:</label>
        <input type="text" id="workcase-name" v-model="workcaseName" disabled />
      </div>

      <table class="phase-table">
        <thead>
          <tr class="phase-table-headers">
            <th class="sticky-label-cell">{{$t('phasesLabel')}}</th>
            <th v-for="phase in phases" :key="phase.key">{{ $t(phase.label) }}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="sticky-label-cell">{{$t('approversLabel') }}</td>
            <td v-for="phase in phases" :key="phase.key">
              <div class="custom-approver-multiselect">
                <div class="approver-dropdown-header" @click="toggleDropdown(phase.key)">
                  {{ selectedApprovers[phase.key]?.length 
                    ? selectedApprovers[phase.key]
                    .map(key => approvers.find(a => a.key === key)?.label)
                    .join(', ') : $t('selectApproversLabel') }}
                  <span class="approver-dropdown-arrow">&#9662;</span>
                </div>
                <div class="approver-dropdown-list" v-if="dropdownOpen[phase.key]">
                  <div v-for="approver in approvers"
                    :key="approver.key"
                    class="approver-dropdown-item"
                  >
                  <input class="select-checkbox"
                    type="checkbox"
                    :id="phase.key + '-' + approver.key"
                    :value="approver.key"
                    v-model="selectedApprovers[phase.key]"
                  />
                  <label :for="phase.key + '-' + approver.key">{{ approver.label }}</label>
                  </div>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td class="sticky-label-cell">{{ $t('approveStatusLabel') }}</td>
            <td v-for="phase in phases" :key="phase.key">
                <select
                  v-model="selectedApprovalStatus[phase.key]"
                  class="approve-status-dropdown"
                  :disabled="!selectedApprovers[phase.key] || selectedApprovers[phase.key].length === 0"
                >
                <option value="" disabled>{{ $t('selectApproveStatusLabel') }}</option>
                <option v-for="status in approvalStatuses" :key="status.key" :value="status.key">
                  {{ status.label }}
                </option>
              </select>
            </td>
          </tr>
          <tr>
            <td class="sticky-label-cell">{{ $t('commentLabel') }}</td>
            <td v-for="phase in phases" :key="phase.key">
              <textarea v-model="comments[phase.key]" class="phase-textarea" :placeholder="$t('commentPlaceholder')"></textarea>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="modal-footer">
      <button class="btn-save" @click="save">{{ $t('saveButton') }}</button>
      <button class="btn-cancel" @click="$emit('close')">{{ $t('cancelButton') }}</button>
    </div>
  </div>
</template>

<script setup>
  import useWorkPhase from '@/js/workcasePhase.js';
  import { defineEmits } from 'vue';
  const emit = defineEmits(['close']);
  const {
    workcaseName,
    phases,
    approvers,
    approvalStatuses,
    selectedApprovers,
    selectedApprovalStatus,
    comments,
    dropdownOpen,
    toggleDropdown,
    save
  } = useWorkPhase(emit);
</script>

<style scoped>
  @import '@/assets/styles/base.css';
  @import '@/assets/styles/modal.css';
  @import '@/assets/styles/workcasePhase.css';
</style>
