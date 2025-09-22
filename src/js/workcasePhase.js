import { reactive, ref, onMounted, watch, computed, onBeforeUnmount } from 'vue';
import { useriskManagementSystemStores } from '@/stores/riskManagementSystemStores';
import { storeToRefs } from 'pinia';
import i18n from '@/i18n';

/*
* This composable is used to manage the work case phases details.
* It provides necessary data and methods to handle the work case phases functionality.
*
* It includes functionalities such as fetching work case phases, saving phase details like,
* approvers, approval status, and comments for each phase of the work case.
*
* @author Yogeesh Narasegowda
* @version 1.0
*/
export default function useWorkPhaseModal(emit) {
    const stores = useriskManagementSystemStores();
    const { language, selectedRowData } = storeToRefs(stores);
    const workcaseName = ref('');

    const phases = ref([
        { key: 'design',     label: 'Design_Process' },
        { key: 'test',       label: 'Test_Procedure' },
        { key: 'production', label: 'Production_Procedure' },
        { key: 'approval',   label: 'Production_Approval' },
        { key: 'others',     label: 'Others' },
    ]);

    const selectedApprovers        = reactive({});
    const selectedApprovalStatus   = reactive({});
    const comments                 = reactive({});
    const dropdownOpen             = reactive({});

    const approvers = computed(() => stores.workPhaseApprovers);
    const approvalStatuses = computed(() => stores.workPhaseApproveStatuses);

    // Used to handle the dropdown toggle state
    const toggleDropdown = (phaseKey) => {
        const isAlreadyOpen = dropdownOpen[phaseKey];
        // Close all
        for (const key in dropdownOpen) {
            dropdownOpen[key] = false;
        }
        // Toggle the clicked one
        dropdownOpen[phaseKey] = !isAlreadyOpen;
    };

    // Handle clicks outside the dropdown to close it
    const handleClickOutsideApproverDropdown = (event) => {
        const dropdowns = document.querySelectorAll('.custom-approver-multiselect');
        let clickedInside = false;

        dropdowns.forEach((dropdown) => {
          if (dropdown.contains(event.target)) {
              clickedInside = true;
          }
        });

        if (!clickedInside) {
          for (const key in dropdownOpen) {
              dropdownOpen[key] = false;
          }
        }
    };

    const fetchWorkPhaseData = () => {
        stores.fetchWorkPhaseApprovers();
        stores.fetchWorkPhaseApproveStatuses();
    };

    onMounted(async () => {
        fetchWorkPhaseData();
        document.addEventListener('click', handleClickOutsideApproverDropdown);
        workcaseName.value = selectedRowData.value?.workCaseName || '';
        
         // Initialize empty defaults
        phases.value.forEach((phase) => {
            selectedApprovers[phase.key] = [];
            selectedApprovalStatus[phase.key] = '';
            comments[phase.key] = '';
            dropdownOpen[phase.key] = false;
        });

        // Fetch existing data for this workcase
        const existingPhaseData = await stores.fetchWorkCasePhaseDetails(selectedRowData.value?.id);

        // Populate the selected work phase details based on existing data
        existingPhaseData.forEach(phaseEntry => {
            const key = getPhaseKeyByLabel(phaseEntry.phaseName);
            if (key) {
            selectedApprovers[key] = phaseEntry.approvers
            .map(a => a.approverName).filter(Boolean);
            selectedApprovalStatus[key] = phaseEntry.approveStatus || '';
            comments[key] = phaseEntry.approverComment || '';
            }
        });

        // Automatically remove approve status if all the approvers are removed during update
        phases.value.forEach(({ key }) => {
          watch(
            () => selectedApprovers[key],
            (newApprovers) => {
              if (!newApprovers || newApprovers.length === 0) {
                selectedApprovalStatus[key] = '';
              }
            },
            { deep: true }
          );
        });
    });

    onBeforeUnmount(() => {
        document.removeEventListener('click', handleClickOutsideApproverDropdown);
    });

    watch(language, () => {
        fetchWorkPhaseData();
        workcaseName.value = selectedRowData.value?.workCaseName || '';
    });

    function getPhaseKeyByLabel(label) {
        const phase = phases.value.find(p => p.label === label);
        return phase?.key || null;
    }

    /*
    * Function to save the work phase details
    * It included phase details like approvers, approve status & comment for each phase of a given work case.
    */
    const save = async () => {
      try {

        // Trim whitespace for all comments before validation
        phases.value.forEach(({ key }) => {
          if (typeof comments[key] === 'string') {
            comments[key] = comments[key].trim();
          }
        });

        // Check if all fields across all phases are empty
        const isAllEmpty = phases.value.every(({ key }) => {
          return (
              (selectedApprovers[key]?.length === 0 || !selectedApprovers[key]) &&
              !selectedApprovalStatus[key] &&
              !comments[key]
          );
        });

        if (isAllEmpty) {
          alert(i18n.global.t('emptyFieldCheck'));
          return;
        }

        // Validate comment lengths before saving
        for (const { key } of phases.value) {
          const comment = comments[key];
          if (comment && (comment.length > 500)) {
            alert(i18n.global.t('commentsLengthError'));
            return;
          }
        }

        // Validate that if approver(s) has selected, an approve status is also selected
        for (const { key, label } of phases.value) {
          const approversSelected = selectedApprovers[key]?.length > 0;
          const statusSelected = !!selectedApprovalStatus[key];

          if (approversSelected && !statusSelected) {
            alert(i18n.global.t('approveStatusRequiredForPhase', { phase: i18n.global.t(label) }));
            return;
          }
        }

        const dataToSave = phases.value.map(({ key, label }) => ({
          workcaseId : selectedRowData.value?.id || '',
          phase: label,
            approvers: selectedApprovers[key] || [],
            status: selectedApprovalStatus[key] || '',
            comment: comments[key] || '',
        }));

        const result = await stores.addorUpdateWorkPhases(dataToSave);
        const rawMessage = Object.entries(result)[0];
        alert(`${rawMessage[0]} : ${rawMessage[1]}`);
    
        const message = rawMessage[0].toLowerCase();
        const closeTriggers = ['success', '成功'];

        // Automatically close the form if the create is success
        if (closeTriggers.includes(message)) {
          emit('close');
          emit('refresh-dashboard');
        }
      } catch (error) {
        console.error(error);
        alert(i18n.global.t('workphaseCreationError'));
      }
    };

    return {
        workcaseName,
        phases,
        selectedApprovers,
        selectedApprovalStatus,
        comments,
        dropdownOpen,
        approvers,
        approvalStatuses,
        toggleDropdown,
        save,
    };
}
