/**
 * Hook لجلب مستفيدي الإفصاح
 * @version 2.8.67
 * 
 * يستخدم DisclosureService للوصول لقاعدة البيانات
 */

import { DisclosureService } from "@/services/disclosure.service";

export async function getDisclosureBeneficiaries(disclosureId: string) {
  return DisclosureService.getBeneficiaries(disclosureId);
}
