/**
 * Mock Data for Design Preview
 * بيانات وهمية لعرض المكونات الجديدة
 */

export const mockBeneficiaries = [
  {
    id: "1",
    full_name: "أحمد محمد العتيبي",
    national_id: "1234567890",
    phone: "0512345678",
    category: "أبناء",
    status: "نشط",
    total_received: 125000,
    account_balance: 5000,
    family_size: 5,
    priority_level: 1,
    created_at: "2024-01-15",
  },
  {
    id: "2",
    full_name: "فاطمة علي القحطاني",
    national_id: "9876543210",
    phone: "0551234567",
    category: "بنات",
    status: "نشط",
    total_received: 98000,
    account_balance: 3500,
    family_size: 3,
    priority_level: 2,
    created_at: "2024-02-20",
  },
  {
    id: "3",
    full_name: "عبدالله خالد السالم",
    national_id: "5432167890",
    phone: "0501122334",
    category: "أبناء",
    status: "معلق",
    total_received: 67000,
    account_balance: 1200,
    family_size: 7,
    priority_level: 3,
    created_at: "2024-03-10",
  },
];

export const mockProperties = [
  {
    id: "1",
    property_number: "VL-001",
    property_name: "فيلا الربوة",
    property_type: "فيلا",
    location: "الرياض - حي الربوة",
    area: 450,
    total_units: 1,
    occupied_units: 1,
    annual_revenue: 180000,
    status: "مؤجر",
    last_maintenance: "2024-10-15",
  },
  {
    id: "2",
    property_number: "BR-002",
    property_name: "عمارة النخيل",
    property_type: "عمارة سكنية",
    location: "جدة - حي النخيل",
    area: 850,
    total_units: 12,
    occupied_units: 10,
    annual_revenue: 540000,
    status: "مؤجر جزئيًا",
    last_maintenance: "2024-09-20",
  },
  {
    id: "3",
    property_number: "SH-003",
    property_name: "محلات السوق التجاري",
    property_type: "محلات تجارية",
    location: "الدمام - الشاطئ",
    area: 320,
    total_units: 8,
    occupied_units: 8,
    annual_revenue: 480000,
    status: "مؤجر",
    last_maintenance: "2024-11-01",
  },
];

export const mockFunds = [
  {
    id: "1",
    fund_name: "صندوق الأبناء",
    fund_type: "توزيع دوري",
    total_beneficiaries: 45,
    monthly_distribution: 135000,
    balance: 450000,
    allocation_percentage: 40,
    status: "نشط",
  },
  {
    id: "2",
    fund_name: "صندوق البنات",
    fund_type: "توزيع دوري",
    total_beneficiaries: 38,
    monthly_distribution: 114000,
    balance: 380000,
    allocation_percentage: 30,
    status: "نشط",
  },
  {
    id: "3",
    fund_name: "صندوق الطوارئ",
    fund_type: "فزعات",
    total_beneficiaries: 15,
    monthly_distribution: 45000,
    balance: 200000,
    allocation_percentage: 10,
    status: "نشط",
  },
];

export const mockTransactions = [
  {
    id: "1",
    transaction_date: "2024-11-20",
    beneficiary_name: "أحمد محمد العتيبي",
    transaction_type: "توزيع شهري",
    amount: 3000,
    status: "مكتمل",
    payment_method: "تحويل بنكي",
  },
  {
    id: "2",
    transaction_date: "2024-11-19",
    beneficiary_name: "فاطمة علي القحطاني",
    transaction_type: "توزيع شهري",
    amount: 2500,
    status: "مكتمل",
    payment_method: "تحويل بنكي",
  },
  {
    id: "3",
    transaction_date: "2024-11-18",
    beneficiary_name: "عبدالله خالد السالم",
    transaction_type: "فزعة",
    amount: 5000,
    status: "قيد المعالجة",
    payment_method: "تحويل بنكي",
  },
];

export const mockKPIs = [
  {
    title: "إجمالي المستفيدين",
    value: "156",
    trend: "+5% عن الشهر السابق",
    variant: "default" as const,
  },
  {
    title: "إجمالي التوزيعات",
    value: "450,000 ر.س",
    trend: "+12% عن الشهر السابق",
    variant: "success" as const,
  },
  {
    title: "العقارات النشطة",
    value: "24",
    trend: "ثابت",
    variant: "default" as const,
  },
  {
    title: "الطلبات المعلقة",
    value: "8",
    trend: "-3 عن الأسبوع السابق",
    variant: "warning" as const,
  },
];

export const mockRequests = [
  {
    id: "1",
    request_number: "REQ-2024-001",
    beneficiary_name: "أحمد محمد العتيبي",
    request_type: "فزعة طارئة",
    amount: 5000,
    status: "قيد المراجعة",
    priority: "عاجل",
    created_at: "2024-11-25",
  },
  {
    id: "2",
    request_number: "REQ-2024-002",
    beneficiary_name: "فاطمة علي القحطاني",
    request_type: "قرض حسن",
    amount: 15000,
    status: "قيد الموافقة",
    priority: "متوسط",
    created_at: "2024-11-24",
  },
];

export const mockDocuments = [
  {
    id: "1",
    document_name: "هوية وطنية - أحمد العتيبي",
    document_type: "هوية",
    beneficiary_name: "أحمد محمد العتيبي",
    uploaded_date: "2024-11-15",
    file_size: "2.4 MB",
    status: "معتمد",
  },
  {
    id: "2",
    document_name: "عقد إيجار - فيلا الربوة",
    document_type: "عقد",
    beneficiary_name: "-",
    uploaded_date: "2024-11-10",
    file_size: "1.8 MB",
    status: "معتمد",
  },
];
