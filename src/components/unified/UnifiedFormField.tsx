import { ReactNode } from "react";
import { Control, ControllerRenderProps, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";

// Field Types
export type FieldType =
  | "text"
  | "number"
  | "email"
  | "tel"
  | "password"
  | "textarea"
  | "select"
  | "date"
  | "custom";

// Select Option Type
export interface SelectOption {
  label: string;
  value: string;
}

// Unified Form Field Props
export interface UnifiedFormFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  type?: FieldType;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  required?: boolean;
  
  // Specific props for different types
  options?: SelectOption[]; // for select
  rows?: number; // for textarea
  min?: number; // for number
  max?: number; // for number
  step?: number; // for number
  maxLength?: number; // for text inputs
  
  // Custom render - استخدام ControllerRenderProps للأنواع المحددة
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (field: ControllerRenderProps<TFieldValues, any>) => ReactNode;
  
  // Grid layout
  className?: string;
}

export function UnifiedFormField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  type = "text",
  placeholder,
  description,
  disabled = false,
  required = false,
  options,
  rows = 3,
  min,
  max,
  step,
  maxLength,
  render,
  className,
}: UnifiedFormFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>
            {label}
            {required && <span className="text-destructive mr-1">*</span>}
          </FormLabel>
          <FormControl>
            {render ? (
              render(field)
            ) : type === "textarea" ? (
              <Textarea
                placeholder={placeholder}
                disabled={disabled}
                rows={rows}
                maxLength={maxLength}
                className="resize-none"
                {...field}
              />
            ) : type === "select" && options ? (
              <Select
                disabled={disabled}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder={placeholder || "اختر..."} />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : type === "date" ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                      "w-full justify-start text-right font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {field.value ? (
                      format(new Date(field.value), "PPP", { locale: ar })
                    ) : (
                      <span>{placeholder || "اختر التاريخ"}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => field.onChange(date?.toISOString())}
                    disabled={disabled}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                    locale={ar}
                  />
                </PopoverContent>
              </Popover>
            ) : type === "number" ? (
              <Input
                type="number"
                placeholder={placeholder}
                disabled={disabled}
                min={min}
                max={max}
                step={step}
                {...field}
                onChange={(e) =>
                  field.onChange(e.target.value ? Number(e.target.value) : undefined)
                }
              />
            ) : (
              <Input
                type={type}
                placeholder={placeholder}
                disabled={disabled}
                maxLength={maxLength}
                {...field}
              />
            )}
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Grid Layout Helper Component
interface FormGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function FormGrid({ children, columns = 2, className }: FormGridProps) {
  const gridClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return (
    <div className={cn("grid gap-4", gridClass, className)}>
      {children}
    </div>
  );
}

// Form Section Component
interface FormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
