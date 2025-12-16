import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAgentAvailability, useUpdateAvailability } from '@/hooks/support/useAgentAvailability';
import { useAuth } from '@/contexts/AuthContext';
import { User, AlertCircle } from 'lucide-react';

export function AgentAvailabilityCard() {
  const { user } = useAuth();
  const { data: availability } = useAgentAvailability(user?.id);
  const updateAvailability = useUpdateAvailability();
  const [isAvailable, setIsAvailable] = useState(true);

  // تحديث الحالة عند تحميل البيانات
  useEffect(() => {
    if (availability) {
      setIsAvailable(availability.is_available ?? true);
    }
  }, [availability]);

  const handleToggleAvailability = async () => {
    if (!user) return;
    
    const newStatus = !isAvailable;
    setIsAvailable(newStatus);
    
    await updateAvailability.mutateAsync({
      userId: user.id,
      isAvailable: newStatus,
    });
  };

  if (!availability) {
    return null;
  }

  const loadPercentage = availability.max_capacity > 0
    ? (availability.current_load / availability.max_capacity) * 100
    : 0;

  const loadColor = loadPercentage >= 80 ? 'destructive' : loadPercentage >= 60 ? 'warning' : 'default';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              حالة التوافر
            </CardTitle>
            <CardDescription>
              إدارة توافرك لاستقبال التذاكر
            </CardDescription>
          </div>
          <Badge variant={isAvailable ? 'default' : 'secondary'}>
            {isAvailable ? 'متاح' : 'غير متاح'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="availability-toggle">متاح لاستقبال تذاكر جديدة</Label>
            <p className="text-sm text-muted-foreground">
              عند التعطيل، لن يتم تعيين تذاكر جديدة لك
            </p>
          </div>
          <Switch
            id="availability-toggle"
            checked={isAvailable}
            onCheckedChange={handleToggleAvailability}
            disabled={updateAvailability.isPending}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">الحمل الحالي</span>
            <span className="font-medium">
              {availability.current_load} / {availability.max_capacity}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                loadPercentage >= 80 ? 'bg-destructive' :
                loadPercentage >= 60 ? 'bg-warning' :
                'bg-primary'
              }`}
              style={{ width: `${Math.min(loadPercentage, 100)}%` }}
            />
          </div>
        </div>

        {loadPercentage >= 80 && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-destructive">تحذير: اقتربت من الحد الأقصى</p>
              <p className="text-muted-foreground">
                تقترب من الحد الأقصى للتذاكر. قد ترغب في تعطيل التوافر مؤقتاً.
              </p>
            </div>
          </div>
        )}

        {availability.skills && availability.skills.length > 0 && (
          <div className="space-y-2">
            <Label>المهارات</Label>
            <div className="flex flex-wrap gap-2">
              {availability.skills.map((skill) => (
                <Badge key={skill} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
