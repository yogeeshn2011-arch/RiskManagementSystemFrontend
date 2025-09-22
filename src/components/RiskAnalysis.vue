<!--
 * RiskAnalysis.vue
 * This component is used to maintain risk analysis for a work case.
 * It includes a table for risk items and a form for remarks.
 * The form data is managed using the useRiskAnalysisModal composable.
 *
 * @author Yogeesh Narasegowda
 * @version 1.0
-->

<template>
  <div class="modal">
    <div class="modal-header">
      <span class="model-title">{{$t('riskAnalysisLabel')}}</span>
      <button class="close-icon" @click="$emit('close')">&times;</button>
    </div>

    <div class="workcase-input-wrapper">
      <label for="workcase-name">{{$t('workCaseNameLabel')}}:</label>
      <input type="text" id="workcase-name" v-model="workcaseName" disabled/>
    </div>

    <div class="modal-body">
      <table class="risk-table">
        <thead>
          <tr>
            <th rowspan="1" class="sticky-col">{{$t('overviewLabel')}}</th>
            <th colspan="4" class="section-header">{{ $t('scopeAndPlanLabel') }}</th>
            <th colspan="4" class="section-header">{{$t('structureLabel')}}</th>
            <th colspan="2" class="section-header">{{$t('operationsLabel')}}</th>
            <th colspan="2" class="section-header">{{$t('productionMigrationLabel')}}</th>
            <th colspan="2" class="section-header">{{$t('externalImpactLabel')}}</th>
            <th colspan="1" class="section-header"></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th rowspan="3" class="sticky-col">{{$t('scopeOfRiskLabel')}}</th>
            <td v-for="(item, index) in riskItems" :key="'header-' + index" class="scope-header">
              {{ item.header }}
            </td>
          </tr>
          <tr>
            <td v-for="(item, index) in riskItems" :key="'value-' + index" class="scope-value">
              {{ item.value }}
            </td>
          </tr>
          <tr>
            <td v-for="(item, index) in riskItems" :key="'checkbox-' + index">
              <input class="select-checkbox" type="checkbox" v-model="item.selected" />
            </td>
          </tr>
          <tr>
            <th class="sticky-col">{{$t('suppliemntationRemarkLabel')}}</th>
            <td colspan="15">
              <textarea v-model="remarks" rows="3" class="remarks-input" :placeholder="$t('commentPlaceholder')"></textarea>
            </td>
          </tr>
        </tbody> 
      </table>
    </div>

    <div class="modal-footer">
      <button class="btn-save" @click="save">{{$t('saveButton')}}</button>
      <button class="btn-cancel" @click="$emit('close')">{{$t('cancelButton')}}</button>
    </div>
  </div>
</template>

<script setup>
  import useRiskAnalysisModal from '@/js/riskAnalysis.js';
  import { defineEmits } from 'vue';
  
  const emit = defineEmits(['close']);
  const {
    workcaseName,
    riskItems,
    remarks,
    save
  } = useRiskAnalysisModal(emit);
</script>

<style scoped>
  @import '@/assets/styles/base.css';
  @import '@/assets/styles/modal.css';
  @import '@/assets/styles/riskAnalysis.css';
</style>
