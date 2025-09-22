import { ref, onMounted, nextTick, computed, watch  } from 'vue';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { useriskManagementSystemStores } from '@/stores/riskManagementSystemStores';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import i18n from '@/i18n';

/*
* This module is used to manage the Work Case Dashboard.
* It provides functionality to display, filter, and manage work cases,
* including creating, editing, deleting work cases and adding phase and risk analysis details.
*
* @author Yogeesh Narasegowda
* @version 1.0
*/
export default function useWorkCaseDashboard() {
  const rmsStores = useriskManagementSystemStores();
  const tableContainer = ref(null);
  const workcaseTable = ref(null);
  const { selectedDepartment } = storeToRefs(rmsStores);  
  const selectedProject = ref('');
  const selectedRow = computed({
    get: () => rmsStores.selectedRowData,
    set: (value) => { rmsStores.selectedRowData = value }
  });
  const multiSelectedRows = ref([]);
  const currentModal = ref(null);
  const workCases = ref([]);
  const { locale, t } = useI18n();

  // Computed property to set the project locale based on the language selection 
  const language = computed({
    get: () => rmsStores.language,
    set: (langVal) => {
      rmsStores.language = langVal;
      locale.value = langVal;
      localStorage.setItem('user-locale', langVal); // Store the selected language in local storage
    }
  });

  const showCreateModal = () => (currentModal.value = 'create');
  const showPhaseModal = () => (currentModal.value = 'phase');
  const showRiskModal = () => (currentModal.value = 'risk');
  const showEditModal = () => (currentModal.value = 'edit');

  const isPhaseEnabled = ref(false);
  const isRiskEnabled = ref(false);
  const isEditEnabled = ref(false);
  const isDeleteEnabled = ref(false);
  const currentYear = ref(new Date().getFullYear());

  /**
   * Generates the column definitions for the Tabulator table with translated headers and custom formatting.
   *
   * @param {function} t - Translation function to get localized strings.
   * @returns {Array} Array of column configuration objects for Tabulator.
   */
  function getTranslatedColumns(t) {
    return [
      {
        formatter: "handle",
        headerSort: false,
        frozen: true,
        hozAlign: "center",
      },
      //Checkbox column for multi-row selection with custom cell click behavior
      {
        formatter: function (cell) {
          const rowData = cell.getRow().getData();
          const isSelected = multiSelectedRows.value.some(selectedRowObj => 
            selectedRowObj.getData().id === rowData.id
          );
          return `<input type="checkbox" class="select-row" readonly ${isSelected ? 'checked' : ''} />`;
        },
        hozAlign: "center",
        vertAlign: "middle",
        headerSort: false,
        frozen: true,
        cellClick: function(e, cell) {
          rmsStores.resetSelectedDepartment(); 
          const row = cell.getRow();
          row.toggleSelect();

          const selectedRows = cell.getTable().getSelectedRows();
          const allActiveCases = selectedRows.every(r => r.getData().active === true);
          multiSelectedRows.value = selectedRows;

          if (selectedRows.length === 1 && selectedRows[0].getData().active ===true) {
            enableButtons(selectedRows[0]);
          } else if(selectedRows.length > 1 && allActiveCases) {
            isPhaseEnabled.value = false;
            isRiskEnabled.value = false;
            isEditEnabled.value = false;
            isDeleteEnabled.value = true;
          } else {
            disableButtons();
          }

          // Find the input checkbox in the cell and toggle its checked state manually
          const checkbox = cell.getElement().querySelector('.select-row');
          if (checkbox) {
            checkbox.checked = row.isSelected();
          }
        }
      },
      { 
        title: t('workCaseIdLabel'), 
        field: "id",
        headerTooltip: t('workCaseIdLabel'),  
        minWidth: 50, 
        frozen: true, 
        headerFilter: "input", 
        headerFilterPlaceholder: t('searchLabel') 
      },
      { 
        title: t('projectLabel'), 
        field: "projectName", 
        headerTooltip: t('projectLabel'),
        minWidth: 90, 
        frozen: true, 
        headerFilter: "input", 
        headerFilterPlaceholder: t('searchLabel') 
      },
      { 
        title: t('caseNameLabel'), 
        field: "workCaseName", 
        headerTooltip: t('caseNameLabel'), 
        minWidth: 115, 
        frozen: true, 
        headerFilter: "input", 
        headerFilterPlaceholder: t('searchLabel') 
      },
      {
        title: t('categoryLabel'),
        field: "category",
        headerTooltip: t('categoryLabel'),
        minWidth: 100,
        headerFilter: "input",
        headerFilterPlaceholder: t('searchLabel'),
        formatter: cell => {
          const value = cell.getValue();
          return value ? t(`workcase.category.${value}`) : "";
        },
        headerFilterFunc: (headerValue, rowValue) => {
          if (!headerValue) return true;
          const translated = rowValue ? t(`workcase.category.${rowValue}`) : "";
          // normalize to lowercase for case-insensitive search
          return translated.toLowerCase().includes(headerValue.toLowerCase());
        }
      },
      { 
        title: t('subSystemLabel'), 
        field: "subSystem", 
        headerTooltip: t('subSystemLabel'), 
        minWidth: 120, 
        headerFilter: "input", 
        headerFilterPlaceholder: t('searchLabel'),
        formatter: cell => {
          const value = cell.getValue();
          return value ? t(`workcase.subsystem.${value}`) : "";
        },
        headerFilterFunc: (headerValue, rowValue) => {
          if (!headerValue) return true;

          const translated = rowValue ? t(`workcase.subsystem.${rowValue}`) : "";
          return translated.toLowerCase().includes(headerValue.toLowerCase());
        }
      },
      { 
        title: t('resourceMigrationDateLabel'), 
        field: "resourceMigrationDate", 
        headerTooltip: t('resourceMigrationDateLabel'), 
        minWidth: 100, 
        headerFilter: "input", 
        headerFilterPlaceholder: t('searchLabel') 
      },
      { 
        title: t('initialOperationDateLabel'), 
        field: "initialOperationDate", 
        headerTooltip: t('initialOperationDateLabel'), 
        minWidth: 100, 
        headerFilter: "input", 
        headerFilterPlaceholder: t('searchLabel') 
      },
      { 
        title: t('businessUseStartDateLabel'), 
        field: "businessUseStartDate", 
        headerTooltip: t('businessUseStartDateLabel'), 
        minWidth: 100, 
        headerFilter: "input", 
        headerFilterPlaceholder: t('searchLabel') 
      },
      { 
        title: t('lastUpdatedLabel'), 
        field: "lastUpdatedOn", 
        headerTooltip: t('lastUpdatedLabel'), 
        minWidth: 100, 
        headerFilter: "input", 
        headerFilterPlaceholder: t('searchLabel') 
      },
     { 
        title: t('workCaseStatusLabel'), 
        field: "status", 
        minWidth: 80, 
        headerTooltip: t('workCaseStatusLabel'), 
        headerFilter: "input", 
        headerFilterPlaceholder: t('searchLabel'),
        formatter: cell => {
          const value = cell.getValue();
          return value ? t(`workcase.status.${value}`) : "";
        },
        headerFilterFunc: (headerValue, rowValue) => {
          if (!headerValue) return true;

          const translated = rowValue ? t(`workcase.status.${rowValue}`) : "";
          return translated.toLowerCase().includes(headerValue.toLowerCase());
        }
      },
      { 
        title: t('currentChanllengesLabel'), 
        field: "currentChallenges", 
        headerTooltip: t('currentChanllengesLabel'), 
        minWidth: 200, 
        headerFilter: "input", 
        headerFilterPlaceholder: t('searchLabel') 
      },
      {
        title: t('riskScoreLabel'),
        field: "riskScore",
        headerTooltip: t('riskScoreLabel'),
        minWidth: 110,
        hozAlign: "center",
        vertAlign: "middle",
        headerFilter: "number",
        headerFilterPlaceholder: t('searchLabel')
      },
      /*
      * Previously used PNG as flag indicators, but they lacked visual consistency across platforms.
      * Emojis from https://emojipedia.org/ offer better clarity and native rendering.
      */
      {
        title: t('riskFlagLabel'),
        field: "riskFlag",
        headerTooltip: t('riskFlagLabel'),
        formatter: (cell) => {
          const data = cell.getData();
          const score = data.riskScore;

          if (score >= 5) {
            return `<span title="${i18n.global.t('workcase.riskLevel.high')}">🔴</span>`;
          } else if (score >= 2 && score < 5) {
            return `<span title="${i18n.global.t('workcase.riskLevel.medium')}">🟡</span>`;
          } else {
            return `<span title="${i18n.global.t('workcase.riskLevel.low')}">🟢</span>`;
          }
        },
        sorter: (a, b, aRow, bRow) => {
          // Calculate risk level rank based on score logic
          const getRank = (row) => {
            const score = row.getData().riskScore;
            if (score >= 5) return 3;        // High
            if (score >= 2 && score < 5) return 2; // Medium
            return 1;                       // Low (or missing/0)
          };

          return getRank(aRow) - getRank(bRow);
        },
        minWidth: 80,
        hozAlign: "center",
        vertAlign: "middle",
        headerFilter: "select",
        headerFilterParams: { values: ["🔴", "🔵", "🟢", ""] }
      },
      {
        title: t('delayFlagLabel'),
        field: "delayFlag",
        headerTooltip: t('delayFlagLabel'),
        formatter: (cell) => {
          const status = cell.getValue();
      
          switch (status) {
            case 'ONSCHEDULED':
              return `<span title="${i18n.global.t('workcase.delay.ONSCHEDULED')}">✅</span>`;
            case 'DELAYED':
              return `<span title="${i18n.global.t('workcase.delay.DELAYED')}">⏳</span>`;
            case 'POSTPONED':
              return `<span title="${i18n.global.t('workcase.delay.POSTPONED')}">📅</span>`;
            default:
              return `<span>Unknown</span>`;
          }
        },
         sorter: (a, b) => {
          const rank = {
            'DELAYED': 3,
            'POSTPONED': 2,
            'ONSCHEDULED': 1
          };
          return (rank[a] || 0) - (rank[b] || 0);
        },
        minWidth: 80,
        hozAlign: "center",
        vertAlign: "middle",
        headerFilter: "select",
        headerFilterParams: { values: ["ONSCHEDULED", "DELAYED", "POSTPONED"] }
      },
      {
        title: t('activeFlagLabel'),
        field: "active",
        headerTooltip: t('activeFlagLabel'),
        formatter: "tickCross",
        formatterParams: {
          allowEmpty: false,
          allowTruthy: true
        },
        minWidth: 80,
        hozAlign: "center",
        vertAlign: "middle",
        headerFilter: "select",
        headerFilterParams: {
          values: {
            true: t('workcase.isDeleted.true'),
            false: t('workcase.isDeleted.false'),
            "": ""
          }
        },
        cellMouseOver: (e, cell) => {
          const value = cell.getValue();
          const tooltipText = `${t(value ? 'workcase.isDeleted.true' : 'workcase.isDeleted.false')}`;
          cell.getElement().setAttribute('title', tooltipText);
        },
        cellMouseOut: (e, cell) => {
          cell.getElement().removeAttribute('title');
        }
      }
    ];
  }

  /**
  * Enables or disables action buttons based on the active status of the selected workcase row.
  *
  * @param {Object} row - The selected Tabulator row object.
  */
  function enableButtons(row) {
    const rowData = row.getData();
    selectedRow.value = rowData;

    if (rowData.active) {
      isPhaseEnabled.value = true;
      isRiskEnabled.value = true;
      isEditEnabled.value = true;
      isDeleteEnabled.value = true;
    } else {
      isPhaseEnabled.value = false;
      isRiskEnabled.value = false;
      isEditEnabled.value = false;
      isDeleteEnabled.value = false;
    }
  }

  /**
  * Disables all action buttons related to workcase table operations.
  */
  function disableButtons() {
    isPhaseEnabled.value = false;
    isRiskEnabled.value = false;
    isEditEnabled.value = false;
    isDeleteEnabled.value = false;
  }

  /**
  * Initializes and renders the Tabulator table used to display the list of work cases.
  * Destroys any existing instance before creating a new one.
  */
  function buildTable() {
    if (!tableContainer.value) return;

    if (workcaseTable.value) {
      workcaseTable.value.destroy();
    }

    // Create a new Tabulator table with desired configuration
    workcaseTable.value = new Tabulator(tableContainer.value, {
      data: workCases.value,
      layout: 'fitColumns',
      movableColumns: true,
      movableRows: true,
      selectable: 1,
      sortOrderReverse: true,
      pagination: 'local',
      paginationSize: 20, 
      placeholder: i18n.global.t('noWorkcaseDataAvailable'),
      columns: getTranslatedColumns(t),
    });
  }

  /**
  * Fetches work case data from the store and populates the table.
  * Ensures the DOM updates before initializing the Tabulator instance.
  */
  const loadGridData = async () => {
    const workcaseTableData = await rmsStores.fetchWorkCaseData();
    if (!workcaseTableData || workcaseTableData.length === 0) {
      alert(i18n.global.t('noWorkcaseDataAvailable'));
    }
    workCases.value = workcaseTableData;
    await nextTick();
    buildTable();
  }

  /**
  * Refreshes the work case grid by reloading data, clearing selections,
  * and disabling all action buttons.
  */
  const refreshGrid = async () => {
    loadGridData();
    disableButtons();
    multiSelectedRows.value = [];
  };

  /**
  * Lifecycle hook - Called once when the component is mounted.
  * Initializes the grid with data and resets any department selection.
  */
  onMounted(async () => {
    rmsStores.resetSelectedDepartment();
    loadGridData();
  });

  /**
  * Watcher - Rebuilds the table when the language changes
  * to apply translated column headers and resets UI state.
  */
  watch(language, async () => {
    try {
      rmsStores.resetSelectedDepartment(); 
      await nextTick();
      buildTable();
      disableButtons();
      // Deselect all rows on language change
      multiSelectedRows.value = [];
    } catch (error) {
      console.error("Language change failed:", error);
      alert(`${i18n.global.t('systemMessage')}`);
    }
  });

  /**
  * Filters the work case grid based on the selected department/team and project.
  * Applies both filters conditionally and updates the Tabulator table with the filtered data.
  */
  const filterWorkCaseGrid = () => {
    try {
      if (!workcaseTable.value) return;

      let filterTabulatorData = workCases.value;
      // Apply department + team filter if selected
      if (selectedDepartment.value) {
        const [department, team] = selectedDepartment.value.split(' : ');
        filterTabulatorData = filterTabulatorData.filter(
          (depTeam) => depTeam.departmentName === department && depTeam.teamName === team
        );
      }

      // Apply project filter if selected
      if (selectedProject.value) {
        filterTabulatorData = filterTabulatorData.filter(
          (projectItem) => projectItem.projectName === selectedProject.value.projectName
        );
      }
      workcaseTable.value.setData(filterTabulatorData);
    } catch (error) {
      console.error(`Error filtering work case grid: ${error.message}`);
    }
  };

  /**
  * Logically deletes the user-selected work cases by setting their active flag to false.
  * Prompts the user for confirmation listing the names of the selected cases before deletion.
  * 
  * After successful deletion, refreshes the grid, disables relevant buttons, and clears the selection.
  */
  const deleteCase = async () => {
    if (multiSelectedRows.value && multiSelectedRows.value.length > 0) {
      const idsToDelete = multiSelectedRows.value.map(row => row.getData().id);
      const caseNamesToDelete = multiSelectedRows.value.map(row => row.getData().workCaseName);

      try {
        const userConfirmation = confirm(
          `${i18n.global.t('workcaseDeleteConfirmation')}:\n` +
          caseNamesToDelete.map((name, index) => `${index + 1}. ${name}`).join('\n')
        );

        if(userConfirmation){
          // API call to delete work cases
          const result = await rmsStores.deleteWorkCases(idsToDelete);
          const rawMessage = Object.entries(result)[0];

          // Refresh UI and reset state
          refreshGrid();
          disableButtons();
          multiSelectedRows.value = [];
          alert(`${rawMessage[0]} : ${rawMessage[1]}\n` +
            caseNamesToDelete.map((name, index) => `${index + 1}. ${name}`).join('\n')
          );
        }
      } catch (error) {
        console.error("Failed to delete work cases:", error);
      }
    }
  };

  return {
    language,
    tableContainer,
    selectedProject,
    currentModal,
    loadGridData,
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
  };
}
