/**
 * Card Component Tests - Comprehensive Functional Tests
 * اختبارات وظيفية شاملة لمكون البطاقة
 * @version 2.0.0
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Building2, DollarSign, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';

describe('Card Component', () => {
  describe('Basic Rendering', () => {
    it('should render card with content', () => {
      render(
        <Card>
          <CardContent>Card content</CardContent>
        </Card>
      );
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('should render card with header and title', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
        </Card>
      );
      expect(screen.getByText('Card Title')).toBeInTheDocument();
    });

    it('should render Arabic title correctly', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>عنوان البطاقة</CardTitle>
          </CardHeader>
        </Card>
      );
      expect(screen.getByText('عنوان البطاقة')).toBeInTheDocument();
    });
  });

  describe('Card Structure', () => {
    it('should have proper structure with all components', () => {
      render(
        <Card data-testid="card">
          <CardHeader data-testid="header">
            <CardTitle data-testid="title">Title</CardTitle>
            <CardDescription data-testid="description">Description</CardDescription>
          </CardHeader>
          <CardContent data-testid="content">Content</CardContent>
          <CardFooter data-testid="footer">Footer</CardFooter>
        </Card>
      );
      
      expect(screen.getByTestId('card')).toBeInTheDocument();
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('title')).toBeInTheDocument();
      expect(screen.getByTestId('description')).toBeInTheDocument();
      expect(screen.getByTestId('content')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('should render description with muted styling', () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription>هذا وصف البطاقة</CardDescription>
          </CardHeader>
        </Card>
      );
      
      const description = screen.getByText('هذا وصف البطاقة');
      expect(description).toHaveClass('text-muted-foreground');
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className to Card', () => {
      render(<Card className="custom-class">Content</Card>);
      const card = screen.getByText('Content').parentElement;
      expect(card).toHaveClass('custom-class');
    });

    it('should apply custom className to CardHeader', () => {
      render(
        <Card>
          <CardHeader className="custom-header">
            <CardTitle>Title</CardTitle>
          </CardHeader>
        </Card>
      );
      
      const header = screen.getByText('Title').parentElement;
      expect(header).toHaveClass('custom-header');
    });

    it('should apply custom className to CardContent', () => {
      render(
        <Card>
          <CardContent className="custom-content">Content</CardContent>
        </Card>
      );
      
      const content = screen.getByText('Content');
      expect(content).toHaveClass('custom-content');
    });

    it('should apply custom className to CardFooter', () => {
      render(
        <Card>
          <CardFooter className="custom-footer">Footer</CardFooter>
        </Card>
      );
      
      const footer = screen.getByText('Footer');
      expect(footer).toHaveClass('custom-footer');
    });
  });

  describe('KPI Card Use Cases', () => {
    it('should render beneficiaries KPI card', () => {
      render(
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">المستفيدين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">150</div>
            <p className="text-xs text-muted-foreground">+12% من الشهر الماضي</p>
          </CardContent>
        </Card>
      );
      
      expect(screen.getByText('المستفيدين')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('+12% من الشهر الماضي')).toBeInTheDocument();
    });

    it('should render properties KPI card', () => {
      render(
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">العقارات</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25</div>
            <p className="text-xs text-muted-foreground">80% نسبة الإشغال</p>
          </CardContent>
        </Card>
      );
      
      expect(screen.getByText('العقارات')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
    });

    it('should render revenue KPI card with trend', () => {
      render(
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">الإيرادات الشهرية</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">250,000 ر.س</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUp className="h-3 w-3 mr-1" />
              <span>15% زيادة</span>
            </div>
          </CardContent>
        </Card>
      );
      
      expect(screen.getByText('الإيرادات الشهرية')).toBeInTheDocument();
      expect(screen.getByText('250,000 ر.س')).toBeInTheDocument();
      expect(screen.getByText('15% زيادة')).toBeInTheDocument();
    });
  });

  describe('Interactive Cards', () => {
    it('should render card with action buttons', () => {
      const handleEdit = vi.fn();
      const handleDelete = vi.fn();
      
      render(
        <Card>
          <CardHeader>
            <CardTitle>عقار الوقف</CardTitle>
          </CardHeader>
          <CardContent>
            <p>تفاصيل العقار</p>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button variant="outline" onClick={handleEdit}>تعديل</Button>
            <Button variant="destructive" onClick={handleDelete}>حذف</Button>
          </CardFooter>
        </Card>
      );
      
      fireEvent.click(screen.getByText('تعديل'));
      expect(handleEdit).toHaveBeenCalled();
      
      fireEvent.click(screen.getByText('حذف'));
      expect(handleDelete).toHaveBeenCalled();
    });

    it('should render clickable card', () => {
      const handleClick = vi.fn();
      
      render(
        <Card 
          className="cursor-pointer hover:bg-muted/50" 
          onClick={handleClick}
          data-testid="clickable-card"
        >
          <CardContent>Click me</CardContent>
        </Card>
      );
      
      fireEvent.click(screen.getByTestId('clickable-card'));
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('Card with Badge', () => {
    it('should render card with status badge', () => {
      render(
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>عقد إيجار</CardTitle>
            <Badge variant="default">نشط</Badge>
          </CardHeader>
          <CardContent>
            <p>تفاصيل العقد</p>
          </CardContent>
        </Card>
      );
      
      expect(screen.getByText('نشط')).toBeInTheDocument();
    });

    it('should render card with expiring badge', () => {
      render(
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>عقد إيجار</CardTitle>
            <Badge variant="destructive">قريب الانتهاء</Badge>
          </CardHeader>
          <CardContent>
            <p>ينتهي خلال 7 أيام</p>
          </CardContent>
        </Card>
      );
      
      expect(screen.getByText('قريب الانتهاء')).toBeInTheDocument();
    });
  });

  describe('List Cards', () => {
    it('should render card with list items', () => {
      const items = [
        { id: 1, name: 'أحمد محمد', amount: 5000 },
        { id: 2, name: 'سارة علي', amount: 3000 },
        { id: 3, name: 'خالد عمر', amount: 4000 },
      ];
      
      render(
        <Card>
          <CardHeader>
            <CardTitle>المستفيدين</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {items.map(item => (
                <li key={item.id} className="flex justify-between">
                  <span>{item.name}</span>
                  <span>{item.amount} ر.س</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      );
      
      expect(screen.getByText('أحمد محمد')).toBeInTheDocument();
      expect(screen.getByText('سارة علي')).toBeInTheDocument();
      expect(screen.getByText('خالد عمر')).toBeInTheDocument();
    });
  });

  describe('Chart Card', () => {
    it('should render card container for chart', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>الإيرادات والمصروفات</CardTitle>
            <CardDescription>آخر 6 أشهر</CardDescription>
          </CardHeader>
          <CardContent>
            <div data-testid="chart-container" className="h-64">
              {/* Chart would go here */}
            </div>
          </CardContent>
        </Card>
      );
      
      expect(screen.getByText('الإيرادات والمصروفات')).toBeInTheDocument();
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('Empty State Card', () => {
    it('should render empty state card', () => {
      render(
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">لا يوجد مستفيدين</p>
            <Button className="mt-4">إضافة مستفيد</Button>
          </CardContent>
        </Card>
      );
      
      expect(screen.getByText('لا يوجد مستفيدين')).toBeInTheDocument();
      expect(screen.getByText('إضافة مستفيد')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be accessible with proper heading structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Accessible Card</CardTitle>
          </CardHeader>
          <CardContent>Content goes here</CardContent>
        </Card>
      );
      
      expect(screen.getByText('Accessible Card')).toBeInTheDocument();
    });

    it('should support aria attributes', () => {
      render(
        <Card role="region" aria-label="إحصائيات المستفيدين">
          <CardContent>Stats</CardContent>
        </Card>
      );
      
      expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'إحصائيات المستفيدين');
    });
  });

  describe('Responsive Design', () => {
    it('should render with responsive padding classes', () => {
      const { container } = render(
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle>Responsive</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">Content</CardContent>
        </Card>
      );
      
      expect(container.querySelector('.p-4')).toBeInTheDocument();
    });

    it('should support grid layout within card', () => {
      render(
        <Card>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>Column 1</div>
            <div>Column 2</div>
          </CardContent>
        </Card>
      );
      
      expect(screen.getByText('Column 1')).toBeInTheDocument();
      expect(screen.getByText('Column 2')).toBeInTheDocument();
    });
  });

  describe('RTL Support', () => {
    it('should handle RTL text alignment', () => {
      render(
        <Card className="text-right">
          <CardHeader>
            <CardTitle>عنوان باللغة العربية</CardTitle>
          </CardHeader>
          <CardContent>
            <p>محتوى البطاقة باللغة العربية</p>
          </CardContent>
        </Card>
      );
      
      expect(screen.getByText('عنوان باللغة العربية')).toBeInTheDocument();
    });

    it('should handle long Arabic content', () => {
      const longContent = 'هذا نص طويل باللغة العربية يستخدم لاختبار كيفية عرض المحتوى الطويل داخل البطاقة والتأكد من أنه يتم عرضه بشكل صحيح';
      
      render(
        <Card>
          <CardContent>{longContent}</CardContent>
        </Card>
      );
      
      expect(screen.getByText(longContent)).toBeInTheDocument();
    });
  });
});
