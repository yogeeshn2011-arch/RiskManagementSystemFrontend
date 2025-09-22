<!-- TODO: Need to implement custom date picker with input text 
 Currently this is not used, this will be used in create & edit workcase modals for custom date pick-->
<template>
  <div class="date-text-input">
    <input
      type="text"
      v-model="inputValue"
      :placeholder="placeholder"
      @focus="toggleCalendar"
      autocomplete="off"
    />
    <span class="calendar-icon" @click="toggleCalendar">
      <img src="@/assets/calendar-icon.jpg" alt="Calendar Icon" class="calendar-icon"/>
    </span>

    <Datepicker
      v-if="showDatepicker"
      v-model="selectedDate"
      :format="formatDate"
      @update:model-value="onDateSelected"
      :autoClose="true"
      :editable="false"
      :teleport="true"
      :hide-input="true"
      :flow="['calendar']"
    />
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue';
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

// Props
const props = defineProps({
  modelValue: String,
  placeholder: String,
});

// Emits
const emit = defineEmits(['update:modelValue']);

// State
const inputValue = ref(props.modelValue || '');
const selectedDate = ref(props.modelValue ? new Date(props.modelValue) : null);
const showDatepicker = ref(false);

// Watch for external modelValue changes
watch(() => props.modelValue, (val) => {
  inputValue.value = val || '';
  const parsed = new Date(val);
  selectedDate.value = isNaN(parsed) ? null : parsed;
});

// Format date to YYYY-MM-DD
function formatDate(date) {
  return date?.toISOString().split('T')[0] || '';
}

// Handle date selection
function onDateSelected(date) {
  const formatted = formatDate(date);
  inputValue.value = formatted;
  emit('update:modelValue', formatted);
  showDatepicker.value = false;
}

// Toggle calendar visibility
function toggleCalendar() {
  showDatepicker.value = !showDatepicker.value;
}
</script>

<style scoped>
.date-text-input {
  position: relative;
  display: inline-block;
  align-items: center;
}

.date-text-input input {
  padding-right: 152px;
  box-sizing: border-box;
  width: 100%;
}

.calendar-icon {
  position: absolute;
  top: 4px;
  right: 3px;
  height: 20px;
  width: 20px;
  cursor: pointer;
  user-select: none;
}
</style>
