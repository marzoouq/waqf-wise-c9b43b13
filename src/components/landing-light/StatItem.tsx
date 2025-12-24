/**
 * مكون إحصائية
 */
import React from "react";

interface StatItemProps {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  suffix: string;
  label: string;
  color: string;
}

export function StatItem({ icon: Icon, value, suffix, label, color }: StatItemProps) {
  return (
    <div className="relative group">
      <div className="flex flex-col items-center text-center p-6 sm:p-8">
        <div
          className={`inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${color} mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
        >
          <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-primary-foreground" />
        </div>
        <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-2">
          <span>{value.toLocaleString("ar-SA")}</span>
          <span className="text-primary">{suffix}</span>
        </div>
        <p className="text-muted-foreground text-sm sm:text-base font-medium">{label}</p>
      </div>
    </div>
  );
}
