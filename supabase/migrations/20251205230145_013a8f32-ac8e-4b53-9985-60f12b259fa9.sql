
-- تصحيح تاريخ التوزيع القديم للسنة المالية 2024-2025
UPDATE heir_distributions 
SET distribution_date = '2024-11-11'
WHERE fiscal_year_id = 'e2553250-35d4-43f0-bf02-439225128749';

-- إضافة توزيعات جديدة للسنة المالية 2025-2026 (1,000,000 ر.س)

-- الزوجات (62,500 لكل واحدة)
INSERT INTO heir_distributions (beneficiary_id, fiscal_year_id, share_amount, heir_type, distribution_date, is_historical)
VALUES 
('4f4e83f3-bc9c-40ab-ac23-5640d8a933f8', 'a51951b9-3687-489d-9861-5790e5e9a492', 62500, 'زوجة', '2025-11-15', false),
('b1be6a8f-4fe1-4172-be9f-bbf6da3892af', 'a51951b9-3687-489d-9861-5790e5e9a492', 62500, 'زوجة', '2025-11-15', false);

-- الأبناء (102,941.18 لكل واحد)
INSERT INTO heir_distributions (beneficiary_id, fiscal_year_id, share_amount, heir_type, distribution_date, is_historical)
VALUES 
('ff096d2b-5658-4445-b00d-54a97cc9aedc', 'a51951b9-3687-489d-9861-5790e5e9a492', 102941.18, 'ابن', '2025-11-15', false),
('fa62ea58-688d-424e-aa28-40624f226b6a', 'a51951b9-3687-489d-9861-5790e5e9a492', 102941.18, 'ابن', '2025-11-15', false),
('eb23c29e-84a4-4bcd-a566-4fb75d0ec92c', 'a51951b9-3687-489d-9861-5790e5e9a492', 102941.18, 'ابن', '2025-11-15', false),
('77fcc58b-78dc-4f75-ac80-2a261f1478a8', 'a51951b9-3687-489d-9861-5790e5e9a492', 102941.18, 'ابن', '2025-11-15', false),
('7e38e686-919b-4e49-b8e6-384322172cb8', 'a51951b9-3687-489d-9861-5790e5e9a492', 102941.18, 'ابن', '2025-11-15', false);

-- البنات (51,470.59 لكل واحدة، والأخيرة 51,470.53 للتسوية)
INSERT INTO heir_distributions (beneficiary_id, fiscal_year_id, share_amount, heir_type, distribution_date, is_historical)
VALUES 
('50eeadc9-4c94-45d7-98f2-1d17dbe023de', 'a51951b9-3687-489d-9861-5790e5e9a492', 51470.59, 'بنت', '2025-11-15', false),
('d56931a3-f6e9-4978-bca7-8d103739608c', 'a51951b9-3687-489d-9861-5790e5e9a492', 51470.59, 'بنت', '2025-11-15', false),
('97444fa3-4cfe-4748-9306-bef4fb5aa9ec', 'a51951b9-3687-489d-9861-5790e5e9a492', 51470.59, 'بنت', '2025-11-15', false),
('22183008-dfbb-4118-9a32-10710204962f', 'a51951b9-3687-489d-9861-5790e5e9a492', 51470.59, 'بنت', '2025-11-15', false),
('90b8f4d2-f618-418d-850f-5c9abd0b0f2b', 'a51951b9-3687-489d-9861-5790e5e9a492', 51470.59, 'بنت', '2025-11-15', false),
('2854ab9e-cb8b-4593-9567-62d662a90085', 'a51951b9-3687-489d-9861-5790e5e9a492', 51470.59, 'بنت', '2025-11-15', false),
('a2f9472a-7eee-48ea-8494-cdd327c72c60', 'a51951b9-3687-489d-9861-5790e5e9a492', 51470.53, 'بنت', '2025-11-15', false);
