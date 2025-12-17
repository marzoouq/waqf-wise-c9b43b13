/**
 * عارض محتوى المستندات الذكي
 * يعرض المحتوى المستخرج من الملفات كجداول تفاعلية
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  ChevronDown, 
  ChevronUp, 
  Search,
  FileText,
  Download,
  Eye
} from "lucide-react";

export interface DocumentItem {
  date?: string;
  description: string;
  amount?: number;
  details?: string;
  reference?: string;
}

export interface ExtractedContent {
  type: string;
  title?: string;
  items: DocumentItem[];
  total?: number;
  summary?: string;
  metadata?: Record<string, string | number>;
}

interface DocumentContentViewerProps {
  content: ExtractedContent;
  documentName: string;
  onViewOriginal?: () => void;
  onDownload?: () => void;
}

export function DocumentContentViewer({
  content,
  documentName,
  onViewOriginal,
  onDownload,
}: DocumentContentViewerProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = content.items.filter(
    (item) =>
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.details?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatAmount = (amount?: number) => {
    if (amount === undefined || amount === null) return "-";
    const formatted = Math.abs(amount).toLocaleString("ar-SA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return amount < 0 ? `(${formatted})` : formatted;
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="p-0 h-auto hover:bg-transparent">
                <div className="flex items-center gap-2">
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                  <FileText className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base">{content.title || documentName}</CardTitle>
                </div>
              </Button>
            </CollapsibleTrigger>
            <div className="flex items-center gap-2">
              {content.total !== undefined && (
                <Badge variant="secondary" className="font-mono">
                  {formatAmount(content.total)} ريال
                </Badge>
              )}
              <Badge variant="outline">{content.items.length} عنصر</Badge>
              {onViewOriginal && (
                <Button variant="ghost" size="icon" onClick={onViewOriginal} title="معاينة الأصل">
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              {onDownload && (
                <Button variant="ghost" size="icon" onClick={onDownload} title="تحميل">
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0">
            {content.summary && (
              <p className="text-sm text-muted-foreground mb-4 p-3 bg-muted/50 rounded-lg">
                {content.summary}
              </p>
            )}

            {content.items.length > 5 && (
              <div className="relative mb-4">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في المحتوى..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pe-10"
                />
              </div>
            )}

            <ScrollArea className="max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    {content.items.some(i => i.date) && (
                      <TableHead className="text-right w-[120px]">التاريخ</TableHead>
                    )}
                    <TableHead className="text-right">الوصف</TableHead>
                    {content.items.some(i => i.reference) && (
                      <TableHead className="text-right w-[120px]">المرجع</TableHead>
                    )}
                    {content.items.some(i => i.amount !== undefined) && (
                      <TableHead className="text-left w-[120px]">المبلغ</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item, index) => (
                    <TableRow key={`${item.description}-${index}`}>
                      {content.items.some(i => i.date) && (
                        <TableCell className="font-mono text-sm">
                          {item.date || "-"}
                        </TableCell>
                      )}
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.description}</p>
                          {item.details && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.details}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      {content.items.some(i => i.reference) && (
                        <TableCell className="font-mono text-sm">
                          {item.reference || "-"}
                        </TableCell>
                      )}
                      {content.items.some(i => i.amount !== undefined) && (
                        <TableCell className={`font-mono text-left ${item.amount && item.amount < 0 ? 'text-destructive' : ''}`}>
                          {formatAmount(item.amount)}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>

            {content.total !== undefined && (
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <span className="font-semibold">الإجمالي</span>
                <span className={`font-mono font-bold text-lg ${content.total < 0 ? 'text-destructive' : 'text-primary'}`}>
                  {formatAmount(content.total)} ريال
                </span>
              </div>
            )}

            {content.metadata && Object.keys(content.metadata).length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">معلومات إضافية</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(content.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{key}:</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
