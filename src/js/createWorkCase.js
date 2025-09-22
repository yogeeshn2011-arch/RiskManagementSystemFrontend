import { ref, onMounted, watch, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useriskManagementSystemStores } from '@/stores/riskManagementSystemStores';
import i18n from '@/i18n';
import useUtilities  from '@/js/common.js';

/*
* This module is used to create a new work case.
* It provides functionality to manage the creation of work cases,
* including fetching dropdown data, managing create form state, and handling user interactions.
* It also includes computed localized properties for dropdowns.
*
* @author Yogeesh Narasegowda
* @version 1.0
*/
export default function useCreateWorkCaseModal(emit) {
  const stores = useriskManagementSystemStores();
  const { language, selectedDepartment } = storeToRefs(stores); 
  const { validateRequiredFields, validateInputFieldMaxLength } = useUtilities(emit);

  //Get the selected department from the store which set in common.js to bind it to the create form
  watch(selectedDepartment, (newVal) => {
    createForm.value.departmentName = newVal;
  });
 
  /* 
    Computed properties to access the dropdown data from the store to populate the create form fields dynamically
    These properties will automatically update when the store's state changes,
    ensuring that the dropdowns in the create form are always up-to-date with the latest data.
  */
  const statuses = computed(() => stores.workCaseStatuses);
  const categories = computed(() => stores.workCaseCategories);
  const subSystems = computed(() => stores.workCaseSubsystems);
  const delays = computed(() => stores.workCaseDelays);

  /* 
    Form data structure for creating a work case.
    Ensure these field names match the template and controller DTO,
    especially if the DTO isn't explicitly used in the controller.
  */
  const createForm = ref({
    workcaseName: '',
    departmentName: '',
    teamName: '',
    projectName: '',
    workcaseCategory: '',
    workcaseStatus: '',
    workcaseSubSystem: '',
    delayFlag: '',
    resourceMigrationDate: '',
    businessUseStartDate: '',
    initialOperationDate: '',
    currentChallenges: ''
  });

  // Reset function to clear the create form fields
  const resetCreateForm = () => {
    createForm.value = {
      workcaseName: '',
      departmentName: '',
      teamName: '',
      projectName: '',
      workcaseCategory: '',
      workcaseStatus: '',
      workcaseSubSystem: '',
      delayFlag: '',
      resourceMigrationDate: '',
      businessUseStartDate: '',
      initialOperationDate: '',
      currentChallenges: ''
    };
  };

  /*
    Function with component mounted lifecycle hook to fetch all dropdown data of this component.
  */
  const fetchDropdownData = async () => {
    try {
      stores.fetchWorkCaseStatuses();
      stores.fetchWorkCaseCategories();
      stores.fetchWorkCaseSubSystems();
      stores.fetchWorkCaseDelays();
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  // Fetch dropdown data once when the component is mounted (initial load)
  onMounted(() => {
    stores.resetSelectedDepartment();
    fetchDropdownData();
  });

  // Re-fetch dropdown data when the language changes (for localization support)
  watch(language, () => {
    stores.resetSelectedDepartment();
    fetchDropdownData();
  });

  /*
    Function to save the new work case.
    It validates the create form fields and renders an alert if any required fields are missing.
  */
  const saveWorkcase = async () => {
    try {
       // Trim all string fields to avoid submitting just white spaces
      Object.keys(createForm.value).forEach(key => {
        if (typeof createForm.value[key] === 'string') {
          createForm.value[key] = createForm.value[key].trim();
        }
      });

      // Define required fields
      const fieldMappings = [
        { key: 'workcaseName', label: 'workCaseNameLabel' },
        { key: 'departmentName', label: 'departmentNameLabel' },
        { key: 'projectName', label: 'projectNameLabel' },
        { key: 'workcaseStatus', label: 'workCaseStatusLabel' }
      ];

      // Input field validations
      if (!validateRequiredFields(createForm, fieldMappings)) return;
      if (!validateInputFieldMaxLength(createForm)) return;

      /*
       If department and team are selected, split them and set the create form values accordingly.
       This is required to bind the selected department and team to the form and to the backend WorkCaseDTO.
      */
      const departmentteamHierarchy = selectedDepartment.value;
      if(departmentteamHierarchy != '') {
        const [departmentName, teamName] = departmentteamHierarchy.split(' : ');
        createForm.value.departmentName = {
          departmentId: stores.departmentHierarchy.find(dept => dept.departmentName === departmentName).departmentId,
          departmentName: departmentName.trim()
        };
        createForm.value.teamName = {
          teamId: stores.departmentHierarchy
            .find(dept => dept.departmentName === departmentName)
            .departmentTeams.find(team => team.teamName === teamName).teamId,
          teamName: teamName.trim()
        }
        createForm.value.projectName = {
          projectId: createForm.value.projectName.projectId,
          projectName: createForm.value.projectName.projectName
        }
      }

      // Setting Default delayFlag to 'ONSCHEDULED' for new cases; required since it's an enum and cannot be empty
      createForm.value.delayFlag = "ONSCHEDULED"; 
      const result = await stores.createWorkCase(createForm.value);
      const rawMessage = Object.entries(result)[0];
      alert(`${rawMessage[0]} : ${rawMessage[1]}`);
    
      const message = rawMessage[0].toLowerCase();
      const closeTriggers = ['success', '成功'];
      const failureTriggers = ['failure', '失敗'];
      const resetTriggers = ['success', 'failure', '成功', '失敗'];

      // Automatically close the form if the create is success
      if (closeTriggers.includes(message)) {
        emit('close');
        emit('refresh-dashboard');
      }
      // Must need to reset as same refeference is used in the multiple components
      if (resetTriggers.includes(message)) {
        stores.resetSelectedDepartment();
      }
      // Reset the create form if the create is failure
      if (failureTriggers.includes(message)) {
        resetCreateForm();
      }
    } catch (error) {
      console.error(error);
      // Handle HTTP errors gracefully
      if (error.response && error.response.status === 409 && typeof error.response.data === 'object') {
        const [label, message] = Object.entries(error.response.data)[0];
        alert(`${label} : ${message}`);
        resetCreateForm(); // Reset form on failure
      } else {
        // For all other unexpected errors
        alert(i18n.global.t('workcaseCreationError'));
      }
    }
  };

  return {
      saveWorkcase,
      createForm,
      statuses,
      categories,
      subSystems,
      delays,
  }
}