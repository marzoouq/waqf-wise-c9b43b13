/**
 * اختبارات مكون Card
 * Card Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

describe('Card', () => {
  it('should render card with all parts', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card content</p>
        </CardContent>
        <CardFooter>
          <p>Card footer</p>
        </CardFooter>
      </Card>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
    expect(screen.getByText('Card footer')).toBeInTheDocument();
  });

  it('should apply custom className to Card', () => {
    const { container } = render(<Card className="custom-card">Content</Card>);
    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement).toHaveClass('custom-card');
  });

  it('should render CardHeader with custom className', () => {
    const { container } = render(
      <Card>
        <CardHeader className="custom-header">
          <CardTitle>Title</CardTitle>
        </CardHeader>
      </Card>
    );
    const header = container.querySelector('.custom-header');
    expect(header).toBeInTheDocument();
  });

  it('should render CardContent correctly', () => {
    const { container } = render(
      <Card>
        <CardContent className="custom-content">
          <span>Test Content</span>
        </CardContent>
      </Card>
    );
    const content = container.querySelector('.custom-content');
    expect(content).toBeInTheDocument();
  });
});
