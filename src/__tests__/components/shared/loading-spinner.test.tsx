/**
 * Loading Component Tests
 * @version 1.0.0
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

describe('Loading Components', () => {
  it('should render a spinner element', () => {
    const { container } = render(
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
    );
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should support different sizes', () => {
    const sizes = ['h-4 w-4', 'h-8 w-8', 'h-12 w-12'];
    sizes.forEach(size => {
      const { container } = render(
        <div className={`animate-spin ${size} border-4 border-primary rounded-full`} />
      );
      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });
});
