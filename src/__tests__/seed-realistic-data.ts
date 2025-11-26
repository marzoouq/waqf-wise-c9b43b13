/**
 * سكريبت لإضافة بيانات تكميلية واقعية
 * للاستخدام مع المستفيدين الـ 14 الحقيقيين الموجودين
 */

import { supabase } from '@/integrations/supabase/client';
import { mockRealisticProperties } from './fixtures/realistic-properties';
import { mockContracts } from './fixtures/contracts';
import { mockRealisticLoans } from './fixtures/realistic-loans';
import { mockRealisticDistributions, mockDistributionDetails } from './fixtures/realistic-distributions';
import { mockEmergencyAidRequests } from './fixtures/emergency-aid';
import { mockInvoices, mockInvoiceLines } from './fixtures/invoices';

export async function seedRealisticData() {
  console.log('🌱 بدء إضافة البيانات التكميلية الواقعية...');
  console.log('📊 استخدام المستفيدين الـ 14 الحقيقيين الموجودين');

  try {
    // 1. الحصول على المستفيدين الحقيقيين
    console.log('👥 جلب المستفيدين الحقيقيين...');
    const { data: beneficiaries, error: beneficiariesError } = await supabase
      .from('beneficiaries')
      .select('id, full_name, national_id')
      .order('created_at', { ascending: true });

    if (beneficiariesError || !beneficiaries || beneficiaries.length === 0) {
      console.error('❌ خطأ: لا يوجد مستفيدون في القاعدة');
      return { success: false, error: 'لا يوجد مستفيدون' };
    }

    console.log(`✅ تم العثور على ${beneficiaries.length} مستفيد حقيقي`);
    const beneficiaryIds = beneficiaries.map(b => b.id);

    // 2. ربط عائلة الثبيتي (12 مستفيد)
    console.log('👨‍👩‍👧‍👦 ربط عائلة الثبيتي...');
    const thubaiti = beneficiaries.filter(b => b.full_name.includes('الثبيتي'));
    
    if (thubaiti.length > 0) {
      // عبدالله مرزوق كرب الأسرة
      const familyHead = thubaiti.find(b => b.full_name.includes('عبدالله مرزوق'));
      
      if (familyHead) {
        // إنشاء العائلة
        const { data: family } = await supabase
          .from('families')
          .insert({
            family_name: 'عائلة الثبيتي',
            head_of_family_id: familyHead.id,
            tribe: 'الثبيتي',
            total_members: thubaiti.length,
            status: 'نشط',
          })
          .select()
          .single();

        if (family) {
          // تحديث جميع أفراد الثبيتي بمعرف العائلة
          await supabase
            .from('beneficiaries')
            .update({ 
              family_id: family.id,
              family_name: 'عائلة الثبيتي',
            })
            .in('id', thubaiti.map(t => t.id));

          console.log(`✅ تم ربط ${thubaiti.length} فرد من عائلة الثبيتي`);
        }
      }
    }

    // 3. إضافة العقارات الواقعية
    console.log('🏢 إضافة 5 عقارات واقعية...');
    const propertiesData = mockRealisticProperties();
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .insert(propertiesData)
      .select();

    if (propertiesError) {
      console.error('❌ خطأ في إضافة العقارات:', propertiesError);
    } else {
      console.log(`✅ تم إضافة ${properties?.length} عقار`);

      // 4. إضافة العقود المربوطة بالعقارات
      if (properties && properties.length > 0) {
        console.log('📄 إضافة 5 عقود إيجار...');
        const contractsData = mockContracts(properties.map(p => p.id));
        const { data: contracts, error: contractsError } = await supabase
          .from('contracts')
          .insert(contractsData)
          .select();

        if (contractsError) {
          console.error('❌ خطأ في إضافة العقود:', contractsError);
        } else {
          console.log(`✅ تم إضافة ${contracts?.length} عقد`);
        }
      }
    }

    // 5. إضافة التوزيعات الربع سنوية
    console.log('💰 إضافة 4 توزيعات ربع سنوية...');
    const distributionsData = mockRealisticDistributions();
    const { data: distributions, error: distributionsError } = await supabase
      .from('distributions')
      .insert(distributionsData)
      .select();

    if (distributionsError) {
      console.error('❌ خطأ في إضافة التوزيعات:', distributionsError);
    } else {
      console.log(`✅ تم إضافة ${distributions?.length} توزيع`);

      // إضافة تفاصيل التوزيع لجميع المستفيدين
      if (distributions && distributions.length > 0) {
        console.log('📋 إضافة تفاصيل التوزيع لجميع المستفيدين...');
        
        for (const distribution of distributions) {
          const detailsData = mockDistributionDetails(distribution.id, beneficiaryIds);
          await supabase
            .from('distribution_details')
            .insert(detailsData);
        }
        
        console.log(`✅ تم إضافة تفاصيل التوزيع لـ ${beneficiaryIds.length} مستفيد × ${distributions.length} توزيعات`);
      }
    }

    // 6. إضافة القروض (3 قروض فقط)
    console.log('💳 إضافة 3 قروض واقعية...');
    const loansData = mockRealisticLoans(beneficiaryIds.slice(0, 3));
    const { data: loans, error: loansError } = await supabase
      .from('loans')
      .insert(loansData)
      .select();

    if (loansError) {
      console.error('❌ خطأ في إضافة القروض:', loansError);
    } else {
      console.log(`✅ تم إضافة ${loans?.length} قرض`);
    }

    // 7. إضافة طلبات الفزعة
    console.log('🆘 إضافة 5 طلبات فزعة...');
    const emergencyAidData = mockEmergencyAidRequests(beneficiaryIds.slice(0, 5));
    const { data: emergencyAid, error: emergencyError } = await supabase
      .from('emergency_aid_requests')
      .insert(emergencyAidData)
      .select();

    if (emergencyError) {
      console.error('❌ خطأ في إضافة طلبات الفزعة:', emergencyError);
    } else {
      console.log(`✅ تم إضافة ${emergencyAid?.length} طلب فزعة`);
    }

    // 8. إضافة الفواتير
    console.log('🧾 إضافة 10 فواتير متنوعة...');
    const invoicesData = mockInvoices();
    const { data: invoices, error: invoicesError } = await supabase
      .from('invoices')
      .insert(invoicesData)
      .select();

    if (invoicesError) {
      console.error('❌ خطأ في إضافة الفواتير:', invoicesError);
    } else {
      console.log(`✅ تم إضافة ${invoices?.length} فاتورة`);

      // إضافة بنود الفواتير
      if (invoices && invoices.length > 0) {
        const invoiceLinesData = mockInvoiceLines(invoices.map(i => i.id));
        await supabase
          .from('invoice_lines')
          .insert(invoiceLinesData);
        
        console.log('✅ تم إضافة بنود الفواتير');
      }
    }

    console.log('\n🎉 تم إضافة جميع البيانات التكميلية بنجاح!');
    console.log('📊 ملخص البيانات:');
    console.log(`   - المستفيدون الحقيقيون: ${beneficiaries.length}`);
    console.log(`   - العائلات: 1 (عائلة الثبيتي)`);
    console.log(`   - العقارات: ${properties?.length || 0}`);
    console.log(`   - العقود: 5`);
    console.log(`   - التوزيعات: ${distributions?.length || 0}`);
    console.log(`   - القروض: ${loans?.length || 0}`);
    console.log(`   - طلبات الفزعة: ${emergencyAid?.length || 0}`);
    console.log(`   - الفواتير: ${invoices?.length || 0}`);
    
    return {
      success: true,
      counts: {
        beneficiaries: beneficiaries.length,
        properties: properties?.length || 0,
        contracts: 5,
        distributions: distributions?.length || 0,
        loans: loans?.length || 0,
        emergencyAid: emergencyAid?.length || 0,
        invoices: invoices?.length || 0,
      }
    };

  } catch (error) {
    console.error('❌ خطأ عام:', error);
    return { success: false, error };
  }
}

