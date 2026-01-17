/**
 * حوار استلام/تسليم الوحدة
 * نموذج موثق لتسجيل حالة الوحدة عند الاستلام أو التسليم
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  ClipboardCheck, 
  Zap, 
  Droplets,
  Key,
  Car,
  CreditCard,
  Printer,
  Save
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { type Contract } from '@/hooks/property/useContracts';

const handoverSchema = z.object({
  handover_type: z.enum(['تسليم', 'استلام']),
  handover_date: z.string().min(1, 'تاريخ الاستلام مطلوب'),
  electricity_meter_reading: z.string().optional(),
  water_meter_reading: z.string().optional(),
  gas_meter_reading: z.string().optional(),
  keys_count: z.string().optional(),
  parking_cards_count: z.string().optional(),
  access_cards_count: z.string().optional(),
  remote_controls_count: z.string().optional(),
  general_condition: z.enum(['ممتاز', 'جيد جداً', 'جيد', 'مقبول', 'يحتاج صيانة']).optional(),
  cleanliness: z.enum(['نظيف', 'يحتاج تنظيف', 'يحتاج تنظيف عميق']).optional(),
  condition_notes: z.string().optional(),
  witness_name: z.string().optional(),
  notes: z.string().optional(),
});

type HandoverFormValues = z.infer<typeof handoverSchema>;

interface UnitHandoverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: Contract | null;
}

export function UnitHandoverDialog({
  open,
  onOpenChange,
  contract,
}: UnitHandoverDialogProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<HandoverFormValues>({
    resolver: zodResolver(handoverSchema),
    defaultValues: {
      handover_type: 'استلام',
      handover_date: new Date().toISOString().split('T')[0],
      electricity_meter_reading: '',
      water_meter_reading: '',
      gas_meter_reading: '',
      keys_count: '2',
      parking_cards_count: '0',
      access_cards_count: '0',
      remote_controls_count: '0',
      general_condition: 'جيد',
      cleanliness: 'نظيف',
      condition_notes: '',
      witness_name: '',
      notes: '',
    },
  });

  const onSubmit = async (data: HandoverFormValues) => {
    if (!contract) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('unit_handovers').insert({
        contract_id: contract.id,
        handover_type: data.handover_type,
        handover_date: data.handover_date,
        electricity_meter_reading: data.electricity_meter_reading ? parseFloat(data.electricity_meter_reading) : null,
        water_meter_reading: data.water_meter_reading ? parseFloat(data.water_meter_reading) : null,
        gas_meter_reading: data.gas_meter_reading ? parseFloat(data.gas_meter_reading) : null,
        keys_count: data.keys_count ? parseInt(data.keys_count) : 0,
        parking_cards_count: data.parking_cards_count ? parseInt(data.parking_cards_count) : 0,
        access_cards_count: data.access_cards_count ? parseInt(data.access_cards_count) : 0,
        remote_controls_count: data.remote_controls_count ? parseInt(data.remote_controls_count) : 0,
        general_condition: data.general_condition,
        cleanliness: data.cleanliness,
        condition_notes: data.condition_notes,
        witness_name: data.witness_name,
        notes: data.notes,
      });

      if (error) throw error;

      toast.success(`تم تسجيل نموذج ${data.handover_type} الوحدة بنجاح`);
      queryClient.invalidateQueries({ queryKey: ['unit-handovers'] });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error saving handover:', error);
      toast.error('حدث خطأ أثناء حفظ النموذج');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!contract) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            نموذج استلام/تسليم الوحدة
          </DialogTitle>
          <DialogDescription>
            العقد: {contract.contract_number} | المستأجر: {contract.tenant_name}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">البيانات الأساسية</TabsTrigger>
                <TabsTrigger value="meters">قراءات العدادات</TabsTrigger>
                <TabsTrigger value="items">المسلمات</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="handover_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نوع العملية</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر النوع" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="استلام">استلام (من المستأجر)</SelectItem>
                            <SelectItem value="تسليم">تسليم (للمستأجر)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="handover_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تاريخ العملية</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="general_condition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الحالة العامة</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر الحالة" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ممتاز">ممتاز</SelectItem>
                            <SelectItem value="جيد جداً">جيد جداً</SelectItem>
                            <SelectItem value="جيد">جيد</SelectItem>
                            <SelectItem value="مقبول">مقبول</SelectItem>
                            <SelectItem value="يحتاج صيانة">يحتاج صيانة</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cleanliness"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>النظافة</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر الحالة" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="نظيف">نظيف</SelectItem>
                            <SelectItem value="يحتاج تنظيف">يحتاج تنظيف</SelectItem>
                            <SelectItem value="يحتاج تنظيف عميق">يحتاج تنظيف عميق</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="condition_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ملاحظات على الحالة</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="أي ملاحظات على حالة الوحدة أو أضرار موجودة..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="witness_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم الشاهد (اختياري)</FormLabel>
                      <FormControl>
                        <Input placeholder="اسم الشاهد إن وجد" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="meters" className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">قراءات العدادات</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="electricity_meter_reading"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Zap className="h-4 w-4 text-yellow-500" />
                              الكهرباء
                            </FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="قراءة العداد" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="water_meter_reading"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Droplets className="h-4 w-4 text-blue-500" />
                              المياه
                            </FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="قراءة العداد" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="gas_meter_reading"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <span className="text-orange-500">⛽</span>
                              الغاز
                            </FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="قراءة العداد" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="items" className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">المسلمات والمفاتيح</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="keys_count"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Key className="h-4 w-4" />
                              عدد المفاتيح
                            </FormLabel>
                            <FormControl>
                              <Input type="number" min="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="parking_cards_count"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Car className="h-4 w-4" />
                              بطاقات المواقف
                            </FormLabel>
                            <FormControl>
                              <Input type="number" min="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="access_cards_count"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              بطاقات الدخول
                            </FormLabel>
                            <FormControl>
                              <Input type="number" min="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="remote_controls_count"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              📱 أجهزة التحكم
                            </FormLabel>
                            <FormControl>
                              <Input type="number" min="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ملاحظات إضافية</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="أي ملاحظات أخرى..."
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <DialogFooter className="gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin ms-2" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 ms-2" />
                    حفظ النموذج
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
