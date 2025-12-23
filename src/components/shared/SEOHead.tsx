/**
 * مكون SEO Head - لإدارة Meta Tags و Structured Data
 * يستخدم react-helmet-async لتحديث عناصر head
 */

import { Helmet } from 'react-helmet-async';

// النطاق الرئيسي للموقع
const SITE_URL = 'https://waqf-ba7r.store';

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noIndex?: boolean;
  canonicalPath?: string;
  breadcrumbs?: BreadcrumbItem[];
}

const SITE_NAME = 'وقف مرزوق الثبيتي';
const SITE_NAME_EN = 'Marzouq Ali Al-Thubaiti Waqf';
const DEFAULT_DESCRIPTION = 'منصة متكاملة لإدارة الأوقاف والمستفيدين - نظام حديث لإدارة العقارات والتوزيعات والمحاسبة';
const DEFAULT_KEYWORDS = 'وقف, إدارة الأوقاف, مستفيدين, عقارات, توزيعات, محاسبة, السعودية';

// Organization Schema
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": SITE_NAME,
  "alternateName": SITE_NAME_EN,
  "url": SITE_URL,
  "logo": `${SITE_URL}/pwa-icon-512.png`,
  "description": DEFAULT_DESCRIPTION,
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "SA"
  }
};

// WebSite Schema
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": SITE_NAME,
  "alternateName": "منصة إدارة الوقف",
  "url": SITE_URL,
  "inLanguage": "ar-SA"
};

// Generate BreadcrumbList Schema
const generateBreadcrumbSchema = (breadcrumbs: BreadcrumbItem[]) => {
  if (!breadcrumbs || breadcrumbs.length === 0) return null;
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${SITE_URL}${item.path}`
    }))
  };
};

export function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  ogImage,
  ogType = 'website',
  noIndex = false,
  canonicalPath,
  breadcrumbs,
}: SEOHeadProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  
  // إنشاء الـ canonical URL بشكل صحيح (بدون query params)
  const canonicalUrl = canonicalPath 
    ? `${SITE_URL}${canonicalPath}`
    : `${SITE_URL}${typeof window !== 'undefined' ? window.location.pathname : '/'}`;
  
  // الصورة الافتراضية للمشاركة
  const fullOgImage = ogImage || `${SITE_URL}/pwa-icon-512.png`;

  // Generate breadcrumb schema if provided
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs || []);

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="ar_SA" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />
      
      {/* Additional */}
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <meta name="language" content="Arabic" />
      <meta name="author" content={SITE_NAME} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Structured Data - Organization */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      
      {/* Structured Data - WebSite */}
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      
      {/* Structured Data - BreadcrumbList (if provided) */}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
    </Helmet>
  );
}
