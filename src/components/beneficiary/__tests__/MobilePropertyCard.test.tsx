/**
 * MobilePropertyCard Component Tests
 * اختبارات مكون بطاقة العقار (الجوال)
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MobilePropertyCard } from '../cards/MobilePropertyCard';

describe('MobilePropertyCard Component', () => {
  const mockProperty = {
    id: '456',
    name: 'عقار الخالدية',
    type: 'سكني',
    location: 'الرياض، حي الخالدية',
    status: 'مؤجر',
  };

  it('should render property name', () => {
    render(<MobilePropertyCard property={mockProperty} />);
    expect(screen.getByText('عقار الخالدية')).toBeInTheDocument();
  });

  it('should display property type badge', () => {
    render(<MobilePropertyCard property={mockProperty} />);
    expect(screen.getByText('سكني')).toBeInTheDocument();
  });

  it('should display location', () => {
    render(<MobilePropertyCard property={mockProperty} />);
    expect(screen.getByText(/الرياض، حي الخالدية/)).toBeInTheDocument();
  });

  it('should show status badge when provided', () => {
    render(<MobilePropertyCard property={mockProperty} />);
    expect(screen.getByText('مؤجر')).toBeInTheDocument();
  });

  it('should display property icon', () => {
    const { container } = render(<MobilePropertyCard property={mockProperty} />);
    // Check for Building2 icon
    expect(container.querySelector('svg.lucide-building-2')).toBeInTheDocument();
  });

  it('should display location icon', () => {
    const { container } = render(<MobilePropertyCard property={mockProperty} />);
    // Check for MapPin icon
    expect(container.querySelector('svg.lucide-map-pin')).toBeInTheDocument();
  });

  it('should display different property types', () => {
    const { rerender } = render(
      <MobilePropertyCard property={{ ...mockProperty, type: 'تجاري' }} />
    );
    expect(screen.getByText('تجاري')).toBeInTheDocument();

    rerender(
      <MobilePropertyCard property={{ ...mockProperty, type: 'زراعي' }} />
    );
    expect(screen.getByText('زراعي')).toBeInTheDocument();
  });

  it('should render without property type', () => {
    const propertyWithoutType = { ...mockProperty, type: undefined };
    render(<MobilePropertyCard property={propertyWithoutType} />);
    
    // Should still render the property name
    expect(screen.getByText('عقار الخالدية')).toBeInTheDocument();
  });

  it('should render without status', () => {
    const propertyWithoutStatus = { ...mockProperty, status: undefined };
    render(<MobilePropertyCard property={propertyWithoutStatus} />);
    
    // Should still render the property name and location
    expect(screen.getByText('عقار الخالدية')).toBeInTheDocument();
    expect(screen.getByText(/الرياض/)).toBeInTheDocument();
  });

  it('should apply hover effect class', () => {
    const { container } = render(<MobilePropertyCard property={mockProperty} />);
    const card = container.firstChild;
    expect(card).toHaveClass('hover:shadow-md');
  });

  it('should show proper badge variant for سكني type', () => {
    const { container } = render(
      <MobilePropertyCard property={{ ...mockProperty, type: 'سكني' }} />
    );
    // Badge should be present
    expect(screen.getByText('سكني')).toBeInTheDocument();
  });

  it('should show proper badge variant for تجاري type', () => {
    const { container } = render(
      <MobilePropertyCard property={{ ...mockProperty, type: 'تجاري' }} />
    );
    // Badge should be present
    expect(screen.getByText('تجاري')).toBeInTheDocument();
  });

  it('should show proper badge variant for زراعي type', () => {
    const { container } = render(
      <MobilePropertyCard property={{ ...mockProperty, type: 'زراعي' }} />
    );
    // Badge should be present  
    expect(screen.getByText('زراعي')).toBeInTheDocument();
  });
});
