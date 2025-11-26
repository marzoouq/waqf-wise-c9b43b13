import { Progress } from "@/components/ui/progress";

interface PhaseProgressProps {
  percentage: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export const PhaseProgress = ({ percentage, showLabel = true, size = "md" }: PhaseProgressProps) => {
  const getProgressColor = () => {
    if (percentage === 100) return "bg-emerald-500";
    if (percentage >= 75) return "bg-blue-500";
    if (percentage >= 50) return "bg-amber-500";
    if (percentage >= 25) return "bg-orange-500";
    return "bg-gray-400";
  };

  const height = size === "sm" ? "h-1.5" : size === "md" ? "h-2" : "h-3";

  return (
    <div className="space-y-1">
      <Progress 
        value={percentage} 
        className={`${height} ${getProgressColor()}`}
      />
      {showLabel && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>نسبة الإنجاز</span>
          <span className="font-medium">{percentage}%</span>
        </div>
      )}
    </div>
  );
};
