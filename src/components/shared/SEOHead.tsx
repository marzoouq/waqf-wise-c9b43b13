/**
 * مكون SEO Head - لإدارة Meta Tags
 * يستخدم react-helmet-async لتحديث عناصر head
 */

import { Helmet } from 'react-helmet-async';

export interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noIndex?: boolean;
}

const SITE_NAME = 'وقف مرزوق الثبيتي';
const DEFAULT_DESCRIPTION = 'منصة متكاملة لإدارة الأوقاف والمستفيدين - نظام حديث لإدارة العقارات والتوزيعات والمحاسبة';
const DEFAULT_KEYWORDS = 'وقف, إدارة الأوقاف, مستفيدين, عقارات, توزيعات, محاسبة, السعودية';

export function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  ogImage = '/og-image.png',
  ogType = 'website',
  noIndex = false,
}: SEOHeadProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

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
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="ar_SA" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Additional */}
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <meta name="language" content="Arabic" />
      <meta name="author" content={SITE_NAME} />
      <link rel="canonical" href={window.location.href} />
    </Helmet>
  );
}
