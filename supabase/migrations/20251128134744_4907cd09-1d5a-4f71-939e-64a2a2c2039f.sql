-- إضافة عائلة الثبيتي
INSERT INTO families (id, family_name, head_of_family_id, total_members, tribe, status)
VALUES ('f1000000-0000-0000-0000-000000000001', 'آل الثبيتي', 'ff096d2b-5658-4445-b00d-54a97cc9aedc', 12, 'الثبيتي', 'active')
ON CONFLICT (id) DO NOTHING;

-- ربط المستفيدين بالعائلة
UPDATE beneficiaries SET family_id = 'f1000000-0000-0000-0000-000000000001' WHERE full_name LIKE '%الثبيتي%';

-- إضافة عقود للعقارات
INSERT INTO contracts (id, property_id, contract_type, start_date, end_date, monthly_rent, tenant_name, tenant_phone, tenant_id_number, status)
SELECT gen_random_uuid(), id, 'إيجار', '2024-01-01', '2024-12-31', 5000, 'مستأجر تجريبي', '0555000001', '1000000001', 'نشط'
FROM properties LIMIT 3;