/**
 * SkipLinks - روابط التخطي للتنقل السريع
 * WCAG 2.1 - 2.4.1 Bypass Blocks
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { A11Y_CLASSES, ARIA_LABELS } from '@/lib/accessibility';

interface SkipLink {
  id: string;
  label: string;
  target: string;
}

const DEFAULT_SKIP_LINKS: SkipLink[] = [
  { id: 'skip-main', label: 'تخطي إلى المحتوى الرئيسي', target: '#main-content' },
  { id: 'skip-nav', label: 'تخطي إلى التنقل', target: '#main-navigation' },
  { id: 'skip-search', label: 'تخطي إلى البحث', target: '#global-search' },
];

interface SkipLinksProps {
  links?: SkipLink[];
  className?: string;
}

export function SkipLinks({ links = DEFAULT_SKIP_LINKS, className }: SkipLinksProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault();
    const element = document.querySelector(target);
    if (element) {
      (element as HTMLElement).focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav 
      aria-label="روابط التخطي"
      className={cn('skip-links-container', className)}
    >
      {links.map((link) => (
        <a
          key={link.id}
          id={link.id}
          href={link.target}
          onClick={(e) => handleClick(e, link.target)}
          className={cn(
            // Visually hidden until focused
            'fixed top-0 left-1/2 -translate-x-1/2 z-[9999]',
            'px-6 py-3 rounded-b-lg',
            'bg-primary text-primary-foreground',
            'font-medium text-sm',
            'transform -translate-y-full',
            'focus:translate-y-0',
            'transition-transform duration-200',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'shadow-lg'
          )}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}

// ==================== Main Content Wrapper ====================

interface MainContentProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

export function MainContent({ 
  children, 
  id = 'main-content',
  className 
}: MainContentProps) {
  return (
    <main 
      id={id}
      role="main"
      tabIndex={-1}
      aria-label={ARIA_LABELS.navigation.main}
      className={cn('outline-none', className)}
    >
      {children}
    </main>
  );
}

// ==================== Navigation Wrapper ====================

interface NavigationWrapperProps {
  children: React.ReactNode;
  id?: string;
  label?: string;
  className?: string;
}

export function NavigationWrapper({ 
  children, 
  id = 'main-navigation',
  label = ARIA_LABELS.navigation.main,
  className 
}: NavigationWrapperProps) {
  return (
    <nav 
      id={id}
      role="navigation"
      aria-label={label}
      tabIndex={-1}
      className={cn('outline-none', className)}
    >
      {children}
    </nav>
  );
}

// ==================== Visually Hidden ====================

interface VisuallyHiddenProps {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
}

export function VisuallyHidden({ children, as: Component = 'span' }: VisuallyHiddenProps) {
  return (
    <Component className="sr-only">
      {children}
    </Component>
  );
}

// ==================== Live Region ====================

interface LiveRegionProps {
  children: React.ReactNode;
  priority?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all';
}

export function LiveRegion({ 
  children, 
  priority = 'polite',
  atomic = true,
  relevant = 'additions'
}: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className="sr-only"
    >
      {children}
    </div>
  );
}

// ==================== Focus Trap ====================

interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}

export function FocusTrap({ children, active = true, className }: FocusTrapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const startRef = React.useRef<HTMLDivElement>(null);
  const endRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!active || !containerRef.current) return;

    const handleFocus = (e: FocusEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const focusableElements = container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.target === startRef.current) {
        lastElement?.focus();
      } else if (e.target === endRef.current) {
        firstElement?.focus();
      }
    };

    startRef.current?.addEventListener('focus', handleFocus);
    endRef.current?.addEventListener('focus', handleFocus);

    return () => {
      startRef.current?.removeEventListener('focus', handleFocus);
      endRef.current?.removeEventListener('focus', handleFocus);
    };
  }, [active]);

  if (!active) {
    return <>{children}</>;
  }

  return (
    <div ref={containerRef} className={className}>
      <div ref={startRef} tabIndex={0} aria-hidden="true" />
      {children}
      <div ref={endRef} tabIndex={0} aria-hidden="true" />
    </div>
  );
}

export default SkipLinks;
