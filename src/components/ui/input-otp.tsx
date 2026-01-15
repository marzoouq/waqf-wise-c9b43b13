/**
 * Input OTP Component
 * مكون إدخال رمز التحقق
 * @version 1.0.0
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export interface InputOTPProps {
  maxLength: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const InputOTPContext = React.createContext<{
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  disabled?: boolean;
}>({
  value: "",
  onChange: () => {},
  maxLength: 6,
  disabled: false,
});

export function InputOTP({
  maxLength,
  value,
  onChange,
  disabled,
  className,
  children,
}: InputOTPProps) {
  return (
    <InputOTPContext.Provider value={{ value, onChange, maxLength, disabled }}>
      <div className={cn("flex items-center gap-2", className)} dir="ltr">
        {children}
      </div>
    </InputOTPContext.Provider>
  );
}

export function InputOTPGroup({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {children}
    </div>
  );
}

export function InputOTPSlot({
  index,
  className,
}: {
  index: number;
  className?: string;
}) {
  const { value, onChange, maxLength, disabled } = React.useContext(InputOTPContext);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const char = value[index] || "";
  const isFocused = React.useRef(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChar = e.target.value.slice(-1);
    if (!/^\d*$/.test(newChar)) return;

    const newValue = value.split("");
    newValue[index] = newChar;
    const updatedValue = newValue.join("").slice(0, maxLength);
    onChange(updatedValue);

    // Move to next input
    if (newChar && index < maxLength - 1) {
      const nextInput = inputRef.current?.parentElement?.parentElement?.querySelectorAll("input")[index + 1];
      nextInput?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !char && index > 0) {
      const prevInput = inputRef.current?.parentElement?.parentElement?.querySelectorAll("input")[index - 1];
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, maxLength);
    if (pastedData) {
      onChange(pastedData);
      const lastIndex = Math.min(pastedData.length - 1, maxLength - 1);
      const lastInput = inputRef.current?.parentElement?.parentElement?.querySelectorAll("input")[lastIndex];
      lastInput?.focus();
    }
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        maxLength={1}
        value={char}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        disabled={disabled}
        className={cn(
          "w-10 h-12 text-center text-lg font-semibold p-0",
          "focus:ring-2 focus:ring-primary focus:border-primary",
          className
        )}
      />
    </div>
  );
}

export function InputOTPSeparator({ className }: { className?: string }) {
  return (
    <div className={cn("text-muted-foreground px-1", className)}>
      <span>-</span>
    </div>
  );
}
