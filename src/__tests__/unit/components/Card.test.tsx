/**
 * اختبارات مكون Card
 * Card Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
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
    render(<Card className="custom-card">Content</Card>);
    expect(screen.getByText('Content').closest('.rounded-lg')).toHaveClass('custom-card');
  });

  it('should render CardHeader with custom className', () => {
    render(
      <Card>
        <CardHeader className="custom-header">
          <CardTitle>Title</CardTitle>
        </CardHeader>
      </Card>
    );
    expect(screen.getByText('Title').parentElement).toHaveClass('custom-header');
  });

  it('should render CardContent correctly', () => {
    render(
      <Card>
        <CardContent className="custom-content">
          <span>Test Content</span>
        </CardContent>
      </Card>
    );
    expect(screen.getByText('Test Content').parentElement).toHaveClass('custom-content');
  });
});
