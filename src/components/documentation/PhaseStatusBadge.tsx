import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Circle, AlertCircle } from "lucide-react";

interface PhaseStatusBadgeProps {
  status: "completed" | "in_progress" | "planned" | "blocked";
  size?: "sm" | "md" | "lg";
}

export const PhaseStatusBadge = ({ status, size = "md" }: PhaseStatusBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case "completed":
        return {
          label: "مكتملة",
          variant: "default" as const,
          icon: CheckCircle2,
          className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20",
        };
      case "in_progress":
        return {
          label: "قيد التنفيذ",
          variant: "secondary" as const,
          icon: Clock,
          className: "bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-500/20",
        };
      case "planned":
        return {
          label: "مخططة",
          variant: "outline" as const,
          icon: Circle,
          className: "bg-gray-500/10 text-gray-700 dark:text-gray-400 hover:bg-gray-500/20",
        };
      case "blocked":
        return {
          label: "معلقة",
          variant: "destructive" as const,
          icon: AlertCircle,
          className: "bg-red-500/10 text-red-700 dark:text-red-400 hover:bg-red-500/20",
        };
      default:
        return {
          label: status,
          variant: "outline" as const,
          icon: Circle,
          className: "",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  const iconSize = size === "sm" ? 12 : size === "md" ? 14 : 16;

  return (
    <Badge variant={config.variant} className={`gap-1 ${config.className}`}>
      <Icon size={iconSize} />
      <span>{config.label}</span>
    </Badge>
  );
};
