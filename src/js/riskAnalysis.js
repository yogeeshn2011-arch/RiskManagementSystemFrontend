import { ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useriskManagementSystemStores } from '@/stores/riskManagementSystemStores';
import { RISK_ITEMS } from '@/js/constants/riskValues.js';
import i18n from '@/i18n';

/*
* This composable is used to manage the risk analysis details of the work case.
* It provides the necessary data and methods to handle the risk analysis functionality.
* It includes functionalities such as fetching predefined risk items, adding new risk items for a work case.
*
* @author Yogeesh Narasegowda
* @verion 1.0
*/
export default function useRiskAnalysisModal(emit) {
  const rmsStores = useriskManagementSystemStores();
  const { t } = useI18n();
  const selectedRowData = rmsStores.selectedRowData;

  const workcaseName = ref('');
  const riskItems = ref([]);
  const remarks = ref('');

  // Function to build risk items from predefined constants
  const buildRiskItems = () => {
    riskItems.value = RISK_ITEMS.map(({ key, value }) => ({
      key,
      header: t(`riskHeaders.${key}`),
      value,
      selected: false
    }));
  };

  // Initialize risk items when the component is loaded
  onMounted(async () => {
    workcaseName.value = selectedRowData?.workCaseName || '';
    buildRiskItems();

    const riskData = await rmsStores.fetchRiskDetails(selectedRowData.id);
    remarks.value = riskData.remarks || '';

    riskData.selectedRisks.forEach(({ riskName }) => {
      const match = riskItems.value.find(item => item.key === riskName);
      if (match) match.selected = true;
    });
  });

  // Watch for changes in the selected row data to update the work case name
  watch(() => selectedRowData?.workCaseName, (newVal) => {
    workcaseName.value = newVal || '';
  });

  // Function to save the risk analysis details including selected risks with their scores and remarks
  const save = async () => {
    // Trim remarks before validation and saving
    if (typeof remarks.value === 'string') {
      remarks.value = remarks.value.trim();
    }

    // Validation: check if no risk items selected and remarks empty
    const noRisksSelected = !riskItems.value.some(item => item.selected);
    const isRemarksEmpty = !remarks.value;

    if (noRisksSelected && isRemarksEmpty) {
      alert(i18n.global.t('emptyFieldCheck'));
      return;
    }

    const selectedData = riskItems.value
      .filter(item => item.selected)
      .map(({ key, value }) => ({ riskName: key, riskValue: value }));

    const dataToSave = {
      workCaseId: selectedRowData.id,
      remarks: remarks.value,
      selectedRisks: selectedData
    };

    // Validate comments length
    if(remarks.value.length >500){
      alert(i18n.global.t('commentsLengthError'));
      return;
    }

    try {
      // Call the store method to add or update risk details
      // If there is an existing risk details, it will update it; otherwise, it will create a new one
      const result = await rmsStores.addOrUpdateRiskDetails(dataToSave);
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
      alert(i18n.global.t('workriskCreationError'));
    }
  };


  return {
    workcaseName,
    riskItems,
    remarks,
    save
  };
}