export async function clearRealisticData() {
  console.log('🧹 بدء حذف البيانات التكميلية...');

  try {
    // حذف البيانات بالترتيب العكسي (بسبب العلاقات)
    await supabase.from('invoice_lines').delete().neq('id', '');
    await supabase.from('invoices').delete().neq('id', '');
    await supabase.from('emergency_aid_requests').delete().neq('id', '');
    await supabase.from('loans').delete().neq('id', '');
    await supabase.from('distribution_details').delete().neq('id', '');
    await supabase.from('distributions').delete().neq('id', '');
    await supabase.from('contracts').delete().neq('id', '');
    await supabase.from('properties').delete().neq('id', '');
    
    // تحديث المستفيدين (إزالة ربط العائلة)
    await supabase
      .from('beneficiaries')
      .update({ family_id: null, family_name: null })
      .not('family_id', 'is', null);
    
    // حذف العائلات
    await supabase.from('families').delete().neq('id', '');

    console.log('✅ تم حذف جميع البيانات التكميلية');
    console.log('ℹ️  المستفيدون الـ 14 الحقيقيون لم يُحذفوا');
    
    return { success: true };

  } catch (error) {
    console.error('❌ خطأ في حذف البيانات:', error);
    return { success: false, error };
  }
}

// للاستخدام من Console
if (typeof window !== 'undefined') {
  (window as any).seedRealisticData = seedRealisticData;
  (window as any).clearRealisticData = clearRealisticData;
  console.log('💡 يمكنك استخدام: seedRealisticData() أو clearRealisticData() من الـ Console');
}
