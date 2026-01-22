/**
 * UnifiedKPICard Component Tests
 * اختبارات مكون بطاقة مؤشر الأداء الموحد
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UnifiedKPICard } from '@/components/unified/UnifiedKPICard';
import { Users, DollarSign } from 'lucide-react';

describe('UnifiedKPICard Component', () => {
  it('should render title and numeric value', () => {
    render(
      <UnifiedKPICard 
        title="إجمالي المستفيدين" 
        value={150}
        icon={Users}
      />
    );
    
    expect(screen.getByText('إجمالي المستفيدين')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('should render title and string value', () => {
    render(
      <UnifiedKPICard 
        title="إجمالي الإيرادات" 
        value="1,500,000 ر.س"
        icon={DollarSign}
      />
    );
    
    expect(screen.getByText('إجمالي الإيرادات')).toBeInTheDocument();
    expect(screen.getByText('1,500,000 ر.س')).toBeInTheDocument();
  });

  it('should display subtitle when provided', () => {
    render(
      <UnifiedKPICard 
        title="العدد الإجمالي" 
        value={100}
        subtitle="هذا الشهر"
        icon={Users}
      />
    );
    
    expect(screen.getByText('هذا الشهر')).toBeInTheDocument();
  });

  it('should display icon', () => {
    const { container } = render(
      <UnifiedKPICard 
        title="Test" 
        value={100}
        icon={Users}
      />
    );
    
    // Check for SVG icon
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should show trend indicator with up direction', () => {
    render(
      <UnifiedKPICard 
        title="النمو" 
        value={100}
        icon={Users}
        trend="up"
        trendValue="+12%"
      />
    );
    
    expect(screen.getByText('+12%')).toBeInTheDocument();
  });

  it('should show trend indicator with down direction', () => {
    render(
      <UnifiedKPICard 
        title="الانخفاض" 
        value={100}
        icon={Users}
        trend="down"
        trendValue="-5%"
      />
    );
    
    expect(screen.getByText('-5%')).toBeInTheDocument();
  });

  it('should show trend as string directly', () => {
    render(
      <UnifiedKPICard 
        title="التغيير" 
        value={100}
        icon={Users}
        trend="+15%"
      />
    );
    
    expect(screen.getByText('+15%')).toBeInTheDocument();
  });

  it('should apply primary variant', () => {
    const { container } = render(
      <UnifiedKPICard 
        title="Test" 
        value={100}
        icon={Users}
        variant="primary"
      />
    );
    
    expect(container.firstChild).toHaveClass('border-s-primary');
  });

  it('should apply success variant', () => {
    const { container } = render(
      <UnifiedKPICard 
        title="Test" 
        value={100}
        icon={Users}
        variant="success"
      />
    );
    
    expect(container.firstChild).toHaveClass('border-s-[hsl(var(--chart-2))]');
  });

  it('should apply warning variant', () => {
    const { container } = render(
      <UnifiedKPICard 
        title="Test" 
        value={100}
        icon={Users}
        variant="warning"
      />
    );
    
    expect(container.firstChild).toHaveClass('border-s-[hsl(var(--chart-4))]');
  });

  it('should apply destructive variant', () => {
    const { container } = render(
      <UnifiedKPICard 
        title="Test" 
        value={100}
        icon={Users}
        variant="destructive"
      />
    );
    
    expect(container.firstChild).toHaveClass('border-s-destructive');
  });

  it('should render in compact size', () => {
    const { container } = render(
      <UnifiedKPICard 
        title="Test" 
        value={100}
        icon={Users}
        size="compact"
      />
    );
    
    expect(container.querySelector('.min-h-\\[70px\\]')).toBeInTheDocument();
  });

  it('should render in large size', () => {
    render(
      <UnifiedKPICard 
        title="Test" 
        value={100}
        icon={Users}
        size="large"
      />
    );
    
    // Should render without errors
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should show loading skeleton when loading is true', () => {
    const { container } = render(
      <UnifiedKPICard 
        title="Test" 
        value={100}
        icon={Users}
        loading={true}
      />
    );
    
    // Should render skeleton elements
    const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should handle click events when onClick is provided', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(
      <UnifiedKPICard 
        title="Clickable" 
        value={100}
        icon={Users}
        onClick={handleClick}
      />
    );
    
    const card = screen.getByText('Clickable').closest('div');
    if (card) {
      await user.click(card);
      expect(handleClick).toHaveBeenCalled();
    }
  });

  it('should render ReactNode as value', () => {
    render(
      <UnifiedKPICard 
        title="Custom Value" 
        value={<span data-testid="custom-value">***</span>}
        icon={Users}
      />
    );
    
    expect(screen.getByTestId('custom-value')).toBeInTheDocument();
  });

  it('should apply default variant when not specified', () => {
    const { container } = render(
      <UnifiedKPICard 
        title="Test" 
        value={100}
        icon={Users}
      />
    );
    
    // Should have default styling
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should handle neutral trend', () => {
    render(
      <UnifiedKPICard 
        title="Stable" 
        value={100}
        icon={Users}
        trend="neutral"
        trendValue="0%"
      />
    );
    
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should render without subtitle', () => {
    render(
      <UnifiedKPICard 
        title="Simple Card" 
        value={100}
        icon={Users}
      />
    );
    
    expect(screen.getByText('Simple Card')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('should render without trend', () => {
    render(
      <UnifiedKPICard 
        title="No Trend" 
        value={100}
        icon={Users}
      />
    );
    
    expect(screen.getByText('No Trend')).toBeInTheDocument();
  });
});
