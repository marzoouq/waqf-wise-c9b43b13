import { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/ui/useLocalStorage';

export interface SettingsContextType {
  paymentDaysThreshold: number;
  setPaymentDaysThreshold: (days: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (items: number) => void;
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [paymentDaysThreshold, setPaymentDaysThreshold] = useLocalStorage(
    'paymentDaysThreshold',
    90
  );
  
  const [itemsPerPage, setItemsPerPage] = useLocalStorage(
    'itemsPerPage',
    10
  );
  
  const [language, setLanguage] = useLocalStorage<'ar' | 'en'>(
    'language',
    'ar'
  );
  
  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage(
    'notificationsEnabled',
    true
  );

  return (
    <SettingsContext.Provider 
      value={{
        paymentDaysThreshold,
        setPaymentDaysThreshold,
        itemsPerPage,
        setItemsPerPage,
        language,
        setLanguage,
        notificationsEnabled,
        setNotificationsEnabled,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
