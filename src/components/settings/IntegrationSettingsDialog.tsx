import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Settings, Save, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface IntegrationSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integration: {
    id: string;
    type: "bank" | "payment" | "government";
    name: string;
    is_active: boolean;
    api_endpoint?: string;
    api_version?: string;
    configuration?: Record<string, unknown>;
  } | null;
  onUpdate: () => void;
}

export function IntegrationSettingsDialog({
  open,
  onOpenChange,
  integration,
  onUpdate,
}: IntegrationSettingsDialogProps) {
  const [isActive, setIsActive] = useState(false);
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [apiVersion, setApiVersion] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open && integration) {
      setIsActive(integration.is_active);
      setApiEndpoint(integration.api_endpoint || "");
      setApiVersion(integration.api_version || "");
    }
  }, [open, integration]);

  const getTableName = () => {
    switch (integration?.type) {
      case "bank":
        return "bank_integrations";
      case "payment":
        return "payment_gateways";
      case "government":
        return "government_integrations";
      default:
        return "";
    }
  };

  const handleSave = async () => {
    if (!integration) return;
    
    setIsSaving(true);
    try {
      const tableName = getTableName();
      if (!tableName) throw new Error("Unknown integration type");

      const updateData: Record<string, unknown> = { is_active: isActive };
      
      if (integration.type === "bank") {
        updateData.api_endpoint = apiEndpoint;
        updateData.api_version = apiVersion;
      }

      const { error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq("id", integration.id);

      if (error) throw error;

      toast.success("تم حفظ إعدادات التكامل");
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving integration settings:", error);
      toast.error("فشل في حفظ الإعدادات");
    } finally {
      setIsSaving(false);
    }
  };

  if (!integration) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            إعدادات {integration.name}
          </DialogTitle>
          <DialogDescription>
            تكوين إعدادات التكامل والاتصال
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <Label>حالة التكامل</Label>
              <p className="text-sm text-muted-foreground">
                تفعيل أو تعطيل هذا التكامل
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isActive ? "default" : "secondary"}>
                {isActive ? "نشط" : "غير نشط"}
              </Badge>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>

          {/* API Settings (for bank integrations) */}
          {integration.type === "bank" && (
            <>
              <div className="space-y-2">
                <Label>نقطة النهاية (API Endpoint)</Label>
                <Input
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  placeholder="https://api.example.com/v1"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label>إصدار API</Label>
                <Input
                  value={apiVersion}
                  onChange={(e) => setApiVersion(e.target.value)}
                  placeholder="v1.0"
                  dir="ltr"
                />
              </div>
            </>
          )}

          {/* Documentation Link */}
          <Button variant="outline" className="w-full" asChild>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 ms-2" />
              عرض وثائق التكامل
            </a>
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 ms-2" />
            {isSaving ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
