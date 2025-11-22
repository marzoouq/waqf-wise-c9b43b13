export interface AnnualDisclosure {
  id: string;
  year: number;
  waqf_name: string;
  total_revenues: number;
  total_expenses: number;
  net_income: number;
  status: string;
  disclosure_date: string;
  created_at: string;
}

export interface DisclosurePayload {
  new: AnnualDisclosure;
  old: AnnualDisclosure | null;
}
