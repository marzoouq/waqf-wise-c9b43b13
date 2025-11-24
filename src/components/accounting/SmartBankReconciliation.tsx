import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { useBankMatching } from '@/hooks/useBankMatching';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Props {
  statementId: string;
}

export function SmartBankReconciliation({ statementId }: Props) {
  const { autoMatch, manualMatch, matches, isLoading } = useBankMatching();
  const [isMatching, setIsMatching] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const handleAutoMatch = async () => {
    setIsMatching(true);
    try {
      const result = await autoMatch({ statementId });
      setSuggestions(result.suggestions);
    } catch (error) {
      console.error('Error auto-matching:', error);
    } finally {
      setIsMatching(false);
    }
  };

  const handleAcceptSuggestion = async (suggestion: any) => {
    try {
      await manualMatch({
        bankTransactionId: suggestion.bankTransactionId,
        journalEntryId: suggestion.journalEntryId,
        notes: `مطابقة مقترحة بثقة ${(suggestion.confidence * 100).toFixed(0)}%`,
      });
      setSuggestions(suggestions.filter(s => s !== suggestion));
    } catch (error) {
      console.error('Error accepting suggestion:', error);
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9) {
      return <Badge className="bg-green-500">ثقة عالية {(confidence * 100).toFixed(0)}%</Badge>;
    } else if (confidence >= 0.7) {
      return <Badge className="bg-yellow-500">ثقة متوسطة {(confidence * 100).toFixed(0)}%</Badge>;
    } else {
      return <Badge variant="secondary">ثقة منخفضة {(confidence * 100).toFixed(0)}%</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                المطابقة الذكية
              </CardTitle>
              <CardDescription>
                استخدم الذكاء الاصطناعي لمطابقة العمليات البنكية مع القيود المحاسبية تلقائياً
              </CardDescription>
            </div>
            <Button onClick={handleAutoMatch} disabled={isMatching}>
              {isMatching ? 'جاري المطابقة...' : 'بدء المطابقة التلقائية'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isMatching && (
            <div className="space-y-2">
              <Progress value={66} className="h-2" />
              <p className="text-sm text-muted-foreground text-center">
                جاري تحليل العمليات ومطابقتها...
              </p>
            </div>
          )}

          {!isMatching && suggestions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-primary/10 rounded-lg">
                <TrendingUp className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <h4 className="font-semibold">تم العثور على {suggestions.length} اقتراح مطابقة</h4>
                  <p className="text-sm text-muted-foreground">
                    راجع الاقتراحات أدناه وقم بقبول أو رفض كل واحدة منها
                  </p>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الثقة</TableHead>
                      <TableHead>العملية البنكية</TableHead>
                      <TableHead>القيد المحاسبي</TableHead>
                      <TableHead>السبب</TableHead>
                      <TableHead className="text-left">الإجراء</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suggestions.map((suggestion, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{getConfidenceBadge(suggestion.confidence)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{suggestion.bankTransactionId.substring(0, 8)}...</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{suggestion.journalEntryId.substring(0, 8)}...</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {suggestion.reason}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleAcceptSuggestion(suggestion)}
                            >
                              <CheckCircle2 className="h-4 w-4 ml-1" />
                              قبول
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSuggestions(suggestions.filter(s => s !== suggestion))}
                            >
                              تجاهل
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {!isMatching && suggestions.length === 0 && matches.length > 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
              <h4 className="font-semibold mb-2">تمت المطابقة بنجاح!</h4>
              <p className="text-sm text-muted-foreground">
                تم مطابقة جميع العمليات المتاحة. يمكنك مراجعة النتائج في قائمة المطابقات.
              </p>
            </div>
          )}

          {!isMatching && suggestions.length === 0 && matches.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                انقر على "بدء المطابقة التلقائية" لبدء عملية المطابقة الذكية
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>المطابقات المكتملة</CardTitle>
          <CardDescription>سجل المطابقات التي تم إجراؤها</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>النوع</TableHead>
                  <TableHead>العملية البنكية</TableHead>
                  <TableHead>القيد المحاسبي</TableHead>
                  <TableHead>درجة الثقة</TableHead>
                  <TableHead>التاريخ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      لا توجد مطابقات بعد
                    </TableCell>
                  </TableRow>
                ) : (
                  matches.slice(0, 10).map((match) => (
                    <TableRow key={match.id}>
                      <TableCell>
                        <Badge variant={match.match_type === 'auto' ? 'default' : 'secondary'}>
                          {match.match_type === 'auto' ? 'تلقائي' : 'يدوي'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {match.bank_transaction_id.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="text-sm">
                        {match.journal_entry_id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        {match.confidence_score ? `${(match.confidence_score * 100).toFixed(0)}%` : '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(match.matched_at).toLocaleDateString('ar-SA')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
