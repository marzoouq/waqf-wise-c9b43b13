/**
 * Input Component Tests - Comprehensive Functional Tests
 * اختبارات وظيفية شاملة لمكون الإدخال
 * @version 2.0.0
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Eye, EyeOff, Mail, Phone, User, Lock } from 'lucide-react';
import React from 'react';

describe('Input Component', () => {
  describe('Basic Rendering', () => {
    it('should render input element', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('should render with Arabic placeholder', () => {
      render(<Input placeholder="أدخل النص هنا" />);
      expect(screen.getByPlaceholderText('أدخل النص هنا')).toBeInTheDocument();
    });

    it('should render with default value', () => {
      render(<Input defaultValue="Default text" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveValue('Default text');
    });

    it('should render with controlled value', () => {
      render(<Input value="Controlled value" onChange={() => {}} data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveValue('Controlled value');
    });
  });

  describe('User Interaction', () => {
    it('should accept user input', async () => {
      const user = userEvent.setup();
      render(<Input data-testid="input" />);
      
      const input = screen.getByTestId('input');
      await user.type(input, 'Hello World');
      
      expect(input).toHaveValue('Hello World');
    });

    it('should accept Arabic input', async () => {
      const user = userEvent.setup();
      render(<Input data-testid="input" />);
      
      const input = screen.getByTestId('input');
      await user.type(input, 'مرحبا بالعالم');
      
      expect(input).toHaveValue('مرحبا بالعالم');
    });

    it('should call onChange when value changes', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      
      render(<Input onChange={handleChange} data-testid="input" />);
      await user.type(screen.getByTestId('input'), 'test');
      
      expect(handleChange).toHaveBeenCalled();
    });

    it('should call onBlur when focus is lost', async () => {
      const user = userEvent.setup();
      const handleBlur = vi.fn();
      
      render(<Input onBlur={handleBlur} data-testid="input" />);
      
      await user.click(screen.getByTestId('input'));
      await user.tab();
      
      expect(handleBlur).toHaveBeenCalled();
    });

    it('should call onFocus when focused', async () => {
      const user = userEvent.setup();
      const handleFocus = vi.fn();
      
      render(<Input onFocus={handleFocus} data-testid="input" />);
      await user.click(screen.getByTestId('input'));
      
      expect(handleFocus).toHaveBeenCalled();
    });
  });

  describe('States', () => {
    it('should be disabled when prop is set', () => {
      render(<Input disabled data-testid="input" />);
      expect(screen.getByTestId('input')).toBeDisabled();
    });

    it('should be readonly when prop is set', () => {
      render(<Input readOnly data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('readonly');
    });

    it('should be required when prop is set', () => {
      render(<Input required data-testid="input" />);
      expect(screen.getByTestId('input')).toBeRequired();
    });

    it('should show error styling', () => {
      render(<Input className="border-destructive" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('border-destructive');
    });
  });

  describe('Input Types', () => {
    it('should apply type text', () => {
      render(<Input type="text" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'text');
    });

    it('should apply type password', () => {
      render(<Input type="password" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'password');
    });

    it('should apply type email', () => {
      render(<Input type="email" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'email');
    });

    it('should apply type number', () => {
      render(<Input type="number" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'number');
    });

    it('should apply type tel', () => {
      render(<Input type="tel" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'tel');
    });

    it('should apply type search', () => {
      render(<Input type="search" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'search');
    });

    it('should apply type date', () => {
      render(<Input type="date" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'date');
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      render(<Input className="custom-class" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('custom-class');
    });

    it('should merge custom className with default classes', () => {
      render(<Input className="my-custom-class" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('my-custom-class');
      expect(input).toHaveClass('flex');
    });
  });

  describe('With Label', () => {
    it('should render input with label', () => {
      render(
        <div>
          <Label htmlFor="test-input">الاسم</Label>
          <Input id="test-input" />
        </div>
      );
      
      expect(screen.getByText('الاسم')).toBeInTheDocument();
      expect(screen.getByLabelText('الاسم')).toBeInTheDocument();
    });

    it('should associate label with input', () => {
      render(
        <div>
          <Label htmlFor="email-input">البريد الإلكتروني</Label>
          <Input id="email-input" type="email" />
        </div>
      );
      
      const input = screen.getByLabelText('البريد الإلكتروني');
      expect(input).toHaveAttribute('type', 'email');
    });
  });

  describe('Input with Icons', () => {
    it('should render search input with icon', () => {
      render(
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input className="pl-10" placeholder="بحث..." data-testid="search-input" />
        </div>
      );
      
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    it('should render email input with icon', () => {
      render(
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input type="email" className="pl-10" placeholder="البريد الإلكتروني" />
        </div>
      );
      
      expect(screen.getByPlaceholderText('البريد الإلكتروني')).toBeInTheDocument();
    });

    it('should render phone input with icon', () => {
      render(
        <div className="relative">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input type="tel" className="pl-10" placeholder="رقم الهاتف" />
        </div>
      );
      
      expect(screen.getByPlaceholderText('رقم الهاتف')).toBeInTheDocument();
    });
  });

  describe('Password Input', () => {
    it('should toggle password visibility', async () => {
      const user = userEvent.setup();
      
      const PasswordInput = () => {
        const [showPassword, setShowPassword] = React.useState(false);
        
        return (
          <div className="relative">
            <Input 
              type={showPassword ? 'text' : 'password'} 
              data-testid="password-input"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              data-testid="toggle-password"
            >
              {showPassword ? 'إخفاء' : 'إظهار'}
            </button>
          </div>
        );
      };
      
      render(<PasswordInput />);
      
      const input = screen.getByTestId('password-input');
      expect(input).toHaveAttribute('type', 'password');
      
      await user.click(screen.getByTestId('toggle-password'));
      expect(input).toHaveAttribute('type', 'text');
      
      await user.click(screen.getByTestId('toggle-password'));
      expect(input).toHaveAttribute('type', 'password');
    });
  });

  describe('Number Input', () => {
    it('should accept only numbers', async () => {
      const user = userEvent.setup();
      render(<Input type="number" data-testid="input" />);
      
      const input = screen.getByTestId('input');
      await user.type(input, '12345');
      
      expect(input).toHaveValue(12345);
    });

    it('should respect min and max values', () => {
      render(<Input type="number" min={0} max={100} data-testid="input" />);
      
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('min', '0');
      expect(input).toHaveAttribute('max', '100');
    });

    it('should respect step value', () => {
      render(<Input type="number" step={0.01} data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('step', '0.01');
    });
  });

  describe('Form Validation', () => {
    it('should show validation message for required field', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn((e) => e.preventDefault());
      
      render(
        <form onSubmit={handleSubmit}>
          <Input required data-testid="input" />
          <button type="submit">Submit</button>
        </form>
      );
      
      await user.click(screen.getByText('Submit'));
      
      expect(screen.getByTestId('input')).toBeInvalid();
    });

    it('should validate email format', async () => {
      const user = userEvent.setup();
      
      render(
        <form>
          <Input type="email" required data-testid="input" />
          <button type="submit">Submit</button>
        </form>
      );
      
      const input = screen.getByTestId('input');
      await user.type(input, 'invalid-email');
      
      expect(input).toBeInvalid();
    });

    it('should respect maxLength', async () => {
      const user = userEvent.setup();
      render(<Input maxLength={5} data-testid="input" />);
      
      const input = screen.getByTestId('input');
      await user.type(input, '123456789');
      
      expect(input).toHaveValue('12345');
    });

    it('should respect pattern', () => {
      render(<Input pattern="[0-9]{4}" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('pattern', '[0-9]{4}');
    });
  });

  describe('Accessibility', () => {
    it('should be focusable', async () => {
      const user = userEvent.setup();
      render(<Input data-testid="input" />);
      
      await user.tab();
      expect(screen.getByTestId('input')).toHaveFocus();
    });

    it('should support aria-label', () => {
      render(<Input aria-label="Enter your name" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('aria-label', 'Enter your name');
    });

    it('should support aria-describedby', () => {
      render(
        <>
          <Input aria-describedby="hint" data-testid="input" />
          <p id="hint">Enter your full name</p>
        </>
      );
      
      expect(screen.getByTestId('input')).toHaveAttribute('aria-describedby', 'hint');
    });

    it('should support aria-invalid', () => {
      render(<Input aria-invalid="true" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Common Use Cases', () => {
    it('should render national ID input', () => {
      render(
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4" />
          <Input 
            type="text" 
            placeholder="رقم الهوية الوطنية"
            maxLength={10}
            pattern="[0-9]*"
            data-testid="national-id"
          />
        </div>
      );
      
      expect(screen.getByPlaceholderText('رقم الهوية الوطنية')).toBeInTheDocument();
    });

    it('should render IBAN input', () => {
      render(
        <Input 
          type="text" 
          placeholder="SA..."
          maxLength={24}
          className="font-mono"
          data-testid="iban"
        />
      );
      
      expect(screen.getByTestId('iban')).toBeInTheDocument();
    });

    it('should render amount input', () => {
      render(
        <div className="relative">
          <Input 
            type="number" 
            placeholder="0.00"
            min={0}
            step={0.01}
            data-testid="amount"
          />
          <span className="absolute right-3 top-3 text-muted-foreground">ر.س</span>
        </div>
      );
      
      expect(screen.getByTestId('amount')).toBeInTheDocument();
    });
  });

  describe('RTL Support', () => {
    it('should handle RTL text direction', () => {
      render(<Input dir="rtl" placeholder="اكتب هنا" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('dir', 'rtl');
    });

    it('should render Arabic placeholder correctly', () => {
      render(<Input placeholder="أدخل اسمك الكامل" />);
      expect(screen.getByPlaceholderText('أدخل اسمك الكامل')).toBeInTheDocument();
    });
  });

  describe('Debounced Input', () => {
    it('should debounce input changes', async () => {
      vi.useFakeTimers();
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const handleChange = vi.fn();
      
      const DebouncedInput = () => {
        const [value, setValue] = React.useState('');
        
        React.useEffect(() => {
          const timer = setTimeout(() => {
            if (value) handleChange(value);
          }, 300);
          return () => clearTimeout(timer);
        }, [value]);
        
        return <Input value={value} onChange={(e) => setValue(e.target.value)} data-testid="input" />;
      };
      
      render(<DebouncedInput />);
      
      await user.type(screen.getByTestId('input'), 'test');
      expect(handleChange).not.toHaveBeenCalled();
      
      vi.advanceTimersByTime(300);
      expect(handleChange).toHaveBeenCalledWith('test');
      
      vi.useRealTimers();
    });
  });
});
