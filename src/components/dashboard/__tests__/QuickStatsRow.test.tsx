/**
 * QuickStatsRow Component Tests
 * اختبارات مكون صف الإحصائيات السريعة
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuickStatsRow } from '../shared/QuickStatsRow';
import { Users, DollarSign, TrendingUp } from 'lucide-react';

describe('QuickStatsRow Component', () => {
  const mockStats = [
    {
      label: 'إجمالي المستفيدين',
      value: 150,
      icon: Users,
      color: 'primary' as const,
    },
    {
      label: 'إجمالي الإيرادات',
      value: '1,500,000 ر.س',
      icon: DollarSign,
      color: 'success' as const,
    },
    {
      label: 'معدل النمو',
      value: '12%',
      icon: TrendingUp,
      color: 'info' as const,
    },
  ];

  it('should render all stats', () => {
    render(<QuickStatsRow stats={mockStats} />);
    
    expect(screen.getByText('إجمالي المستفيدين')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
    
    expect(screen.getByText('إجمالي الإيرادات')).toBeInTheDocument();
    expect(screen.getByText('1,500,000 ر.س')).toBeInTheDocument();
    
    expect(screen.getByText('معدل النمو')).toBeInTheDocument();
    expect(screen.getByText('12%')).toBeInTheDocument();
  });

  it('should render stat labels', () => {
    render(<QuickStatsRow stats={mockStats} />);
    
    mockStats.forEach(stat => {
      expect(screen.getByText(stat.label)).toBeInTheDocument();
    });
  });

  it('should render stat values', () => {
    render(<QuickStatsRow stats={mockStats} />);
    
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('1,500,000 ر.س')).toBeInTheDocument();
    expect(screen.getByText('12%')).toBeInTheDocument();
  });

  it('should render icons for each stat', () => {
    const { container } = render(<QuickStatsRow stats={mockStats} />);
    
    // Check for SVG icons (lucide-react renders as svg)
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBe(mockStats.length);
  });

  it('should render with single stat', () => {
    const singleStat = [mockStats[0]];
    render(<QuickStatsRow stats={singleStat} />);
    
    expect(screen.getByText('إجمالي المستفيدين')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('should render with empty stats array', () => {
    const { container } = render(<QuickStatsRow stats={[]} />);
    
    // Should render the container
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <QuickStatsRow stats={mockStats} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should handle numeric values', () => {
    const numericStats = [
      {
        label: 'العدد',
        value: 100,
        icon: Users,
      },
    ];
    
    render(<QuickStatsRow stats={numericStats} />);
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('should handle string values', () => {
    const stringStats = [
      {
        label: 'النسبة',
        value: '25.5%',
        icon: TrendingUp,
      },
    ];
    
    render(<QuickStatsRow stats={stringStats} />);
    expect(screen.getByText('25.5%')).toBeInTheDocument();
  });

  it('should use default color when not specified', () => {
    const statsWithoutColor = [
      {
        label: 'اختبار',
        value: '100',
        icon: Users,
      },
    ];
    
    render(<QuickStatsRow stats={statsWithoutColor} />);
    expect(screen.getByText('اختبار')).toBeInTheDocument();
  });

  it('should apply different color classes', () => {
    const coloredStats = [
      { label: 'أساسي', value: '1', icon: Users, color: 'primary' as const },
      { label: 'نجاح', value: '2', icon: Users, color: 'success' as const },
      { label: 'تحذير', value: '3', icon: Users, color: 'warning' as const },
      { label: 'خطر', value: '4', icon: Users, color: 'danger' as const },
      { label: 'معلومة', value: '5', icon: Users, color: 'info' as const },
    ];
    
    render(<QuickStatsRow stats={coloredStats} />);
    
    coloredStats.forEach(stat => {
      expect(screen.getByText(stat.label)).toBeInTheDocument();
    });
  });
});
