/**
 * useBeneficiariesPageState - Hook لإدارة حالة صفحة المستفيدين
 * يجمع جميع useState في hook واحد باستخدام useReducer
 */

import { useReducer, useCallback } from 'react';
import { Beneficiary } from '@/types/beneficiary';
import { SearchCriteria } from '@/components/beneficiary/admin/AdvancedSearchDialog';

// أنواع الـ Dialogs
export type DialogType = 
  | 'form' 
  | 'advancedSearch' 
  | 'attachments' 
  | 'activityLog' 
  | 'enableLogin' 
  | 'tribeManagement';

// حالة الصفحة
export interface BeneficiariesPageState {
  searchQuery: string;
  dialogOpen: boolean;
  advancedSearchOpen: boolean;
  attachmentsDialogOpen: boolean;
  activityLogDialogOpen: boolean;
  enableLoginDialogOpen: boolean;
  tribeManagementDialogOpen: boolean;
  selectedBeneficiary: Beneficiary | null;
  currentPage: number;
  advancedCriteria: SearchCriteria;
}

// أنواع الـ Actions
type Action =
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'OPEN_DIALOG'; payload: DialogType }
  | { type: 'CLOSE_DIALOG'; payload: DialogType }
  | { type: 'SET_SELECTED_BENEFICIARY'; payload: Beneficiary | null }
  | { type: 'SET_CURRENT_PAGE'; payload: number }
  | { type: 'SET_ADVANCED_CRITERIA'; payload: SearchCriteria }
  | { type: 'RESET_DIALOGS' };

// الحالة الأولية
const initialState: BeneficiariesPageState = {
  searchQuery: '',
  dialogOpen: false,
  advancedSearchOpen: false,
  attachmentsDialogOpen: false,
  activityLogDialogOpen: false,
  enableLoginDialogOpen: false,
  tribeManagementDialogOpen: false,
  selectedBeneficiary: null,
  currentPage: 1,
  advancedCriteria: {},
};

// الـ Reducer
function reducer(state: BeneficiariesPageState, action: Action): BeneficiariesPageState {
  switch (action.type) {
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload, currentPage: 1 };
    
    case 'OPEN_DIALOG':
      switch (action.payload) {
        case 'form':
          return { ...state, dialogOpen: true };
        case 'advancedSearch':
          return { ...state, advancedSearchOpen: true };
        case 'attachments':
          return { ...state, attachmentsDialogOpen: true };
        case 'activityLog':
          return { ...state, activityLogDialogOpen: true };
        case 'enableLogin':
          return { ...state, enableLoginDialogOpen: true };
        case 'tribeManagement':
          return { ...state, tribeManagementDialogOpen: true };
        default:
          return state;
      }
    
    case 'CLOSE_DIALOG':
      switch (action.payload) {
        case 'form':
          return { ...state, dialogOpen: false };
        case 'advancedSearch':
          return { ...state, advancedSearchOpen: false };
        case 'attachments':
          return { ...state, attachmentsDialogOpen: false };
        case 'activityLog':
          return { ...state, activityLogDialogOpen: false };
        case 'enableLogin':
          return { ...state, enableLoginDialogOpen: false };
        case 'tribeManagement':
          return { ...state, tribeManagementDialogOpen: false };
        default:
          return state;
      }
    
    case 'SET_SELECTED_BENEFICIARY':
      return { ...state, selectedBeneficiary: action.payload };
    
    case 'SET_CURRENT_PAGE':
      return { ...state, currentPage: action.payload };
    
    case 'SET_ADVANCED_CRITERIA':
      return { ...state, advancedCriteria: action.payload, currentPage: 1 };
    
    case 'RESET_DIALOGS':
      return {
        ...state,
        dialogOpen: false,
        advancedSearchOpen: false,
        attachmentsDialogOpen: false,
        activityLogDialogOpen: false,
        enableLoginDialogOpen: false,
        tribeManagementDialogOpen: false,
      };
    
    default:
      return state;
  }
}

// الـ Hook
export function useBeneficiariesPageState() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Actions
  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  }, []);

  const openDialog = useCallback((type: DialogType) => {
    dispatch({ type: 'OPEN_DIALOG', payload: type });
  }, []);

  const closeDialog = useCallback((type: DialogType) => {
    dispatch({ type: 'CLOSE_DIALOG', payload: type });
  }, []);

  const setDialogOpen = useCallback((open: boolean) => {
    dispatch({ type: open ? 'OPEN_DIALOG' : 'CLOSE_DIALOG', payload: 'form' });
  }, []);

  const setAdvancedSearchOpen = useCallback((open: boolean) => {
    dispatch({ type: open ? 'OPEN_DIALOG' : 'CLOSE_DIALOG', payload: 'advancedSearch' });
  }, []);

  const setAttachmentsDialogOpen = useCallback((open: boolean) => {
    dispatch({ type: open ? 'OPEN_DIALOG' : 'CLOSE_DIALOG', payload: 'attachments' });
  }, []);

  const setActivityLogDialogOpen = useCallback((open: boolean) => {
    dispatch({ type: open ? 'OPEN_DIALOG' : 'CLOSE_DIALOG', payload: 'activityLog' });
  }, []);

  const setEnableLoginDialogOpen = useCallback((open: boolean) => {
    dispatch({ type: open ? 'OPEN_DIALOG' : 'CLOSE_DIALOG', payload: 'enableLogin' });
  }, []);

  const setTribeManagementDialogOpen = useCallback((open: boolean) => {
    dispatch({ type: open ? 'OPEN_DIALOG' : 'CLOSE_DIALOG', payload: 'tribeManagement' });
  }, []);

  const setSelectedBeneficiary = useCallback((beneficiary: Beneficiary | null) => {
    dispatch({ type: 'SET_SELECTED_BENEFICIARY', payload: beneficiary });
  }, []);

  const setCurrentPage = useCallback((page: number) => {
    dispatch({ type: 'SET_CURRENT_PAGE', payload: page });
  }, []);

  const setAdvancedCriteria = useCallback((criteria: SearchCriteria) => {
    dispatch({ type: 'SET_ADVANCED_CRITERIA', payload: criteria });
  }, []);

  const resetDialogs = useCallback(() => {
    dispatch({ type: 'RESET_DIALOGS' });
  }, []);

  return {
    // State
    ...state,
    
    // Actions (للتوافق مع الكود القديم)
    setSearchQuery,
    setDialogOpen,
    setAdvancedSearchOpen,
    setAttachmentsDialogOpen,
    setActivityLogDialogOpen,
    setEnableLoginDialogOpen,
    setTribeManagementDialogOpen,
    setSelectedBeneficiary,
    setCurrentPage,
    setAdvancedCriteria,
    
    // Actions جديدة
    openDialog,
    closeDialog,
    resetDialogs,
  };
}
