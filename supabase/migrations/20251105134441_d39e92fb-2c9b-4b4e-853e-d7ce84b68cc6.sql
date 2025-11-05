-- إضافة indexes لتحسين أداء الاستعلامات

-- Index على created_at للترتيب السريع
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_created_at ON beneficiaries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_distributions_distribution_date ON distributions(distribution_date DESC);

-- Index على الحقول المستخدمة في البحث والتصفية
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_status ON beneficiaries(status);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_category ON beneficiaries(category);

-- Index على journal_entries للبحث السريع
CREATE INDEX IF NOT EXISTS idx_journal_entries_status ON journal_entries(status);
CREATE INDEX IF NOT EXISTS idx_journal_entries_entry_date ON journal_entries(entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_fiscal_year ON journal_entries(fiscal_year_id);

-- Index على invoices للبحث والتصفية
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON invoices(invoice_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);

-- Index على approvals
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);
CREATE INDEX IF NOT EXISTS idx_approvals_journal_entry_id ON approvals(journal_entry_id);

-- Index على accounts للبحث الهرمي
CREATE INDEX IF NOT EXISTS idx_accounts_parent_id ON accounts(parent_id);
CREATE INDEX IF NOT EXISTS idx_accounts_account_type ON accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_accounts_is_active ON accounts(is_active);

-- Composite indexes للاستعلامات المركبة
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_entry_account ON journal_entry_lines(journal_entry_id, account_id);
CREATE INDEX IF NOT EXISTS idx_invoice_lines_invoice_account ON invoice_lines(invoice_id, account_id);
CREATE INDEX IF NOT EXISTS idx_budgets_fiscal_year_account ON budgets(fiscal_year_id, account_id);
