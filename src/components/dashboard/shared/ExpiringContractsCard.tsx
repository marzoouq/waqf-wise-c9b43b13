/**
 * بطاقة العقود المنتهية قريباً
 * Expiring Contracts Card
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileWarning, User, Calendar, ArrowLeft, Building } from 'lucide-react';
import { useCollectionStats } from '@/hooks/dashboard/useCollectionStats';
import { formatCurrency } from '@/lib/formatters';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export function ExpiringContractsCard() {
  const { data: stats, isLoading } = useCollectionStats();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="border-warning/30">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-warning">
            <FileWarning className="h-5 w-5" />
            عقود تنتهي قريباً
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const contracts = stats.expiringContracts;

  return (
    <Card className={contracts.length > 0 ? 'border-warning/30' : ''}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2 text-warning">
            <FileWarning className="h-5 w-5" />
            عقود تنتهي قريباً
          </span>
          {contracts.length > 0 && (
            <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/30">
              {contracts.length} عقد
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {contracts.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <div className="w-12 h-12 rounded-full bg-success/10 mx-auto mb-2 flex items-center justify-center">
              <svg className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm">لا توجد عقود تنتهي خلال 30 يوم</p>
          </div>
        ) : (
          <div className="space-y-3">
            {contracts.map(contract => (
              <div 
                key={contract.id}
                className="flex items-center justify-between p-3 bg-warning/5 rounded-lg border border-warning/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center">
                    <Building className="h-4 w-4 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{contract.tenantName}</p>
                    <p className="text-xs text-muted-foreground">{contract.propertyName}</p>
                  </div>
                </div>
                <div className="text-end">
                  <Badge variant={contract.daysRemaining <= 7 ? 'destructive' : 'secondary'}>
                    {contract.daysRemaining === 0 ? 'اليوم' : `${contract.daysRemaining} يوم`}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(contract.endDate), 'dd MMM yyyy', { locale: ar })}
                  </p>
                </div>
              </div>
            ))}

            {/* زر عرض الكل */}
            <Button 
              variant="outline" 
              className="w-full gap-2 border-warning/30 text-warning hover:bg-warning/10"
              onClick={() => navigate('/contracts')}
            >
              <FileWarning className="h-4 w-4" />
              إدارة العقود
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
