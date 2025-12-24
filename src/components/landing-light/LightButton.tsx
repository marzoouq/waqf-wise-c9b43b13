/**
 * مكون زر خفيف بدون Radix UI - مع دعم إمكانية الوصول
 */
import React from "react";

interface LightButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "outline";
  className?: string;
}

export function LightButton({ 
  children, 
  variant = "primary", 
  className = "",
  ...props 
}: LightButtonProps) {
  const baseStyles = "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200 px-6 py-3 text-base min-h-[48px] select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
  
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl",
    outline: "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground"
  };
  
  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
