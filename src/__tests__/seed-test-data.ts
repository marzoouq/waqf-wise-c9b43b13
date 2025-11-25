/**
 * سكريبت لإضافة بيانات وهمية حقيقية للقاعدة
 * لاستخدامها في الاختبارات والتطوير
 */

import { supabase } from '@/integrations/supabase/client';
import { mockBeneficiaries } from './fixtures/beneficiaries';
import { mockProperties } from './fixtures/properties';
import { mockDistributions } from './fixtures/distributions';
import { mockChartOfAccounts, mockJournalEntries } from './fixtures/accounting';
import { mockRequestTypes, mockBeneficiaryRequests } from './fixtures/requests';
import { mockLoans } from './fixtures/loans';
import { mockDocuments } from './fixtures/documents';

export async function seedTestData() {
  console.log('🌱 بدء إضافة البيانات الوهمية...');

  try {
    // 1. إضافة المستفيدين
    console.log('👥 إضافة المستفيدين...');
    const beneficiariesData = mockBeneficiaries(20);
    const { data: beneficiaries, error: beneficiariesError } = await supabase
      .from('beneficiaries')
      .insert(beneficiariesData)
      .select();

    if (beneficiariesError) {
      console.error('❌ خطأ في إضافة المستفيدين:', beneficiariesError);
    } else {
      console.log(`✅ تم إضافة ${beneficiaries?.length} مستفيد`);
    }

    // 2. إضافة عائلة
    console.log('👨‍👩‍👧‍👦 إضافة عائلة...');
    const familyHeadData = {
      full_name: 'عبدالله بن محمد العتيبي',
      national_id: '1111111111',
      phone: '0501111111',
      category: 'أسر منتجة',
      is_head_of_family: true,
      family_name: 'عائلة العتيبي',
      family_size: 5,
    };
    
    const { data: familyHead } = await supabase
      .from('beneficiaries')
      .insert([familyHeadData])
      .select()
      .single();

    if (familyHead) {
      // إضافة أفراد العائلة
      const familyMembers = [
        {
          full_name: 'خالد بن عبدالله',
          national_id: '2222222222',
          phone: '0502222222',
          category: 'أسر منتجة',
          relationship: 'ابن',
          parent_beneficiary_id: familyHead.id,
        },
        {
          full_name: 'فاطمة بنت عبدالله',
          national_id: '3333333333',
          phone: '0503333333',
          category: 'أسر منتجة',
          relationship: 'ابنة',
          gender: 'أنثى',
          parent_beneficiary_id: familyHead.id,
        },
      ];

      await supabase.from('beneficiaries').insert(familyMembers);
      console.log('✅ تم إضافة عائلة كاملة');
    }

    // 3. إضافة العقارات
    console.log('🏢 إضافة العقارات...');
    const propertiesData = mockProperties(15);
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .insert(propertiesData)
      .select();

    if (propertiesError) {
      console.error('❌ خطأ في إضافة العقارات:', propertiesError);
    } else {
      console.log(`✅ تم إضافة ${properties?.length} عقار`);
    }

    // 4. إضافة التوزيعات
    console.log('💰 إضافة التوزيعات...');
    const distributionsData = mockDistributions(12);
    const { data: distributions, error: distributionsError } = await supabase
      .from('distributions')
      .insert(distributionsData)
      .select();

    if (distributionsError) {
      console.error('❌ خطأ في إضافة التوزيعات:', distributionsError);
    } else {
      console.log(`✅ تم إضافة ${distributions?.length} توزيع`);
    }

    // 5. إضافة شجرة الحسابات
    console.log('📊 إضافة شجرة الحسابات...');
    const accountsData = mockChartOfAccounts();
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .insert(accountsData)
      .select();

    if (accountsError) {
      console.error('❌ خطأ في إضافة الحسابات:', accountsError);
    } else {
      console.log(`✅ تم إضافة ${accounts?.length} حساب`);
    }

    // 6. إضافة القيود المحاسبية
    console.log('📝 إضافة القيود المحاسبية...');
    const journalEntriesData = mockJournalEntries(20);
    const { data: journalEntries, error: journalError } = await supabase
      .from('journal_entries')
      .insert(journalEntriesData)
      .select();

    if (journalError) {
      console.error('❌ خطأ في إضافة القيود:', journalError);
    } else {
      console.log(`✅ تم إضافة ${journalEntries?.length} قيد محاسبي`);
    }

    // 7. إضافة أنواع الطلبات
    console.log('📋 إضافة أنواع الطلبات...');
    const requestTypesData = mockRequestTypes();
    const { data: requestTypes, error: requestTypesError } = await supabase
      .from('request_types')
      .insert(requestTypesData)
      .select();

    if (requestTypesError) {
      console.error('❌ خطأ في إضافة أنواع الطلبات:', requestTypesError);
    } else {
      console.log(`✅ تم إضافة ${requestTypes?.length} نوع طلب`);

      // إضافة طلبات للمستفيدين
      if (beneficiaries && beneficiaries.length > 0 && requestTypes && requestTypes.length > 0) {
        const requestsData = mockBeneficiaryRequests(
          beneficiaries[0].id,
          requestTypes.map(rt => rt.id),
          10
        );

        const { error: requestsError } = await supabase
          .from('beneficiary_requests')
          .insert(requestsData);

        if (!requestsError) {
          console.log('✅ تم إضافة 10 طلبات');
        }
      }
    }

    // 8. إضافة القروض
    if (beneficiaries && beneficiaries.length > 0) {
      console.log('💳 إضافة القروض...');
      const loansData = mockLoans(
        beneficiaries.slice(0, 5).map(b => b.id),
        10
      );

      const { data: loans, error: loansError } = await supabase
        .from('loans')
        .insert(loansData)
        .select();

      if (loansError) {
        console.error('❌ خطأ في إضافة القروض:', loansError);
      } else {
        console.log(`✅ تم إضافة ${loans?.length} قرض`);
      }
    }

    // 9. إضافة المستندات
    console.log('📄 إضافة المستندات...');
    const documentsData = mockDocuments(30);
    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .insert(documentsData)
      .select();

    if (documentsError) {
      console.error('❌ خطأ في إضافة المستندات:', documentsError);
    } else {
      console.log(`✅ تم إضافة ${documents?.length} مستند`);
    }

    console.log('\n🎉 تم إضافة جميع البيانات الوهمية بنجاح!');
    
    return {
      success: true,
      counts: {
        beneficiaries: beneficiaries?.length || 0,
        properties: properties?.length || 0,
        distributions: distributions?.length || 0,
        accounts: accounts?.length || 0,
        journalEntries: journalEntries?.length || 0,
        requestTypes: requestTypes?.length || 0,
        documents: documents?.length || 0,
      }
    };

  } catch (error) {
    console.error('❌ خطأ عام:', error);
    return { success: false, error };
  }
}

export async function clearTestData() {
  console.log('🧹 بدء حذف البيانات الوهمية...');

  try {
    // حذف البيانات بالترتيب العكسي (بسبب العلاقات)
    await supabase.from('beneficiary_requests').delete().neq('id', '');
    await supabase.from('loans').delete().neq('id', '');
    await supabase.from('documents').delete().neq('id', '');
    await supabase.from('journal_entries').delete().neq('id', '');
    await supabase.from('accounts').delete().neq('id', '');
    await supabase.from('distributions').delete().neq('id', '');
    await supabase.from('properties').delete().neq('id', '');
    await supabase.from('beneficiaries').delete().neq('id', '');
    await supabase.from('request_types').delete().neq('id', '');

    console.log('✅ تم حذف جميع البيانات الوهمية');
    return { success: true };

  } catch (error) {
    console.error('❌ خطأ في حذف البيانات:', error);
    return { success: false, error };
  }
}

// للاستخدام من Console
if (typeof window !== 'undefined') {
  (window as any).seedTestData = seedTestData;
  (window as any).clearTestData = clearTestData;
  console.log('💡 يمكنك استخدام: seedTestData() أو clearTestData() من الـ Console');
}
