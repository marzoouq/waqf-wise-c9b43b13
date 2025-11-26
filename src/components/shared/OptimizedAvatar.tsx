/**
 * مكون Avatar محسّن للأداء
 * يستخدم LazyImage لتحميل الصور بكفاءة
 */

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LazyImage } from './LazyImage';
import { User } from 'lucide-react';

interface OptimizedAvatarProps {
  src?: string | null;
  alt: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

const imageSizes = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
};

export function OptimizedAvatar({
  src,
  alt,
  fallback,
  size = 'md',
  className,
}: OptimizedAvatarProps) {
  return (
    <Avatar className={`${sizeClasses[size]} ${className || ''}`}>
      {src ? (
        <AvatarImage asChild>
          <LazyImage
            src={src}
            alt={alt}
            width={imageSizes[size]}
            height={imageSizes[size]}
            priority={false}
            responsive={false}
            quality={80}
          />
        </AvatarImage>
      ) : null}
      <AvatarFallback>
        {fallback ? (
          fallback
        ) : (
          <User className="h-1/2 w-1/2 text-muted-foreground" />
        )}
      </AvatarFallback>
    </Avatar>
  );
}
