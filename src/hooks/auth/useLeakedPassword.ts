import { useState } from 'react';
import { SecurityService } from '@/services/security.service';
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
   */
  const checkPassword = async (password: string): Promise<boolean> => {
    if (!password || password.length < 6) {
      return false;
    }

    setIsChecking(true);
    try {
      const sha1Hash = await sha1(password);
      const prefix = sha1Hash.substring(0, 5);
      const suffix = sha1Hash.substring(5);

      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      
      if (!response.ok) {
        logger.error(new Error('Failed to check password'), { context: 'leaked_password_api', severity: 'medium' });
        return false;
      }

      const data = await response.text();
      const hashes = data.split('\n');
      
      const isLeaked = hashes.some(line => {
        const [hashSuffix] = line.split(':');
        return hashSuffix === suffix;
      });

      // حفظ النتيجة عبر SecurityService
      try {
        const user = await SecurityService.getCurrentUser();
        if (user) {
          await SecurityService.saveLeakedPasswordCheck(user.id, sha1Hash, isLeaked);
        }
      } catch {
        // تجاهل أخطاء الحفظ
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
