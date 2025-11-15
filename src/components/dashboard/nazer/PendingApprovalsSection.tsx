import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, TrendingUp, DollarSign, AlertCircle } from "lucide-react";
import { usePendingApprovals } from "@/hooks/usePendingApprovals";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PendingApprovalsSection() {
  const navigate = useNavigate();
  const { data: approvals = [], isLoading, isError, error } = usePendingApprovals();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'distribution': return TrendingUp;
      case 'request': return FileText;
      case 'journal': return FileText;
      case 'payment': return DollarSign;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'distribution': return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200';
      case 'request': return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200';
      case 'journal': return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200';
      case 'payment': return 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  if (isError) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          حدث خطأ في جلب الموافقات المعلقة: {error instanceof Error ? error.message : 'خطأ غير معروف'}
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-9 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 space-x-reverse">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!approvals || approvals.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            الموافقات المعلقة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>لا توجد موافقات معلقة</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            الموافقات المعلقة
            <Badge variant="secondary">{approvals.length}</Badge>
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/approvals')}
          >
            عرض الكل
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {approvals.map((approval) => {
            const Icon = getTypeIcon(approval.type);
            return (
              <div 
                key={approval.id}
                className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => navigate('/approvals')}
              >
                <div className={`p-3 rounded-lg ${getTypeColor(approval.type)}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">{approval.title}</h4>
                    <Badge className={getPriorityColor(approval.priority)} variant="secondary">
                      {approval.priority === 'high' ? 'عاجل' : approval.priority === 'medium' ? 'متوسط' : 'عادي'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{approval.description}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{format(approval.date, 'dd MMM yyyy', { locale: ar })}</span>
                    {approval.amount && (
                      <span className="font-medium">
                        {approval.amount.toLocaleString('ar-SA')} ر.س
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
