/**
 * BeneficiaryMobileCard Component Tests
 * اختبارات مكون بطاقة المستفيد (الجوال)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BeneficiaryMobileCard } from '../admin/list/BeneficiaryMobileCard';
import { Beneficiary } from '@/types/beneficiary';

describe('BeneficiaryMobileCard Component', () => {
  const mockBeneficiary: Beneficiary = {
    id: '123',
    full_name: 'محمد أحمد',
    national_id: '1234567890',
    phone: '0501234567',
    status: 'نشط',
    category: 'فئة أولى',
    beneficiary_number: 'BEN-001',
    email: 'test@example.com',
    date_of_birth: '1990-01-01',
    gender: 'ذكر',
    marital_status: 'متزوج',
    address: 'الرياض',
    city: 'الرياض',
    can_login: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  };

  const mockHandlers = {
    onViewProfile: vi.fn(),
    onEdit: vi.fn(),
    onViewAttachments: vi.fn(),
    onViewActivity: vi.fn(),
    onEnableLogin: vi.fn(),
    onDelete: vi.fn(),
  };

  it('should render beneficiary name correctly', () => {
    render(<BeneficiaryMobileCard beneficiary={mockBeneficiary} {...mockHandlers} />);
    expect(screen.getByText('محمد أحمد')).toBeInTheDocument();
  });

  it('should display status badge', () => {
    render(<BeneficiaryMobileCard beneficiary={mockBeneficiary} {...mockHandlers} />);
    expect(screen.getByText('نشط')).toBeInTheDocument();
  });

  it('should display beneficiary number', () => {
    render(<BeneficiaryMobileCard beneficiary={mockBeneficiary} {...mockHandlers} />);
    expect(screen.getByText('BEN-001')).toBeInTheDocument();
  });

  it('should display national ID', () => {
    render(<BeneficiaryMobileCard beneficiary={mockBeneficiary} {...mockHandlers} />);
    expect(screen.getByText(/1234567890/)).toBeInTheDocument();
  });

  it('should display phone number', () => {
    render(<BeneficiaryMobileCard beneficiary={mockBeneficiary} {...mockHandlers} />);
    expect(screen.getByText(/0501234567/)).toBeInTheDocument();
  });

  it('should display category badge', () => {
    render(<BeneficiaryMobileCard beneficiary={mockBeneficiary} {...mockHandlers} />);
    expect(screen.getByText('فئة أولى')).toBeInTheDocument();
  });

  it('should show login key icon when can_login is true', () => {
    const { container } = render(
      <BeneficiaryMobileCard beneficiary={mockBeneficiary} {...mockHandlers} />
    );
    // Look for the Key icon (lucide-react renders as svg)
    const keyIcon = container.querySelector('svg.lucide-key');
    expect(keyIcon).toBeInTheDocument();
  });

  it('should not show login key icon when can_login is false', () => {
    const beneficiaryWithoutLogin = { ...mockBeneficiary, can_login: false };
    const { container } = render(
      <BeneficiaryMobileCard beneficiary={beneficiaryWithoutLogin} {...mockHandlers} />
    );
    const keyIcon = container.querySelector('svg.lucide-key');
    expect(keyIcon).not.toBeInTheDocument();
  });

  it('should handle click event on card', async () => {
    const user = userEvent.setup();
    render(<BeneficiaryMobileCard beneficiary={mockBeneficiary} {...mockHandlers} />);
    
    // Click on the card area (not the dropdown menu)
    const cardButton = screen.getByRole('button', { name: /محمد أحمد/i }) || 
                       screen.getAllByRole('button')[0];
    await user.click(cardButton);
    
    expect(mockHandlers.onViewProfile).toHaveBeenCalledWith(mockBeneficiary);
  });

  it('should show "قيد الإنشاء" when no beneficiary number', () => {
    const beneficiaryWithoutNumber = { ...mockBeneficiary, beneficiary_number: undefined };
    render(<BeneficiaryMobileCard beneficiary={beneficiaryWithoutNumber} {...mockHandlers} />);
    expect(screen.getByText('قيد الإنشاء')).toBeInTheDocument();
  });

  it('should display different status variants correctly', () => {
    const { rerender } = render(
      <BeneficiaryMobileCard 
        beneficiary={{ ...mockBeneficiary, status: 'موقوف' }} 
        {...mockHandlers}
      />
    );
    expect(screen.getByText('موقوف')).toBeInTheDocument();

    rerender(
      <BeneficiaryMobileCard 
        beneficiary={{ ...mockBeneficiary, status: 'متوفي' }} 
        {...mockHandlers}
      />
    );
    expect(screen.getByText('متوفي')).toBeInTheDocument();
  });

  it('should render without phone number', () => {
    const beneficiaryWithoutPhone = { ...mockBeneficiary, phone: undefined };
    render(<BeneficiaryMobileCard beneficiary={beneficiaryWithoutPhone} {...mockHandlers} />);
    
    // Should still render the card
    expect(screen.getByText('محمد أحمد')).toBeInTheDocument();
  });

  it('should render without national ID', () => {
    const beneficiaryWithoutID = { ...mockBeneficiary, national_id: undefined };
    render(<BeneficiaryMobileCard beneficiary={beneficiaryWithoutID} {...mockHandlers} />);
    
    // Should still render the card
    expect(screen.getByText('محمد أحمد')).toBeInTheDocument();
  });
});
