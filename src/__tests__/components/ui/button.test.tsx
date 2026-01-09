/**
 * Button Component Tests - Comprehensive Functional Tests
 * اختبارات وظيفية شاملة لمكون الزر
 * @version 2.0.0
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Trash2, Edit, Save, Download } from 'lucide-react';

describe('Button Component', () => {
  describe('Basic Rendering', () => {
    it('should render button with text', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button')).toHaveTextContent('Click me');
    });

    it('should render Arabic text correctly', () => {
      render(<Button>انقر هنا</Button>);
      expect(screen.getByRole('button')).toHaveTextContent('انقر هنا');
    });

    it('should render with children elements', () => {
      render(
        <Button>
          <Plus className="h-4 w-4" />
          <span>إضافة</span>
        </Button>
      );
      expect(screen.getByText('إضافة')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should apply default variant', () => {
      render(<Button>Default</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary');
    });

    it('should apply destructive variant', () => {
      render(<Button variant="destructive">Delete</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-destructive');
    });

    it('should apply outline variant', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border');
    });

    it('should apply secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-secondary');
    });

    it('should apply ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:bg-accent');
    });

    it('should apply link variant', () => {
      render(<Button variant="link">Link</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-primary');
    });
  });

  describe('Sizes', () => {
    it('should apply default size', () => {
      render(<Button>Default</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-10');
    });

    it('should apply small size', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-9');
    });

    it('should apply large size', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-11');
    });

    it('should apply icon size', () => {
      render(<Button size="icon"><Plus /></Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-10', 'w-10');
    });
  });

  describe('States', () => {
    it('should be disabled when prop is set', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should not trigger onClick when disabled', async () => {
      const handleClick = vi.fn();
      render(<Button disabled onClick={handleClick}>Disabled</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should show loading state', () => {
      render(
        <Button disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          جاري الحفظ...
        </Button>
      );
      
      expect(screen.getByText('جاري الحفظ...')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Click Handling', () => {
    it('should call onClick when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(<Button onClick={handleClick}>Click</Button>);
      await user.click(screen.getByRole('button'));
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should pass event to onClick handler', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(<Button onClick={handleClick}>Click</Button>);
      await user.click(screen.getByRole('button'));
      
      expect(handleClick).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should handle double click', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(<Button onClick={handleClick}>Click</Button>);
      await user.dblClick(screen.getByRole('button'));
      
      expect(handleClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      render(<Button className="custom-class">Button</Button>);
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('should merge custom className with default classes', () => {
      render(<Button className="my-custom-class">Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('my-custom-class');
      expect(button).toHaveClass('inline-flex');
    });
  });

  describe('Form Integration', () => {
    it('should have type button by default', () => {
      render(<Button>Button</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('should accept type submit', () => {
      render(<Button type="submit">Submit</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('should accept type reset', () => {
      render(<Button type="reset">Reset</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'reset');
    });
  });

  describe('Accessibility', () => {
    it('should be focusable', async () => {
      const user = userEvent.setup();
      render(<Button>Focus me</Button>);
      
      await user.tab();
      expect(screen.getByRole('button')).toHaveFocus();
    });

    it('should support aria-label', () => {
      render(<Button aria-label="Add item"><Plus /></Button>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Add item');
    });

    it('should support aria-disabled', () => {
      render(<Button aria-disabled="true">Disabled</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(<Button onClick={handleClick}>Press Enter</Button>);
      
      await user.tab();
      await user.keyboard('{Enter}');
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should trigger on Space key', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(<Button onClick={handleClick}>Press Space</Button>);
      
      await user.tab();
      await user.keyboard(' ');
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('As Child (Polymorphic)', () => {
    it('should render as different element with asChild', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );
      
      const link = screen.getByRole('link');
      expect(link).toHaveTextContent('Link Button');
    });
  });

  describe('Icon Buttons', () => {
    it('should render with icon only', () => {
      render(
        <Button size="icon" aria-label="حذف">
          <Trash2 className="h-4 w-4" />
        </Button>
      );
      
      expect(screen.getByRole('button')).toHaveClass('w-10');
    });

    it('should render with icon and text', () => {
      render(
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          إضافة جديد
        </Button>
      );
      
      expect(screen.getByText('إضافة جديد')).toBeInTheDocument();
    });
  });

  describe('Common Use Cases', () => {
    it('should render save button', () => {
      render(
        <Button>
          <Save className="mr-2 h-4 w-4" />
          حفظ
        </Button>
      );
      
      expect(screen.getByText('حفظ')).toBeInTheDocument();
    });

    it('should render delete button with destructive variant', () => {
      render(
        <Button variant="destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          حذف
        </Button>
      );
      
      expect(screen.getByRole('button')).toHaveClass('bg-destructive');
    });

    it('should render edit button with outline variant', () => {
      render(
        <Button variant="outline">
          <Edit className="mr-2 h-4 w-4" />
          تعديل
        </Button>
      );
      
      expect(screen.getByRole('button')).toHaveClass('border');
    });

    it('should render download button', () => {
      render(
        <Button variant="secondary">
          <Download className="mr-2 h-4 w-4" />
          تحميل
        </Button>
      );
      
      expect(screen.getByText('تحميل')).toBeInTheDocument();
    });
  });

  describe('RTL Support', () => {
    it('should handle RTL icons correctly', () => {
      render(
        <Button className="flex-row-reverse">
          إضافة
          <Plus className="ml-2 h-4 w-4" />
        </Button>
      );
      
      expect(screen.getByText('إضافة')).toBeInTheDocument();
    });
  });
});
