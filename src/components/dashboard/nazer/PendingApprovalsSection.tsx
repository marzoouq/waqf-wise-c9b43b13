import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, TrendingUp, DollarSign, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface PendingApproval {
  id: string;
  type: 'distribution' | 'request' | 'journal' | 'payment';
  title: string;
  amount?: number;
  date: Date;
  priority: 'high' | 'medium' | 'low';
  description: string;
}

export default function PendingApprovalsSection() {
  const navigate = useNavigate();
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPendingApprovals();
    
    // Real-time subscription
    const channel = supabase
      .channel('nazer-approvals')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'distribution_approvals',
        filter: 'level=eq.3'
      }, fetchPendingApprovals)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'request_approvals',
        filter: 'level=eq.3'
      }, fetchPendingApprovals)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      setIsLoading(true);
      const allApprovals: PendingApproval[] = [];

      console.log('🔄 Fetching pending approvals...');

      // جلب موافقات التوزيعات
      const { data: distApprovals, error: distError } = await supabase
        .from('distribution_approvals')
        .select('*, distributions(*)')
        .eq('status', 'معلق')
        .eq('level', 3);

      if (distError) {
        console.error('❌ Error fetching distribution approvals:', distError);
      }

    if (distApprovals) {
      distApprovals.forEach(app => {
        if (app.distributions) {
          allApprovals.push({
            id: app.id,
            type: 'distribution',
            title: `توزيع ${app.distributions.month}`,
            amount: app.distributions.total_amount,
            date: new Date(app.created_at),
            priority: 'high',
            description: `توزيع لـ ${app.distributions.beneficiaries_count} مستفيد`
          });
        }
      });
    }

      // جلب موافقات الطلبات
      const { data: reqApprovals, error: reqError } = await supabase
        .from('request_approvals')
        .select('*, beneficiary_requests(*, beneficiaries(*))')
        .eq('status', 'معلق')
        .eq('level', 3);

      if (reqError) {
        console.error('❌ Error fetching request approvals:', reqError);
      }

    if (reqApprovals) {
      reqApprovals.forEach(app => {
        if (app.beneficiary_requests && app.beneficiary_requests.beneficiaries) {
          allApprovals.push({
            id: app.id,
            type: 'request',
            title: `طلب ${app.beneficiary_requests.request_number || ''}`,
            amount: app.beneficiary_requests.amount,
            date: new Date(app.created_at),
            priority: app.beneficiary_requests.priority === 'عاجلة' ? 'high' : 'medium',
            description: `من ${app.beneficiary_requests.beneficiaries.full_name}`
          });
        }
      });
    }

      // جلب القيود المحاسبية المعلقة
      const { data: journalApprovals, error: journalError } = await supabase
        .from('approvals')
        .select('*, journal_entries(*)')
        .eq('status', 'pending');

      if (journalError) {
        console.error('❌ Error fetching journal approvals:', journalError);
      }

      if (journalApprovals) {
        journalApprovals.forEach(app => {
          if (app.journal_entries) {
            allApprovals.push({
              id: app.id,
              type: 'journal',
              title: `قيد ${app.journal_entries.entry_number}`,
              date: new Date(app.created_at),
              priority: 'medium',
              description: app.journal_entries.description
            });
          }
        });
      }

      // ترتيب حسب الأولوية والتاريخ
      allApprovals.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return b.date.getTime() - a.date.getTime();
      });

      console.log('✅ Fetched approvals:', allApprovals.length);
      setApprovals(allApprovals);
    } catch (error) {
      console.error('❌ Error in fetchPendingApprovals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive' as const;
      case 'medium': return 'default' as const;
      default: return 'secondary' as const;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'distribution': return <TrendingUp className="h-5 w-5" />;
      case 'request': return <FileText className="h-5 w-5" />;
      case 'journal': return <DollarSign className="h-5 w-5" />;
      default: return <AlertCircle className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="border-warning bg-warning/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-warning">
            <Clock className="h-5 w-5 animate-spin" />
            جاري تحميل الموافقات...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (approvals.length === 0) {
    return (
      <Card className="border-success bg-success/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-success">
            <Clock className="h-5 w-5" />
            لا توجد موافقات معلقة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center">
            جميع الموافقات تمت معالجتها 🎉
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-warning bg-warning/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-warning">
            <Clock className="h-5 w-5" />
            موافقات معلقة تحتاج لاعتمادك ({approvals.length})
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
          {approvals.slice(0, 5).map((approval) => (
            <div 
              key={approval.id} 
              className="flex items-center gap-4 p-4 bg-background rounded-lg border hover:border-primary transition-colors"
            >
              <div className="flex-shrink-0">
                {getTypeIcon(approval.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium truncate">{approval.title}</h4>
                  <Badge variant={getPriorityColor(approval.priority)}>
                    {approval.priority === 'high' ? 'عاجل' : approval.priority === 'medium' ? 'متوسط' : 'عادي'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {approval.description}
                </p>
                {approval.amount && (
                  <p className="text-sm font-medium text-primary mt-1">
                    المبلغ: {approval.amount.toLocaleString('ar-SA')} ر.س
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {format(approval.date, 'dd MMMM yyyy - hh:mm a', { locale: ar })}
                </p>
              </div>

              <Button 
                size="sm"
                onClick={() => navigate('/approvals')}
              >
                مراجعة
              </Button>
            </div>
          ))}
        </div>

        {approvals.length > 5 && (
          <Button 
            variant="outline" 
            className="w-full mt-4"
            onClick={() => navigate('/approvals')}
          >
            عرض جميع الموافقات ({approvals.length})
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
