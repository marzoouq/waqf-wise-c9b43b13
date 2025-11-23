import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGovernanceDecisions } from "@/hooks/useGovernanceDecisions";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { 
  Users, 
  UserCheck, 
  UsersRound, 
  UserCog,
  User
} from "lucide-react";

const decisionSchema = z.object({
  decision_title: z.string().min(5, "العنوان قصير جداً"),
  decision_text: z.string().min(20, "نص القرار قصير جداً"),
  decision_type: z.enum(['قرار', 'توصية', 'تكليف']),
  voting_participants_type: z.enum([
    'board_only',
    'first_class_beneficiaries',
    'board_and_beneficiaries',
    'custom',
    'nazer_only'
  ]),
  pass_threshold: z.number().min(1).max(100).default(50),
});

type DecisionFormData = z.infer<typeof decisionSchema>;

interface CreateDecisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId?: string;
  meetingId?: string;
}

export function CreateDecisionDialog({ 
  open, 
  onOpenChange, 
  boardId, 
  meetingId 
}: CreateDecisionDialogProps) {
  const { createDecision } = useGovernanceDecisions();
  const { toast } = useToast();

  const form = useForm<DecisionFormData>({
    resolver: zodResolver(decisionSchema),
    defaultValues: {
      decision_type: 'قرار',
      voting_participants_type: 'board_only',
      pass_threshold: 50,
    },
  });

  const onSubmit = async (data: DecisionFormData) => {
    try {
      const decisionNumber = `D-${Date.now().toString().slice(-6)}`;
      const decisionDate = new Date().toISOString().split('T')[0];
      
      await createDecision({
        decision_number: decisionNumber,
        decision_date: decisionDate,
        decision_title: data.decision_title,
        decision_text: data.decision_text,
        decision_type: data.decision_type,
        voting_participants_type: data.voting_participants_type,
        pass_threshold: data.pass_threshold,
        board_id: boardId || null,
        meeting_id: meetingId || null,
        requires_voting: data.voting_participants_type !== 'nazer_only',
      });
      
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء القرار",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إنشاء قرار جديد</DialogTitle>
          <DialogDescription>
            املأ تفاصيل القرار وحدد المشاركين في التصويت ونسبة القبول المطلوبة
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="decision_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عنوان القرار *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="مثال: الموافقة على توزيع غلة الوقف للربع الأول" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="decision_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نص القرار *</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} placeholder="نص القرار التفصيلي..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Card className="p-6 border-primary/20">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                نظام التصويت
              </h3>

              <FormField
                control={form.control}
                name="voting_participants_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">من له حق التصويت؟ *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-1 gap-4 mt-3"
                      >
                        <label
                          htmlFor="board_only"
                          className="flex items-start gap-4 rounded-lg border-2 p-4 cursor-pointer hover:bg-accent/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                        >
                          <RadioGroupItem value="board_only" id="board_only" className="mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 font-semibold">
                              <Users className="h-5 w-5 text-primary" />
                              أعضاء المجلس فقط
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              يصوت أعضاء المجلس أو اللجنة فقط (الطريقة التقليدية)
                            </p>
                          </div>
                        </label>

                        <label
                          htmlFor="first_class"
                          className="flex items-start gap-4 rounded-lg border-2 p-4 cursor-pointer hover:bg-accent/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                        >
                          <RadioGroupItem value="first_class_beneficiaries" id="first_class" className="mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 font-semibold">
                              <UserCheck className="h-5 w-5 text-green-600" />
                              المستفيدين من الفئة الأولى فقط
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              يصوت المستفيدون من الفئة الأولى فقط (الوقف الذري - استشارة الأهل)
                            </p>
                          </div>
                        </label>

                        <label
                          htmlFor="both"
                          className="flex items-start gap-4 rounded-lg border-2 p-4 cursor-pointer hover:bg-accent/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                        >
                          <RadioGroupItem value="board_and_beneficiaries" id="both" className="mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 font-semibold">
                              <UsersRound className="h-5 w-5 text-blue-600" />
                              أعضاء المجلس + المستفيدين من الفئة الأولى
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              يشارك كل من أعضاء المجلس والمستفيدين من الفئة الأولى في التصويت
                            </p>
                          </div>
                        </label>

                        <label
                          htmlFor="custom"
                          className="flex items-start gap-4 rounded-lg border-2 p-4 cursor-pointer hover:bg-accent/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                        >
                          <RadioGroupItem value="custom" id="custom" className="mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 font-semibold">
                              <UserCog className="h-5 w-5 text-purple-600" />
                              اختيار مخصص
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              اختر أشخاص محددين بالاسم للتصويت على هذا القرار
                            </p>
                          </div>
                        </label>

                        <label
                          htmlFor="nazer"
                          className="flex items-start gap-4 rounded-lg border-2 p-4 cursor-pointer hover:bg-accent/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                        >
                          <RadioGroupItem value="nazer_only" id="nazer" className="mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 font-semibold">
                              <User className="h-5 w-5 text-warning" />
                              قرار الناظر (بدون تصويت)
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              قرار مباشر من الناظر بدون الحاجة لتصويت
                            </p>
                          </div>
                        </label>
                      </RadioGroup>
                    </FormControl>
                    <FormDescription className="mt-3">
                      💡 اختر من له حق التصويت على هذا القرار حسب أهميته ونوع الوقف
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('voting_participants_type') !== 'nazer_only' && (
                <FormField
                  control={form.control}
                  name="pass_threshold"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>نسبة الموافقة المطلوبة (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="100" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        نسبة الموافقة المطلوبة لاعتماد القرار (الافتراضي: 50%)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </Card>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
              <Button type="submit">
                إنشاء القرار وفتح التصويت
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
