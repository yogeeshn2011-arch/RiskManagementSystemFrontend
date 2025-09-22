import { ref, computed, onMounted, watch } from 'vue';
import { useriskManagementSystemStores } from '@/stores/riskManagementSystemStores';
import { storeToRefs } from 'pinia';
import useUtilities  from '@/js/common.js';

/*
* This Composable is used to manage the edit work case functinality.
* It provides the necessary data and methods to handle the editing of work cases displayed in the dashbord table.

* It includeds functionalites such as fetching dropdown data, setting up the edit form with existing data, and 
* updating work cases.
* 
* @author Yogeesh Narasegowda
* @version 1.0
*/
export default function useEditWorkCaseModel(emit) {
  const rmsStores = useriskManagementSystemStores();
  const { selectedDepartment } = storeToRefs(rmsStores);
  const { validateRequiredFields, validateInputFieldMaxLength } = useUtilities(emit);

  // Localized dropdown options for work case statuses
  const statusOptions = computed(() => {
    return Object.entries(rmsStores.workCaseStatuses).map(([key, label]) => ({
      value: key,
      label: label
    }));
  });

  // Localized dropdown options for work case categories
  const categoryOptions = computed(() => {
    return Object.entries(rmsStores.workCaseCategories).map(([key, label]) => ({
      value: key,
      label: label
    }));
  });

  // Localized dropdown options for work case sub-sytems
  const subSystemOptions = computed(() => {
    return Object.entries(rmsStores.workCaseSubsystems).map(([key, label]) => ({
      value: key,
      label: label
    }));
  });

  // Localized dropdown options for work case delay flags
  const delayFlags = computed(() => {
    return Object.entries(rmsStores.workCaseDelays).map(([key, label]) => ({
      value: key,
      label: label
    }));
  });

  const editForm = ref({
    workcaseId: '',
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

  const fetchDropdownData = async () => {
    try {
      rmsStores.fetchWorkCaseStatuses();
      rmsStores.fetchWorkCaseCategories();
      rmsStores.fetchWorkCaseSubSystems();
      rmsStores.fetchWorkCaseDelays();
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  onMounted(() => {
    fetchDropdownData();
  });

  watch(() => rmsStores.selectedRowData, (newVal) => {
    if (newVal) {
      // Set department dropdown display value
      const depTeamKey = `${newVal.departmentName} : ${newVal.teamName}`;
      selectedDepartment.value = depTeamKey;
      editForm.value.workcaseId = newVal.id;

      // Try to find matching project object from departmentHierarchy
      const departmentObj = rmsStores.departmentHierarchy.find(
        dept => dept.departmentName === newVal.departmentName
      );
      
      const teamObj = departmentObj?.departmentTeams.find(
        team => team.teamName === newVal.teamName
      );

      const projectObj = teamObj?.projects.find(
        proj => proj.projectName === newVal.projectName
      );

      // Set the edit form with the selected row data
      editForm.value = {
        ...editForm.value,
        workcaseName: newVal.workCaseName || '',
        departmentName: newVal.departmentName || '',
        teamName: newVal.teamName || '',
        projectName: projectObj || {
          projectId: null,
          projectName: newVal.projectName || ''
        },
        workcaseCategory: newVal.category || '',
        workcaseStatus: newVal.status || '',
        workcaseSubSystem: newVal.subSystem || '',
        delayFlag: newVal.delayFlag || '',
        resourceMigrationDate: newVal.resourceMigrationDate || '',
        businessUseStartDate: newVal.businessUseStartDate || '',
        initialOperationDate: newVal.initialOperationDate || '',
        currentChallenges: newVal.currentChallenges || ''
      };
    }
  }, { immediate: true });


  // Function to update the work case
  const updateWorkcase = async () => {
    try {
      // Trim all string fields in editForm before validation/submission
      Object.keys(editForm.value).forEach(key => {
        if (typeof editForm.value[key] === 'string') {
          editForm.value[key] = editForm.value[key].trim();
        }
      });

      // Define required fields
      const fieldMappings = [
        { key: 'workcaseName', label: 'workCaseNameLabel' },
        { key: 'departmentName', label: 'departmentNameLabel' },
        { key: 'projectName', label: 'projectNameLabel' },
        { key: 'workcaseStatus', label: 'workCaseStatusLabel' }
      ];

      // Validate before sending update
      if (!validateRequiredFields(editForm, fieldMappings)) return;
      if (!validateInputFieldMaxLength(editForm)) return;

      // Extract department and team from selectedDepartment
      const [departmentName, teamName] = selectedDepartment.value.split(' : ');

      // Find department and team objects
      const departmentObj = rmsStores.departmentHierarchy.find(
        (dept) => dept.departmentName === departmentName
      );

      const teamObj = departmentObj?.departmentTeams.find(
        (team) => team.teamName === teamName
      );

      // Compose the form with required object structure
      const formToUpdate = {
        ...editForm.value,
        workcaseId: editForm.value.workcaseId,
        delayFlag: editForm.value.delayFlag,
        departmentName: {
          departmentId: departmentObj.departmentId,
          departmentName: departmentObj.departmentName,
        },
        teamName: {
          teamId: teamObj.teamId,
          teamName: teamObj.teamName,
        },
        projectName: {
          projectId: editForm.value.projectName.projectId,
          projectName: editForm.value.projectName.projectName,
        },
      };

      const result = await rmsStores.updateWorkCase(formToUpdate);
      const rawMessage = Object.entries(result)[0];
      alert(`${rawMessage[0]} : ${rawMessage[1]}`);

      const message = rawMessage[0].toLowerCase();
      const closeTriggers = ['success', '成功'];
      const resetTriggers = ['success', 'failure', '成功', '失敗'];

      if (closeTriggers.includes(message)) {
        emit('close');
        emit('refresh-dashboard');
      }
      if (resetTriggers.includes(message)) {
        rmsStores.resetSelectedDepartment();
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to update work case.');
    }
  };

  return {
    editForm,
    statusOptions,
    categoryOptions,
    subSystemOptions,
    delayFlags,
    selectedDepartment,
    updateWorkcase,
  };
}
