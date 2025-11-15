import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

/**
 * تحويل string إلى SHA-1 hash باستخدام Web Crypto API
 */
async function sha1(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.toUpperCase();
}

/**
 * Hook للتحقق من كلمات المرور المسربة
 * يستخدم Have I Been Pwned API v3 (k-Anonymity model)
 */
export function useLeakedPassword() {
  const [isChecking, setIsChecking] = useState(false);

  /**
   * التحقق من كلمة المرور باستخدام k-Anonymity
   * @param password كلمة المرور للتحقق منها
   * @returns true إذا كانت مسربة
   */
  const checkPassword = async (password: string): Promise<boolean> => {
    if (!password || password.length < 6) {
      return false;
    }

    setIsChecking(true);
    try {
      // Hash كلمة المرور باستخدام SHA-1
      const sha1Hash = await sha1(password);
      const prefix = sha1Hash.substring(0, 5);
      const suffix = sha1Hash.substring(5);

      // استخدام Have I Been Pwned API (k-Anonymity model)
      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      
      if (!response.ok) {
        logger.error(new Error('Failed to check password'), { context: 'leaked_password_api', severity: 'medium' });
        return false;
      }

      const data = await response.text();
      const hashes = data.split('\n');
      
      // البحث عن الـ suffix في القائمة
      const isLeaked = hashes.some(line => {
        const [hashSuffix] = line.split(':');
        return hashSuffix === suffix;
      });

      // حفظ النتيجة في قاعدة البيانات
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('leaked_password_checks').insert({
          user_id: user.id,
          password_hash: sha1Hash,
          is_leaked: isLeaked,
        });
      }

      return isLeaked;
    } catch (error) {
      logger.error(error, { context: 'check_leaked_password', severity: 'medium' });
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  /**
   * التحقق السريع بدون حفظ في قاعدة البيانات
   */
  const checkPasswordQuick = async (password: string): Promise<boolean> => {
    if (!password || password.length < 6) {
      return false;
    }

    try {
      const sha1Hash = await sha1(password);
      const prefix = sha1Hash.substring(0, 5);
      const suffix = sha1Hash.substring(5);

      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      
      if (!response.ok) {
        return false;
      }

      const data = await response.text();
      const hashes = data.split('\n');
      
      return hashes.some(line => {
        const [hashSuffix] = line.split(':');
        return hashSuffix === suffix;
      });
    } catch (error) {
      logger.error(error, { context: 'check_leaked_password_quick', severity: 'low' });
      return false;
    }
  };

  return {
    checkPassword,
    checkPasswordQuick,
    isChecking,
  };
}
