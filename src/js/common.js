import { useriskManagementSystemStores } from '@/stores/riskManagementSystemStores';
import { ref, onMounted, watch, computed, onBeforeMount } from 'vue';
import { storeToRefs } from 'pinia';
import i18n from '@/i18n';

/*
* This it utility composable used to maintain commonly used functions across the project.
* It provides functionality for managing department dropdowns, handling user interactions,
* and fetching department data.
*
* @author Yogeesh Narasegowda
* @version 1.0
*/
export default function useUtilities(emit) {
  const stores = useriskManagementSystemStores();
  const { language, selectedDepartment } = storeToRefs(stores);
  const showDropdown = ref(false);
  const hoverDepartment = ref('');
  const activeDepartment = ref('');

  // Computed property: maps each department to its team names
  const departmentRelatedItems = computed(() => {
    const result = {};
    stores.departmentHierarchy.forEach(dept => {
      result[dept.departmentName] = dept.departmentTeams.map(team => team.teamName);
    });
    return result;
  });

  // Computed property: maps each "Department : Team" to its list of projects
  const teamProjects = computed(() => {
    const projects = {};
    stores.departmentHierarchy.forEach(dept => {
      dept.departmentTeams?.forEach(team => {
        const key = `${dept.departmentName} : ${team.teamName}`;
        projects[key] = team.projects || [];
      });
    });
    return projects;
  });

  // Function to fetch department hierarchy data from the store
  const fetchDepartmentData = async ()=> {
    // Fetch department hierarchy data from the store
    await stores.fetchDepartmentHierarchy();
  }

  // Function to toggle the dropdown visibility
  const toggleDropdown = () => {
    showDropdown.value = !showDropdown.value;
  };

  /* 
    Sets the selected department and team when a sub-option is chosen.
    Also updates the form and hides the dropdown.
  */
  const selectSubDepartment = (department, team) => {
    const selectedDepTeam = `${department} : ${team}`;
    selectedDepartment.value = selectedDepTeam;
    showDropdown.value = false;
  };

  // Handles mouse entering a main department option (used to highlight/activate it).
  const onMainOptionEnter = (department) => {
    hoverDepartment.value = department;
    activeDepartment.value = department;
  };

  // Resets hover state when mouse leaves a main department option.
  const onMainOptionLeave = () => {
    hoverDepartment.value = '';
  };

  // Handles mouse entering a sub-option (team), keeping it active.
  const onSubOptionEnter = (department) => {
    activeDepartment.value = department;
  };

  // Resets hover and active state when mouse leaves a sub-option.
  const onSubOptionLeave = () => {
    activeDepartment.value = '';
    hoverDepartment.value = '';
  };

  // Fetch dropdown data once when the component is mounted (initial load)
  onMounted(() => {
    fetchDepartmentData();
    document.addEventListener('click', handleClickOutsideDropdown);
  });

  onBeforeMount(() => {
    document.removeEventListener('click', handleClickOutsideDropdown);
  });

  // Re-fetch dropdown data when the language changes (for localization support)
  watch(language, () => {
    fetchDepartmentData();
  });
  
  // Closes the modal and resets the selected department when called.
  function closeModal() {
    emit('close');
    stores.resetSelectedDepartment();
  }   

  // Handles clicks outside the department dropdown to close it.
  function handleClickOutsideDropdown(event) {
    const dropdowns = [
      document.querySelector('.department-dropdown'),
      document.querySelector('.dashboard-dept-dropdown')
    ];

    const isClickInsideDropdown = dropdowns.some(dropdown => {
      return dropdown && dropdown.contains(event.target);
    });

    if (!isClickInsideDropdown) {
      showDropdown.value = false;
    }
  }

  // Handles required field validation in create and edit work case modals
  function validateRequiredFields(form, fieldMappings) {
    const missingFields = fieldMappings
      .filter(field => {
        const value = form.value[field.key];
        // If null/undefined or empty after string conversion
        return !value || String(value).trim() === '';
      })
      .map(field => i18n.global.t(field.label));

    if (missingFields.length > 0) {
      const missingList = missingFields
        .map((label, index) => `${index + 1}. ${label}`)
        .join('\n');
      alert(`${i18n.global.t('validateCreateWorkcase')} :\n${missingList}`);
      return false;
    }
    return true;
  }

  // Handles input field validation in create and edit work case modals
  function validateInputFieldMaxLength(form) {
    // Trim all string fields first
    Object.keys(form.value).forEach(key => {
      if (typeof form.value[key] === 'string') {
        form.value[key] = form.value[key].trim();
      }
    });

    if (form.value.workcaseName.length > 100) {
      alert(i18n.global.t('workcaseNameLengthError'));
      return false;
    }

    if (form.value.currentChallenges.length > 500) {
      alert(i18n.global.t('currentChallengesLengthError'));
      return false;
    }

    if (form.value.resourceMigrationDate.length > 15) {
      alert(i18n.global.t('resourceMigrationDateLengthError'));
      return false;
    }

    if (form.value.businessUseStartDate.length > 15) {
      alert(i18n.global.t('businessUseStartDateLengthError'));
      return false;
    }

    if (form.value.initialOperationDate.length > 15) {
      alert(i18n.global.t('initialOperationDateLengthError'));
      return false;
    }

    return true;
  }

  return {
    showDropdown,
    departmentRelatedItems,
    teamProjects,
    selectedDepartment,
    toggleDropdown,
    selectSubDepartment,
    onMainOptionEnter,
    onMainOptionLeave,
    onSubOptionEnter,
    onSubOptionLeave,
    activeDepartment,
    closeModal,
    validateRequiredFields,
    validateInputFieldMaxLength
  };
}
