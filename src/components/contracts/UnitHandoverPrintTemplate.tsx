/**
 * قالب طباعة نموذج استلام/تسليم الوحدة
 * متوافق مع منصة إيجار
 */

import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';

interface UnitHandover {
  id: string;
  handover_type: string;
  handover_date: string;
  electricity_meter_reading: number | null;
  water_meter_reading: number | null;
  gas_meter_reading: number | null;
  keys_count: number | null;
  parking_cards_count: number | null;
  access_cards_count: number | null;
  remote_controls_count: number | null;
  general_condition: string | null;
  cleanliness: string | null;
  condition_notes: string | null;
  witness_name: string | null;
  notes: string | null;
  landlord_signature: string | null;
  tenant_signature: string | null;
  created_at: string;
}

interface ContractInfo {
  contract_number: string;
  tenant_name: string;
  tenant_phone: string;
  tenant_id_number: string;
  property_name?: string;
  property_location?: string;
  monthly_rent: number;
}

interface UnitHandoverPrintTemplateProps {
  handover: UnitHandover;
  contract: ContractInfo;
  onPrint?: () => void;
}

export function UnitHandoverPrintTemplate({
  handover,
  contract,
  onPrint,
}: UnitHandoverPrintTemplateProps) {
  const handlePrint = () => {
    window.print();
    onPrint?.();
  };

  return (
    <div className="print-container">
      {/* أزرار الطباعة - تظهر فقط على الشاشة */}
      <div className="print:hidden flex justify-end gap-2 mb-4">
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="h-4 w-4 ms-2" />
          طباعة
        </Button>
        <Button variant="outline">
          <Download className="h-4 w-4 ms-2" />
          تحميل PDF
        </Button>
      </div>

      {/* محتوى النموذج للطباعة */}
      <div className="bg-white p-8 print:p-4" dir="rtl">
        {/* الترويسة */}
        <div className="text-center border-b-2 border-primary pb-4 mb-6">
          <h1 className="text-2xl font-bold text-primary">
            نموذج {handover.handover_type} الوحدة العقارية
          </h1>
          <p className="text-muted-foreground mt-1">
            وفق نظام الإيجار السعودي
          </p>
        </div>

        {/* بيانات العقد والأطراف */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-primary border-b pb-2 mb-3">
              بيانات العقد
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">رقم العقد:</span>
                <span className="font-medium">{contract.contract_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">العقار:</span>
                <span className="font-medium">{contract.property_name || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">الموقع:</span>
                <span className="font-medium">{contract.property_location || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">قيمة الإيجار:</span>
                <span className="font-medium">{contract.monthly_rent.toLocaleString()} ر.س</span>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-primary border-b pb-2 mb-3">
              بيانات المستأجر
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">الاسم:</span>
                <span className="font-medium">{contract.tenant_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">رقم الهوية:</span>
                <span className="font-medium">{contract.tenant_id_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">الجوال:</span>
                <span className="font-medium">{contract.tenant_phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">تاريخ {handover.handover_type}:</span>
                <span className="font-medium">
                  {format(new Date(handover.handover_date), 'dd/MM/yyyy', { locale: ar })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* قراءات العدادات */}
        <div className="border rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-primary border-b pb-2 mb-3">
            قراءات العدادات
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="text-yellow-600 font-semibold">⚡ الكهرباء</div>
              <div className="text-xl font-bold mt-1">
                {handover.electricity_meter_reading ?? 'لم تُسجل'}
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-blue-600 font-semibold">💧 المياه</div>
              <div className="text-xl font-bold mt-1">
                {handover.water_meter_reading ?? 'لم تُسجل'}
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3">
              <div className="text-orange-600 font-semibold">⛽ الغاز</div>
              <div className="text-xl font-bold mt-1">
                {handover.gas_meter_reading ?? 'لم تُسجل'}
              </div>
            </div>
          </div>
        </div>

        {/* المسلمات */}
        <div className="border rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-primary border-b pb-2 mb-3">
            المسلمات والمفاتيح
          </h3>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="border rounded p-3">
              <div className="text-muted-foreground text-sm">🔑 المفاتيح</div>
              <div className="text-lg font-bold">{handover.keys_count}</div>
            </div>
            <div className="border rounded p-3">
              <div className="text-muted-foreground text-sm">🚗 بطاقات المواقف</div>
              <div className="text-lg font-bold">{handover.parking_cards_count}</div>
            </div>
            <div className="border rounded p-3">
              <div className="text-muted-foreground text-sm">💳 بطاقات الدخول</div>
              <div className="text-lg font-bold">{handover.access_cards_count}</div>
            </div>
            <div className="border rounded p-3">
              <div className="text-muted-foreground text-sm">📱 أجهزة التحكم</div>
              <div className="text-lg font-bold">{handover.remote_controls_count}</div>
            </div>
          </div>
        </div>

        {/* حالة الوحدة */}
        <div className="border rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-primary border-b pb-2 mb-3">
            حالة الوحدة
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">الحالة العامة:</span>
              <span className="font-medium">{handover.general_condition || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">النظافة:</span>
              <span className="font-medium">{handover.cleanliness || '-'}</span>
            </div>
          </div>
          {handover.condition_notes && (
            <div className="bg-muted/50 rounded p-3">
              <div className="text-sm text-muted-foreground mb-1">ملاحظات على الحالة:</div>
              <div className="text-sm">{handover.condition_notes}</div>
            </div>
          )}
        </div>

        {/* ملاحظات عامة */}
        {handover.notes && (
          <div className="border rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-primary border-b pb-2 mb-3">
              ملاحظات عامة
            </h3>
            <p className="text-sm">{handover.notes}</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-6 mt-8 pt-6 border-t">
          <div className="text-center">
            <div className="border-b-2 border-dashed border-gray-400 h-16 mb-2"></div>
            <div className="font-semibold">توقيع المؤجر</div>
            <div className="text-sm text-muted-foreground mt-1">
              {handover.landlord_signature ? '✓ تم التوقيع' : 'لم يوقع بعد'}
            </div>
          </div>
          <div className="text-center">
            <div className="border-b-2 border-dashed border-gray-400 h-16 mb-2"></div>
            <div className="font-semibold">توقيع المستأجر</div>
            <div className="text-sm text-muted-foreground mt-1">
              {handover.tenant_signature ? '✓ تم التوقيع' : 'لم يوقع بعد'}
            </div>
          </div>
          <div className="text-center">
            <div className="border-b-2 border-dashed border-gray-400 h-16 mb-2"></div>
            <div className="font-semibold">توقيع الشاهد</div>
            <div className="text-sm text-muted-foreground mt-1">
              {handover.witness_name || 'لا يوجد شاهد'}
            </div>
          </div>
        </div>

        {/* التذييل */}
        <div className="text-center text-xs text-muted-foreground mt-8 pt-4 border-t">
          <p>تم إنشاء هذا النموذج بتاريخ {format(new Date(handover.created_at), 'dd/MM/yyyy HH:mm', { locale: ar })}</p>
          <p className="mt-1">نظام إدارة الأوقاف - جميع الحقوق محفوظة</p>
        </div>
      </div>

      {/* أنماط الطباعة */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
