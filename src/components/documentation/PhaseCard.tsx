import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PhaseStatusBadge } from "./PhaseStatusBadge";
import { PhaseProgress } from "./PhaseProgress";
import { PhaseTaskList } from "./PhaseTaskList";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PhaseChangeLog } from "./PhaseChangeLog";
import { Calendar, FileText, History, User } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useState } from "react";
import { useUpdatePhaseStatus } from "@/hooks/useProjectDocumentation";
import type { ProjectPhase } from "@/hooks/useProjectDocumentation";

interface PhaseCardProps {
  phase: ProjectPhase;
}

export const PhaseCard = ({ phase }: PhaseCardProps) => {
  const [status, setStatus] = useState<"completed" | "in_progress" | "planned" | "blocked">(phase.status);
  const [notes, setNotes] = useState("");
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const updateStatus = useUpdatePhaseStatus();

  const handleUpdateStatus = () => {
    updateStatus.mutate(
      { phaseId: phase.id, status, notes },
      {
        onSuccess: () => {
          setShowStatusDialog(false);
          setNotes("");
        },
      }
    );
  };

  const getCategoryBadge = () => {
    const configs = {
      core: { label: "وظيفية", className: "bg-purple-500/10 text-purple-700" },
      design: { label: "تصميم", className: "bg-pink-500/10 text-pink-700" },
      testing: { label: "اختبار", className: "bg-orange-500/10 text-orange-700" },
      future: { label: "مستقبلية", className: "bg-gray-500/10 text-gray-700" },
    };
    const config = configs[phase.category];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="font-mono">
                #{phase.phase_number}
              </Badge>
              {getCategoryBadge()}
              <PhaseStatusBadge status={phase.status} />
            </div>
            <CardTitle className="text-lg">{phase.phase_name}</CardTitle>
            {phase.description && (
              <CardDescription className="mt-2">{phase.description}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <PhaseProgress percentage={phase.completion_percentage} />

        {phase.tasks && phase.tasks.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              المهام ({phase.tasks.filter((t) => t.completed).length}/{phase.tasks.length})
            </h4>
            <PhaseTaskList phaseId={phase.id} tasks={phase.tasks} />
          </div>
        )}

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {phase.start_date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>
                بدأت: {format(new Date(phase.start_date), "PP", { locale: ar })}
              </span>
            </div>
          )}
          {phase.completion_date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>
                انتهت: {format(new Date(phase.completion_date), "PP", { locale: ar })}
              </span>
            </div>
          )}
        </div>

        {phase.notes && (
          <div className="p-3 bg-accent/50 rounded-md text-sm">
            <p className="text-muted-foreground">{phase.notes}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <User className="h-4 w-4 ml-2" />
                تحديث الحالة
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>تحديث حالة المرحلة</DialogTitle>
                <DialogDescription>
                  قم بتحديث حالة المرحلة وإضافة ملاحظات إضافية
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">الحالة</label>
                  <Select value={status} onValueChange={(value) => setStatus(value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">مخططة</SelectItem>
                      <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                      <SelectItem value="completed">مكتملة</SelectItem>
                      <SelectItem value="blocked">معلقة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">ملاحظات</label>
                  <Textarea
                    placeholder="أضف ملاحظات حول التحديث..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>
                <Button
                  onClick={handleUpdateStatus}
                  disabled={updateStatus.isPending}
                  className="w-full"
                >
                  حفظ التحديث
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <History className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>سجل التغييرات</DialogTitle>
                <DialogDescription>
                  جميع التغييرات والتحديثات على هذه المرحلة
                </DialogDescription>
              </DialogHeader>
              <PhaseChangeLog phaseId={phase.id} />
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};
