# نظام التصميم - النسخة 2.2.0
# Design System v2.2.0

## نظرة عامة

نظام التصميم المحسّن للتطبيق يوفر مجموعة متكاملة من المتغيرات والأنماط لضمان تناسق واجهة المستخدم.

## الألوان الأساسية

### الوضع الفاتح (Light Mode)

```css
--background: 48 20% 97%;      /* خلفية التطبيق */
--foreground: 150 25% 15%;     /* لون النص الأساسي */
--primary: 150 45% 35%;        /* اللون الأساسي */
--secondary: 150 25% 92%;      /* اللون الثانوي */
--accent: 43 90% 55%;          /* لون التمييز */
--muted: 48 15% 94%;           /* لون خافت */
```

### الوضع الداكن (Dark Mode)

```css
--background: 150 25% 10%;
--foreground: 150 15% 95%;
--primary: 150 50% 45%;
--secondary: 150 20% 20%;
--accent: 43 85% 60%;
--muted: 150 15% 18%;
```

## ألوان الحالة

| الحالة | اللون الأساسي | لون النص | اللون الفاتح |
|--------|---------------|----------|--------------|
| نجاح | `--success` | `--success-foreground` | `--success-light` |
| تحذير | `--warning` | `--warning-foreground` | `--warning-light` |
| خطأ | `--destructive` | `--destructive-foreground` | `--destructive-light` |
| معلومة | `--info` | `--info-foreground` | `--info-light` |

## التدرجات (Gradients)

```css
--gradient-primary: linear-gradient(135deg, hsl(150 45% 35%), hsl(150 55% 45%));
--gradient-accent: linear-gradient(135deg, hsl(43 90% 55%), hsl(38 92% 50%));
--gradient-hero: linear-gradient(135deg, hsl(150 50% 25%), hsl(150 45% 35%));
--gradient-success: linear-gradient(135deg, hsl(150 60% 40%), hsl(150 65% 50%));
--gradient-warning: linear-gradient(135deg, hsl(38 92% 45%), hsl(43 90% 55%));
--gradient-destructive: linear-gradient(135deg, hsl(0 72% 46%), hsl(0 72% 56%));
--gradient-glass: linear-gradient(135deg, hsl(0 0% 100% / 0.1), hsl(0 0% 100% / 0.05));
```

## الظلال (Shadows)

```css
--shadow-soft: 0 2px 8px hsl(150 30% 20% / 0.08);
--shadow-medium: 0 4px 16px hsl(150 30% 20% / 0.12);
--shadow-strong: 0 8px 32px hsl(150 30% 20% / 0.16);
--shadow-glow: 0 0 20px hsl(150 45% 35% / 0.3);
```

## الانتقالات (Transitions)

```css
--transition-fast: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
--transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
```

## المسافات (Spacing)

```css
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
--spacing-2xl: 3rem;     /* 48px */
```

## نصف القطر (Border Radius)

```css
--radius: 0.75rem;       /* 12px - الافتراضي */
/* Tailwind classes: rounded-sm, rounded-md, rounded-lg, rounded-xl, rounded-2xl */
```

## الخطوط (Typography)

### عائلة الخطوط

```typescript
fontFamily: {
  sans: ['Cairo', 'system-ui', 'sans-serif'],
  arabic: ['Cairo', 'Noto Sans Arabic', 'sans-serif'],
}
```

### أحجام الخطوط

| الحجم | القيمة | ارتفاع السطر | الاستخدام |
|-------|--------|--------------|-----------|
| xs | 0.75rem | 1.5 | نصوص صغيرة جداً |
| sm | 0.875rem | 1.5 | نصوص صغيرة |
| base | 1rem | 1.6 | النص الأساسي |
| lg | 1.125rem | 1.6 | نصوص أكبر |
| xl | 1.25rem | 1.5 | عناوين صغيرة |
| 2xl | 1.5rem | 1.4 | عناوين متوسطة |
| 3xl | 1.875rem | 1.3 | عناوين كبيرة |
| 4xl | 2.25rem | 1.2 | عناوين رئيسية |

## الحركات (Animations)

### Tailwind Animations

```typescript
animation: {
  "accordion-down": "accordion-down 0.2s ease-out",
  "accordion-up": "accordion-up 0.2s ease-out",
  "fade-in": "fade-in 0.3s ease-out",
  "fade-out": "fade-out 0.3s ease-out",
  "slide-in-right": "slide-in-right 0.3s ease-out",
  "slide-out-right": "slide-out-right 0.3s ease-out",
  "scale-in": "scale-in 0.2s ease-out",
  "pulse-soft": "pulse-soft 2s ease-in-out infinite",
  "shimmer": "shimmer 2s infinite",
}
```

## فئات CSS المخصصة

### الحاويات

```css
.container-custom {
  @apply container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl;
}
```

### تأثيرات البطاقات

```css
.card-hover {
  transition: var(--transition-smooth);
}

.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}
```

### النص المتدرج

```css
.gradient-text {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### التحميل

```css
.skeleton {
  background: linear-gradient(
    90deg,
    hsl(var(--muted)) 0%,
    hsl(var(--muted-foreground) / 0.1) 50%,
    hsl(var(--muted)) 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
```

## دعم إمكانية الوصول

### تقليل الحركة

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### التباين العالي

```css
@media (prefers-contrast: high) {
  * {
    border-width: 2px !important;
  }
}
```

## دعم RTL

```css
[dir="rtl"] {
  text-align: right;
}

[dir="rtl"] .text-left {
  text-align: right !important;
}

[dir="rtl"] .text-right {
  text-align: left !important;
}
```

## Safe Area للأجهزة المحمولة

```css
.safe-area-pt { padding-top: env(safe-area-inset-top); }
.safe-area-pb { padding-bottom: env(safe-area-inset-bottom); }
.safe-area-pl { padding-left: env(safe-area-inset-left); }
.safe-area-pr { padding-right: env(safe-area-inset-right); }
```

## الطباعة

نظام التصميم يدعم الطباعة المحسنة مع:
- إخفاء العناصر غير الضرورية
- تحسين أحجام الخطوط للطباعة
- دعم فواصل الصفحات للجداول

---

**آخر تحديث:** 2025-11-27
**النسخة:** 2.2.0
