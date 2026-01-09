/**
 * EmptyState Component Tests - Comprehensive Functional Tests
 * اختبارات وظيفية شاملة لمكون الحالة الفارغة
 * @version 2.0.0
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { EmptyState } from '@/components/shared/EmptyState';
import { FileX, Users, Building2, DollarSign, AlertCircle } from 'lucide-react';

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('EmptyState Component', () => {
  describe('Module Import', () => {
    it('should import EmptyState component', async () => {
      const module = await import('@/components/shared/EmptyState');
      expect(module.EmptyState).toBeDefined();
    });

    it('should be a valid React component', async () => {
      const { EmptyState } = await import('@/components/shared/EmptyState');
      expect(typeof EmptyState).toBe('function');
    });
  });

  describe('Basic Rendering', () => {
    it('should render with all required props', () => {
      renderWithRouter(
        <EmptyState 
          title="لا توجد بيانات" 
          description="أضف بيانات جديدة للبدء"
          icon={FileX}
        />
      );
      expect(screen.getByText('لا توجد بيانات')).toBeInTheDocument();
      expect(screen.getByText('أضف بيانات جديدة للبدء')).toBeInTheDocument();
    });

    it('should render beneficiaries empty state', () => {
      renderWithRouter(
        <EmptyState 
          title="لا يوجد مستفيدين"
          description="لم يتم إضافة أي مستفيدين بعد"
          icon={Users}
          actionLabel="إضافة مستفيد"
          onAction={vi.fn()}
        />
      );
      
      expect(screen.getByText('لا يوجد مستفيدين')).toBeInTheDocument();
      expect(screen.getByText('إضافة مستفيد')).toBeInTheDocument();
    });

    it('should render properties empty state', () => {
      renderWithRouter(
        <EmptyState 
          title="لا توجد عقارات"
          description="أضف عقارات للبدء في إدارة الوقف"
          icon={Building2}
          actionLabel="إضافة عقار"
          onAction={vi.fn()}
        />
      );
      
      expect(screen.getByText('لا توجد عقارات')).toBeInTheDocument();
    });

    it('should render payments empty state', () => {
      renderWithRouter(
        <EmptyState 
          title="لا توجد مدفوعات"
          description="لم يتم تسجيل أي مدفوعات حتى الآن"
          icon={DollarSign}
        />
      );
      
      expect(screen.getByText('لا توجد مدفوعات')).toBeInTheDocument();
    });

    it('should render error empty state', () => {
      renderWithRouter(
        <EmptyState 
          title="حدث خطأ"
          description="لم نتمكن من تحميل البيانات"
          icon={AlertCircle}
          actionLabel="إعادة المحاولة"
          onAction={vi.fn()}
        />
      );
      
      expect(screen.getByText('حدث خطأ')).toBeInTheDocument();
      expect(screen.getByText('إعادة المحاولة')).toBeInTheDocument();
    });
  });

  describe('Action Button', () => {
    it('should call onAction when button is clicked', () => {
      const mockAction = vi.fn();
      renderWithRouter(
        <EmptyState 
          title="لا توجد بيانات" 
          description="أضف بيانات جديدة"
          icon={FileX}
          actionLabel="إضافة جديد"
          onAction={mockAction}
        />
      );
      
      const button = screen.getByText('إضافة جديد');
      fireEvent.click(button);
      
      expect(mockAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should be accessible for screen readers', () => {
      renderWithRouter(
        <EmptyState 
          title="لا توجد بيانات" 
          description="الوصف هنا"
          icon={FileX}
        />
      );
      
      expect(screen.getByText('لا توجد بيانات')).toBeVisible();
      expect(screen.getByText('الوصف هنا')).toBeVisible();
    });
  });

  describe('RTL Support', () => {
    it('should handle Arabic text properly', () => {
      renderWithRouter(
        <EmptyState 
          title="لا يوجد مستفيدين مسجلين"
          description="قم بإضافة مستفيد جديد من خلال الضغط على الزر أدناه"
          icon={Users}
        />
      );
      
      expect(screen.getByText('لا يوجد مستفيدين مسجلين')).toBeInTheDocument();
    });
  });
});
