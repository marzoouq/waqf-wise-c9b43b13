import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Receipt, CheckCircle } from "lucide-react";
import { ContractFormData } from "./useContractForm";

interface Props {
  formData: ContractFormData;
  onUpdate: (updates: Partial<ContractFormData>) => void;
}

export const ContractTaxOptions = ({ formData, onUpdate }: Props) => {
  const handleTaxChange = (value: string) => {
    const isExempt = value === "exempt";
    onUpdate({
      is_tax_exempt: isExempt,
      tax_percentage: isExempt ? "0" : "15",
    });
  };

  const currentValue = formData.is_tax_exempt ? "exempt" : "taxable";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Receipt className="h-4 w-4" />
          ضريبة القيمة المضافة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <RadioGroup
          value={currentValue}
          onValueChange={handleTaxChange}
          className="flex flex-col gap-3"
        >
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
            <RadioGroupItem value="exempt" id="tax-exempt" />
            <Label htmlFor="tax-exempt" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="font-medium">معفي من الضريبة (0%)</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                للعقارات السكنية والإيجارات المعفاة
              </p>
            </Label>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
            <RadioGroupItem value="taxable" id="tax-taxable" />
            <Label htmlFor="tax-taxable" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-warning" />
                <span className="font-medium">خاضع للضريبة (15%)</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                للعقارات التجارية والمحلات
              </p>
            </Label>
          </div>
        </RadioGroup>

        {!formData.is_tax_exempt && formData.monthly_rent && (
          <Alert className="bg-warning/10 border-warning/30">
            <AlertDescription className="text-sm">
              <div className="flex justify-between items-center">
                <span>الضريبة الشهرية المتوقعة:</span>
                <span className="font-bold">
                  {(parseFloat(formData.monthly_rent) * 0.15).toLocaleString('ar-SA')} ر.س
                </span>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
