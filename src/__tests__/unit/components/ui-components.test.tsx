/**
 * اختبارات مكونات الواجهة الأساسية
 * Core UI Components Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import React from 'react';

describe('UI Components', () => {
  describe('Button Component', () => {
    it('should render button with text', () => {
      render(<Button>اختبار</Button>);
      expect(screen.getByRole('button')).toHaveTextContent('اختبار');
    });

    it('should render button with different variants', () => {
      const { rerender } = render(<Button variant="default">Default</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();

      rerender(<Button variant="destructive">Destructive</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();

      rerender(<Button variant="outline">Outline</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should render disabled button', () => {
      render(<Button disabled>معطل</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should render button with different sizes', () => {
      const { rerender } = render(<Button size="sm">صغير</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();

      rerender(<Button size="lg">كبير</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Card Component', () => {
    it('should render card with content', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>عنوان البطاقة</CardTitle>
          </CardHeader>
          <CardContent>محتوى البطاقة</CardContent>
        </Card>
      );

      expect(screen.getByText('عنوان البطاقة')).toBeInTheDocument();
      expect(screen.getByText('محتوى البطاقة')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<Card className="custom-class">Content</Card>);
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });

  describe('Badge Component', () => {
    it('should render badge with text', () => {
      render(<Badge>نشط</Badge>);
      expect(screen.getByText('نشط')).toBeInTheDocument();
    });

    it('should render badge with different variants', () => {
      const { rerender } = render(<Badge variant="default">Default</Badge>);
      expect(screen.getByText('Default')).toBeInTheDocument();

      rerender(<Badge variant="secondary">Secondary</Badge>);
      expect(screen.getByText('Secondary')).toBeInTheDocument();

      rerender(<Badge variant="destructive">Destructive</Badge>);
      expect(screen.getByText('Destructive')).toBeInTheDocument();
    });
  });

  describe('Input Component', () => {
    it('should render input element', () => {
      render(<Input placeholder="أدخل النص" />);
      expect(screen.getByPlaceholderText('أدخل النص')).toBeInTheDocument();
    });

    it('should render disabled input', () => {
      render(<Input disabled placeholder="معطل" />);
      expect(screen.getByPlaceholderText('معطل')).toBeDisabled();
    });

    it('should render input with type', () => {
      render(<Input type="email" placeholder="البريد الإلكتروني" />);
      const input = screen.getByPlaceholderText('البريد الإلكتروني');
      expect(input).toHaveAttribute('type', 'email');
    });
  });
});
