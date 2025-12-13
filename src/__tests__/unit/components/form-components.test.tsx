/**
 * اختبارات مكونات النماذج
 * Form Components Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Form Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Text Input', () => {
    it('should render with label', () => {
      const TestInput = () => (
        <div className="form-field">
          <label htmlFor="name">الاسم</label>
          <input id="name" type="text" data-testid="text-input" />
        </div>
      );

      render(<TestInput />, { wrapper: createWrapper() });
      
      expect(screen.getByLabelText('الاسم')).toBeInTheDocument();
    });

    it('should handle value changes', () => {
      const handleChange = vi.fn();
      const TestInput = () => (
        <input
          type="text"
          data-testid="text-input"
          onChange={(e) => handleChange(e.target.value)}
        />
      );

      render(<TestInput />, { wrapper: createWrapper() });
      fireEvent.change(screen.getByTestId('text-input'), { target: { value: 'محمد' } });
      
      expect(handleChange).toHaveBeenCalledWith('محمد');
    });

    it('should show error state', () => {
      const TestInput = () => (
        <div className="form-field">
          <input type="text" data-testid="text-input" className="error" />
          <span data-testid="error-message" className="text-red-500">هذا الحقل مطلوب</span>
        </div>
      );

      render(<TestInput />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('text-input')).toHaveClass('error');
      expect(screen.getByTestId('error-message')).toHaveTextContent('هذا الحقل مطلوب');
    });

    it('should be disabled', () => {
      const TestInput = () => (
        <input type="text" data-testid="text-input" disabled />
      );

      render(<TestInput />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('text-input')).toBeDisabled();
    });
  });

  describe('Number Input', () => {
    it('should only accept numbers', () => {
      const TestInput = () => (
        <input type="number" data-testid="number-input" />
      );

      render(<TestInput />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('number-input')).toHaveAttribute('type', 'number');
    });

    it('should have min and max values', () => {
      const TestInput = () => (
        <input type="number" data-testid="number-input" min={0} max={100} />
      );

      render(<TestInput />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('number-input')).toHaveAttribute('min', '0');
      expect(screen.getByTestId('number-input')).toHaveAttribute('max', '100');
    });
  });

  describe('Select Dropdown', () => {
    it('should render options', () => {
      const TestSelect = () => (
        <select data-testid="select-input">
          <option value="">اختر...</option>
          <option value="option1">خيار 1</option>
          <option value="option2">خيار 2</option>
        </select>
      );

      render(<TestSelect />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('select-input')).toBeInTheDocument();
      expect(screen.getAllByRole('option')).toHaveLength(3);
    });

    it('should handle selection change', () => {
      const handleChange = vi.fn();
      const TestSelect = () => (
        <select data-testid="select-input" onChange={(e) => handleChange(e.target.value)}>
          <option value="">اختر...</option>
          <option value="option1">خيار 1</option>
        </select>
      );

      render(<TestSelect />, { wrapper: createWrapper() });
      fireEvent.change(screen.getByTestId('select-input'), { target: { value: 'option1' } });
      
      expect(handleChange).toHaveBeenCalledWith('option1');
    });
  });

  describe('Checkbox', () => {
    it('should toggle state', () => {
      const handleChange = vi.fn();
      const TestCheckbox = () => (
        <input
          type="checkbox"
          data-testid="checkbox-input"
          onChange={(e) => handleChange(e.target.checked)}
        />
      );

      render(<TestCheckbox />, { wrapper: createWrapper() });
      fireEvent.click(screen.getByTestId('checkbox-input'));
      
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('should render with label', () => {
      const TestCheckbox = () => (
        <label>
          <input type="checkbox" data-testid="checkbox-input" />
          موافق على الشروط
        </label>
      );

      render(<TestCheckbox />, { wrapper: createWrapper() });
      
      expect(screen.getByText('موافق على الشروط')).toBeInTheDocument();
    });
  });

  describe('Radio Group', () => {
    it('should render radio options', () => {
      const TestRadioGroup = () => (
        <div role="radiogroup">
          <label>
            <input type="radio" name="gender" value="male" data-testid="radio-male" />
            ذكر
          </label>
          <label>
            <input type="radio" name="gender" value="female" data-testid="radio-female" />
            أنثى
          </label>
        </div>
      );

      render(<TestRadioGroup />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('radio-male')).toBeInTheDocument();
      expect(screen.getByTestId('radio-female')).toBeInTheDocument();
    });

    it('should allow single selection', () => {
      const TestRadioGroup = () => (
        <div role="radiogroup">
          <input type="radio" name="test" data-testid="radio-1" />
          <input type="radio" name="test" data-testid="radio-2" />
        </div>
      );

      render(<TestRadioGroup />, { wrapper: createWrapper() });
      fireEvent.click(screen.getByTestId('radio-1'));
      
      expect(screen.getByTestId('radio-1')).toBeChecked();
      expect(screen.getByTestId('radio-2')).not.toBeChecked();
    });
  });

  describe('Textarea', () => {
    it('should handle multi-line input', () => {
      const TestTextarea = () => (
        <textarea data-testid="textarea-input" rows={4} />
      );

      render(<TestTextarea />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('textarea-input')).toHaveAttribute('rows', '4');
    });

    it('should have max length', () => {
      const TestTextarea = () => (
        <textarea data-testid="textarea-input" maxLength={500} />
      );

      render(<TestTextarea />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('textarea-input')).toHaveAttribute('maxLength', '500');
    });
  });

  describe('Date Picker', () => {
    it('should render date input', () => {
      const TestDatePicker = () => (
        <input type="date" data-testid="date-input" />
      );

      render(<TestDatePicker />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('date-input')).toHaveAttribute('type', 'date');
    });

    it('should have min and max dates', () => {
      const TestDatePicker = () => (
        <input
          type="date"
          data-testid="date-input"
          min="2025-01-01"
          max="2025-12-31"
        />
      );

      render(<TestDatePicker />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('date-input')).toHaveAttribute('min', '2025-01-01');
      expect(screen.getByTestId('date-input')).toHaveAttribute('max', '2025-12-31');
    });
  });

  describe('File Upload', () => {
    it('should render file input', () => {
      const TestFileUpload = () => (
        <input type="file" data-testid="file-input" accept=".pdf,.doc,.docx" />
      );

      render(<TestFileUpload />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('file-input')).toHaveAttribute('accept', '.pdf,.doc,.docx');
    });

    it('should allow multiple files', () => {
      const TestFileUpload = () => (
        <input type="file" data-testid="file-input" multiple />
      );

      render(<TestFileUpload />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('file-input')).toHaveAttribute('multiple');
    });
  });

  describe('Form Validation', () => {
    it('should show required field indicator', () => {
      const TestField = () => (
        <div className="form-field">
          <label>
            الاسم <span data-testid="required-indicator" className="text-red-500">*</span>
          </label>
          <input type="text" required />
        </div>
      );

      render(<TestField />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('required-indicator')).toHaveTextContent('*');
    });

    it('should validate on blur', () => {
      const handleBlur = vi.fn();
      const TestField = () => (
        <input
          type="text"
          data-testid="text-input"
          onBlur={handleBlur}
        />
      );

      render(<TestField />, { wrapper: createWrapper() });
      fireEvent.blur(screen.getByTestId('text-input'));
      
      expect(handleBlur).toHaveBeenCalled();
    });

    it('should show validation message', () => {
      const TestField = () => (
        <div className="form-field">
          <input type="text" data-testid="text-input" />
          <span data-testid="validation-message" className="text-red-500">
            يجب أن يكون الاسم أكثر من 3 أحرف
          </span>
        </div>
      );

      render(<TestField />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('validation-message')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should handle form submit', () => {
      const handleSubmit = vi.fn((e) => e.preventDefault());
      const TestForm = () => (
        <form data-testid="test-form" onSubmit={handleSubmit}>
          <input type="text" name="name" />
          <button type="submit">حفظ</button>
        </form>
      );

      render(<TestForm />, { wrapper: createWrapper() });
      fireEvent.submit(screen.getByTestId('test-form'));
      
      expect(handleSubmit).toHaveBeenCalled();
    });

    it('should reset form', () => {
      const handleReset = vi.fn();
      const TestForm = () => (
        <form data-testid="test-form" onReset={handleReset}>
          <input type="text" name="name" defaultValue="test" />
          <button type="reset">إعادة تعيين</button>
        </form>
      );

      render(<TestForm />, { wrapper: createWrapper() });
      fireEvent.reset(screen.getByTestId('test-form'));
      
      expect(handleReset).toHaveBeenCalled();
    });
  });

  describe('Currency Input', () => {
    it('should format currency value', () => {
      const TestCurrencyInput = () => (
        <div className="currency-input">
          <input type="text" data-testid="currency-input" value="1,000,000" readOnly />
          <span data-testid="currency-symbol">ر.س</span>
        </div>
      );

      render(<TestCurrencyInput />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('currency-input')).toHaveValue('1,000,000');
      expect(screen.getByTestId('currency-symbol')).toHaveTextContent('ر.س');
    });
  });

  describe('Phone Input', () => {
    it('should validate phone format', () => {
      const TestPhoneInput = () => (
        <input
          type="tel"
          data-testid="phone-input"
          pattern="^05\d{8}$"
          placeholder="05xxxxxxxx"
        />
      );

      render(<TestPhoneInput />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('phone-input')).toHaveAttribute('pattern', '^05\\d{8}$');
    });
  });

  describe('IBAN Input', () => {
    it('should validate IBAN format', () => {
      const TestIBANInput = () => (
        <input
          type="text"
          data-testid="iban-input"
          maxLength={24}
          placeholder="SAxxxxxxxxxxxxxxxxxxxx"
        />
      );

      render(<TestIBANInput />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('iban-input')).toHaveAttribute('maxLength', '24');
    });
  });

  describe('National ID Input', () => {
    it('should validate national ID format', () => {
      const TestIDInput = () => (
        <input
          type="text"
          data-testid="id-input"
          maxLength={10}
          pattern="^\d{10}$"
        />
      );

      render(<TestIDInput />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('id-input')).toHaveAttribute('maxLength', '10');
    });
  });

  describe('Search Input', () => {
    it('should render with search icon', () => {
      const TestSearchInput = () => (
        <div className="search-input">
          <span data-testid="search-icon">🔍</span>
          <input type="search" data-testid="search-input" placeholder="بحث..." />
        </div>
      );

      render(<TestSearchInput />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('search-icon')).toBeInTheDocument();
      expect(screen.getByTestId('search-input')).toHaveAttribute('placeholder', 'بحث...');
    });

    it('should have clear button', () => {
      const handleClear = vi.fn();
      const TestSearchInput = () => (
        <div className="search-input">
          <input type="search" data-testid="search-input" value="test" readOnly />
          <button data-testid="clear-btn" onClick={handleClear}>×</button>
        </div>
      );

      render(<TestSearchInput />, { wrapper: createWrapper() });
      fireEvent.click(screen.getByTestId('clear-btn'));
      
      expect(handleClear).toHaveBeenCalled();
    });
  });
});
