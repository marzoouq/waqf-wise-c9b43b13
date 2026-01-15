-- إضافة إعدادات توزيع افتراضية
INSERT INTO waqf_distribution_settings (
  distribution_frequency,
  auto_distribution,
  distribution_day_of_month,
  nazer_percentage,
  waqif_charity_percentage,
  waqf_corpus_percentage,
  maintenance_percentage,
  reserve_percentage,
  distribution_rule,
  wives_share_ratio,
  notify_beneficiaries,
  notify_nazer,
  is_active,
  calculation_order
) VALUES (
  'شهري',
  false,
  1,
  10,
  5,
  0,
  5,
  0,
  'شرعي',
  12.5,
  true,
  true,
  true,
  'تسلسلي'
) ON CONFLICT DO NOTHING;