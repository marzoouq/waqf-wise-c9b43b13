/**
 * مكون SEO Head - لإدارة Meta Tags
 * يستخدم react-helmet-async لتحديث عناصر head
 */

import { Helmet } from 'react-helmet-async';

// النطاق الرئيسي للموقع
const SITE_URL = 'https://waqf-ba7r.store';

export interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noIndex?: boolean;
  canonicalPath?: string;
}

const SITE_NAME = 'وقف مرزوق الثبيتي';
const DEFAULT_DESCRIPTION = 'منصة متكاملة لإدارة الأوقاف والمستفيدين - نظام حديث لإدارة العقارات والتوزيعات والمحاسبة';
const DEFAULT_KEYWORDS = 'وقف, إدارة الأوقاف, مستفيدين, عقارات, توزيعات, محاسبة, السعودية';

export function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  ogImage,
  ogType = 'website',
  noIndex = false,
  canonicalPath,
}: SEOHeadProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  
  // إنشاء الـ canonical URL بشكل صحيح (بدون query params)
  const canonicalUrl = canonicalPath 
    ? `${SITE_URL}${canonicalPath}`
    : `${SITE_URL}${typeof window !== 'undefined' ? window.location.pathname : '/'}`;
  
  // الصورة الافتراضية للمشاركة
  const fullOgImage = ogImage || `${SITE_URL}/pwa-icon-512.png`;

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
    </Helmet>
  );
}
