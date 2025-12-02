import { useState } from "react";
import { useRequestComments } from "@/hooks/useRequestComments";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Send, Trash2, Lock } from "lucide-react";
import { formatRelative } from "@/lib/date";

interface RequestCommentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: string;
  requestNumber: string;
}

export function RequestCommentsDialog({
  open,
  onOpenChange,
  requestId,
  requestNumber,
}: RequestCommentsDialogProps) {
  const { comments, isLoading, addComment, deleteComment } = useRequestComments(requestId);
  const [newComment, setNewComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    await addComment({
      request_id: requestId,
      comment: newComment,
      is_internal: isInternal,
    });

    setNewComment("");
    setIsInternal(false);
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`تعليقات الطلب ${requestNumber}`}
      size="xl"
    >
      <div className="space-y-4">
          {/* نموذج إضافة تعليق جديد */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="comment">تعليق جديد</Label>
              <Textarea
                id="comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="اكتب تعليقك هنا..."
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  id="internal"
                  checked={isInternal}
                  onCheckedChange={setIsInternal}
                />
                <Label htmlFor="internal" className="flex items-center gap-1 cursor-pointer">
                  <Lock className="h-3 w-3" />
                  تعليق داخلي (للموظفين فقط)
                </Label>
              </div>

              <Button type="submit" disabled={!newComment.trim()}>
                <Send className="h-4 w-4 ml-2" />
                إرسال
              </Button>
            </div>
          </form>

          <Separator />

          {/* قائمة التعليقات */}
          <ScrollArea className="h-[400px]">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                جاري التحميل...
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد تعليقات بعد
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-4 rounded-lg border ${
                      comment.is_internal
                        ? "bg-warning-light dark:bg-warning/10 border-warning/30"
                        : "bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {comment.profiles?.full_name || "مستخدم"}
                          </span>
                          {comment.is_internal && (
                            <span className="inline-flex items-center gap-1 text-xs bg-warning-light dark:bg-warning/10 text-warning px-2 py-0.5 rounded">
                              <Lock className="h-3 w-3" />
                              داخلي
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatRelative(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{comment.comment}</p>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteComment(comment.id)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
    </ResponsiveDialog>
  );
}
