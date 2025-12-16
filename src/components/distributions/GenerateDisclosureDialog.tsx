import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, FileText } from "lucide-react";
import { useAnnualDisclosures } from "@/hooks/reports/useAnnualDisclosures";

const disclosureSchema = z.object({
  year: z.coerce.number().min(2020, "السنة يجب أن تكون 2020 أو أحدث").max(2100),
  waqfName: z.string().min(1, "اسم الوقف مطلوب"),
});

type DisclosureFormValues = z.infer<typeof disclosureSchema>;

interface GenerateDisclosureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GenerateDisclosureDialog = ({
  open,
  onOpenChange,
}: GenerateDisclosureDialogProps) => {
  const { generateDisclosure } = useAnnualDisclosures();
  const [generating, setGenerating] = useState(false);

  const form = useForm<DisclosureFormValues>({
    resolver: zodResolver(disclosureSchema),
    defaultValues: {
      year: new Date().getFullYear(),
      waqfName: "",
    },
  });

  const handleSubmit = async (data: DisclosureFormValues) => {
    setGenerating(true);
    try {
      await generateDisclosure({
        year: data.year,
        waqfName: data.waqfName,
      });
      form.reset();
      onOpenChange(false);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="إنشاء إفصاح سنوي جديد"
      description="سيتم توليد الإفصاح السنوي تلقائياً من البيانات المالية والتوزيعات"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>السنة المالية</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="2020"
                    max="2100"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  اختر السنة المالية التي تريد إنشاء الإفصاح لها
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="waqfName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اسم الوقف</FormLabel>
                <FormControl>
                  <Input
                    placeholder="مثال: وقف آل فلان الخيري"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  اسم الوقف كما سيظهر في الإفصاح السنوي
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={generating}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري التوليد...
                </>
              ) : (
                <>
                  <FileText className="ml-2 h-4 w-4" />
                  توليد الإفصاح
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveDialog>
  );
};
