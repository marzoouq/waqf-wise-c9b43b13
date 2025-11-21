
-- دالة لإضافة بيانات تجريبية للنظام
CREATE OR REPLACE FUNCTION seed_demo_data()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  family_id uuid;
  fund_sons_id uuid;
  fund_daughters_id uuid;
  fund_wives_id uuid;
  result json;
  contracts_created int := 0;
  families_created int := 0;
  funds_created int := 0;
BEGIN
  -- إنشاء عائلة رئيسية إذا لم تكن موجودة
  IF NOT EXISTS (SELECT 1 FROM families WHERE family_name = 'عائلة الثبيتي') THEN
    INSERT INTO families (family_name, head_of_family_id, tribe, status, total_members, notes)
    VALUES (
      'عائلة الثبيتي',
      (SELECT id FROM beneficiaries WHERE full_name LIKE '%مرزوق علي الثبيتي%' AND gender = 'ذكر' LIMIT 1),
      'قبيلة الثبيتي',
      'نشط',
      14,
      'العائلة الرئيسية في الوقف'
    )
    RETURNING id INTO family_id;
    
    families_created := 1;
    
    -- ربط المستفيدين بالعائلة
    INSERT INTO family_members (family_id, beneficiary_id, relationship_to_head, is_dependent, priority_level)
    SELECT 
      family_id,
      id,
      CASE 
        WHEN relationship = 'ابن' THEN 'ابن'
        WHEN relationship = 'ابنة' THEN 'بنت'
        WHEN relationship = 'زوجة' THEN 'زوجة'
        ELSE 'أخرى'
      END,
      true,
      COALESCE(priority_level, 1)
    FROM beneficiaries
    WHERE family_name = 'عائلة الثبيتي';
  END IF;
  
  -- إنشاء صناديق الوقف إذا لم تكن موجودة
  IF NOT EXISTS (SELECT 1 FROM funds WHERE name = 'صندوق الأبناء') THEN
    INSERT INTO funds (name, category, description, percentage, allocated_amount, is_active)
    VALUES 
      ('صندوق الأبناء', 'ذكور', 'صندوق توزيع حصص الأبناء الذكور', 40, 0, true),
      ('صندوق البنات', 'إناث', 'صندوق توزيع حصص البنات', 20, 0, true),
      ('صندوق الزوجات', 'إناث', 'صندوق توزيع حصص الزوجات', 30, 0, true),
      ('صندوق الناظر', 'إداري', 'نصيب الناظر من الغلة', 5, 0, true),
      ('صندوق الاحتياطي', 'احتياطي', 'صندوق الاحتياطي العام', 5, 0, true);
    
    funds_created := 5;
  END IF;
  
  -- إنشاء عقود للعقارات إذا لم تكن موجودة
  IF NOT EXISTS (SELECT 1 FROM contracts LIMIT 1) THEN
    INSERT INTO contracts (
      contract_number, 
      property_id, 
      contract_type,
      tenant_name, 
      tenant_id_number,
      tenant_phone,
      tenant_email,
      start_date, 
      end_date, 
      monthly_rent,
      security_deposit,
      payment_frequency,
      status
    )
    SELECT 
      'C-2025-' || LPAD((ROW_NUMBER() OVER ())::text, 4, '0'),
      id,
      'إيجار',
      'مستأجر تجريبي ' || ROW_NUMBER() OVER (),
      '10' || LPAD((1000000000 + ROW_NUMBER() OVER ())::text, 8, '0'),
      '0501234' || LPAD((ROW_NUMBER() OVER ())::text, 3, '0'),
      'tenant' || ROW_NUMBER() OVER () || '@example.com',
      '2025-01-01',
      '2025-12-31',
      50000 + (ROW_NUMBER() OVER () * 10000),
      100000 + (ROW_NUMBER() OVER () * 20000),
      'شهري',
      'نشط'
    FROM properties
    WHERE id IS NOT NULL
    LIMIT 5;
    
    GET DIAGNOSTICS contracts_created = ROW_COUNT;
  END IF;
  
  result := json_build_object(
    'success', true,
    'families_created', families_created,
    'funds_created', funds_created,
    'contracts_created', contracts_created
  );
  
  RETURN result;
END;
$$;
