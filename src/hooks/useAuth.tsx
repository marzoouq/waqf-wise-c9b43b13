import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

/**
 * Hook للوصول إلى معلومات المصادقة
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
}
