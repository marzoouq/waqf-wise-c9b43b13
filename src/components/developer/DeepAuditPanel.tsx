/**
 * Deep Audit Panel - لوحة الفحص العميق
 * @version 2.8.71
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDeepCodeAudit, AuditIssue } from '@/hooks/developer/useDeepCodeAudit';
import { 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Info,
  Shield,
  Zap,
  Layers,
  Eye,
  Code
} from 'lucide-react';

const severityConfig = {
  critical: { color: 'bg-red-500', icon: XCircle, label: 'حرج' },
  high: { color: 'bg-orange-500', icon: AlertTriangle, label: 'مرتفع' },
  medium: { color: 'bg-yellow-500', icon: AlertTriangle, label: 'متوسط' },
  low: { color: 'bg-blue-500', icon: Info, label: 'منخفض' },
  info: { color: 'bg-gray-500', icon: Info, label: 'معلومات' },
};

const categoryConfig = {
  performance: { icon: Zap, label: 'الأداء', color: 'text-yellow-500' },
  architecture: { icon: Layers, label: 'المعمارية', color: 'text-purple-500' },
  security: { icon: Shield, label: 'الأمان', color: 'text-red-500' },
  accessibility: { icon: Eye, label: 'الوصولية', color: 'text-blue-500' },
  'best-practices': { icon: CheckCircle, label: 'أفضل الممارسات', color: 'text-green-500' },
  types: { icon: Code, label: 'الأنواع', color: 'text-indigo-500' },
};

function IssueCard({ issue }: { issue: AuditIssue }) {
  const severity = severityConfig[issue.severity];
  const category = categoryConfig[issue.category];
  const SeverityIcon = severity.icon;
  const CategoryIcon = category.icon;

  return (
    <div className="p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-start gap-3">
        <div className={`p-1.5 rounded ${severity.color} text-white`}>
          <SeverityIcon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm truncate">{issue.title}</h4>
            <Badge variant="outline" className="text-xs">
              <CategoryIcon className={`h-3 w-3 me-1 ${category.color}`} />
              {category.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
          {issue.suggestion && (
            <p className="text-xs text-primary/80 bg-primary/10 p-2 rounded">
              💡 {issue.suggestion}
            </p>
          )}
          {issue.file && (
            <p className="text-xs text-muted-foreground mt-1">
              📁 {issue.file}{issue.line ? `:${issue.line}` : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ScoreCircle({ score }: { score: number }) {
  const getColor = (s: number) => {
    if (s >= 90) return 'text-green-500';
    if (s >= 70) return 'text-yellow-500';
    if (s >= 50) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="relative w-24 h-24">
      <svg className="w-24 h-24 transform -rotate-90">
        <circle
          cx="48"
          cy="48"
          r="40"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-muted/20"
        />
        <circle
          cx="48"
          cy="48"
          r="40"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeDasharray={`${score * 2.51} 251`}
          className={getColor(score)}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-2xl font-bold ${getColor(score)}`}>{score}</span>
      </div>
    </div>
  );
}

export function DeepAuditPanel() {
  const { isAuditing, progress, report, runAudit, clearReport } = useDeepCodeAudit();
  const [filter, setFilter] = useState<string>('all');

  const filteredIssues = report?.issues.filter(issue => {
    if (filter === 'all') return true;
    return issue.severity === filter || issue.category === filter;
  }) || [];

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            الفحص العميق للتطبيق
          </CardTitle>
          <div className="flex gap-2">
            {report && (
              <Button variant="outline" size="sm" onClick={clearReport}>
                مسح
              </Button>
            )}
            <Button 
              onClick={runAudit} 
              disabled={isAuditing}
              size="sm"
            >
              {isAuditing ? 'جاري الفحص...' : 'بدء الفحص'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isAuditing && (
          <div className="space-y-3 py-4">
            <div className="flex justify-between text-sm">
              <span>{progress.phase}</span>
              <span>{progress.progress}%</span>
            </div>
            <Progress value={progress.progress} />
            <p className="text-xs text-muted-foreground text-center">
              {progress.currentCheck}
            </p>
          </div>
        )}

        {!isAuditing && !report && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">فحص شامل للتطبيق</h3>
            <p className="text-sm text-muted-foreground mb-4">
              اضغط على "بدء الفحص" لتحليل الأداء والمعمارية والأمان
            </p>
          </div>
        )}

        {report && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <ScoreCircle score={Math.round(report.score)} />
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-red-500">{report.criticalCount + report.highCount}</p>
                  <p className="text-xs text-muted-foreground">حرجة</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-500">{report.mediumCount}</p>
                  <p className="text-xs text-muted-foreground">متوسطة</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-500">{report.lowCount + report.infoCount}</p>
                  <p className="text-xs text-muted-foreground">منخفضة</p>
                </div>
              </div>
            </div>

            {/* Category Scores */}
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(report.categories).map(([key, score]) => {
                const config = categoryConfig[key as keyof typeof categoryConfig];
                const Icon = config.icon;
                return (
                  <div key={key} className="p-2 border rounded text-center">
                    <Icon className={`h-4 w-4 mx-auto mb-1 ${config.color}`} />
                    <p className="text-xs text-muted-foreground">{config.label}</p>
                    <p className="font-bold">{score}%</p>
                  </div>
                );
              })}
            </div>

            {/* Filters */}
            <div className="flex gap-1 flex-wrap">
              <Badge 
                variant={filter === 'all' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setFilter('all')}
              >
                الكل ({report.totalIssues})
              </Badge>
              {Object.entries(severityConfig).map(([key, config]) => {
                const count = report.issues.filter(i => i.severity === key).length;
                if (count === 0) return null;
                return (
                  <Badge
                    key={key}
                    variant={filter === key ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setFilter(key)}
                  >
                    {config.label} ({count})
                  </Badge>
                );
              })}
            </div>

            {/* Issues List */}
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {filteredIssues.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
                    <p className="text-muted-foreground">لا توجد مشاكل!</p>
                  </div>
                ) : (
                  filteredIssues.map(issue => (
                    <IssueCard key={issue.id} issue={issue} />
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="text-xs text-muted-foreground text-center border-t pt-2">
              تم الفحص في {new Date(report.timestamp).toLocaleString('ar-SA')} 
              ({report.duration}ms)
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
