import { useState, useMemo } from 'react';
import { useInvoices } from './useInvoices';
import { toast } from 'sonner';

type Invoice = {
  id: string;
  invoice_number: string;
  invoice_date: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  total_amount: number;
  tax_amount: number;
  status: string;
};

const ITEMS_PER_PAGE = 20;

export function useInvoicesPage() {
  const { invoices, isLoading, deleteInvoice } = useInvoices();
  
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Statistics
  const statistics = useMemo(() => {
    if (!invoices) return {
      totalSales: 0,
      paidCount: 0,
      pendingCount: 0,
      overdueAmount: 0,
      overdueCount: 0,
      totalCount: 0
    };

    return {
      totalSales: invoices
        .filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + i.total_amount, 0),
      
      paidCount: invoices.filter(i => i.status === 'paid').length,
      
      pendingCount: invoices.filter(i => 
        i.status === 'sent' || i.status === 'draft'
      ).length,
      
      overdueAmount: invoices
        .filter(i => i.status === 'overdue')
        .reduce((sum, i) => sum + i.total_amount, 0),
      
      overdueCount: invoices.filter(i => i.status === 'overdue').length,
      
      totalCount: invoices.length
    };
  }, [invoices]);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    if (!invoices) return [];
    
    return invoices.filter(invoice => {
      const matchesSearch = 
        invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.customer_name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      
      const matchesDateRange = 
        (!dateFrom || invoice.invoice_date >= dateFrom) &&
        (!dateTo || invoice.invoice_date <= dateTo);
      
      return matchesSearch && matchesStatus && matchesDateRange;
    });
  }, [invoices, searchQuery, statusFilter, dateFrom, dateTo]);

  // Paginated invoices
  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredInvoices.slice(startIndex, endIndex);
  }, [filteredInvoices, currentPage]);

  const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);

  const handleDeleteClick = (invoiceId: string, status: string) => {
    if (status === 'paid') {
      toast.error('لا يمكن حذف فاتورة مدفوعة');
      return;
    }
    setInvoiceToDelete(invoiceId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (invoiceToDelete) {
      await deleteInvoice(invoiceToDelete);
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    }
  };

  const handleEditClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsEditMode(true);
    setAddDialogOpen(true);
  };

  const handleAddNew = () => {
    setIsEditMode(false);
    setSelectedInvoice(null);
    setAddDialogOpen(true);
  };

  const handleViewInvoice = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setViewDialogOpen(true);
  };

  return {
    // Data
    invoices,
    filteredInvoices,
    paginatedInvoices,
    statistics,
    isLoading,
    
    // Pagination
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage: ITEMS_PER_PAGE,
    
    // Filters
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    
    // Dialog States
    addDialogOpen,
    setAddDialogOpen,
    viewDialogOpen,
    setViewDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    selectedInvoiceId,
    invoiceToDelete,
    isEditMode,
    selectedInvoice,
    
    // Handlers
    handleDeleteClick,
    handleDeleteConfirm,
    handleEditClick,
    handleAddNew,
    handleViewInvoice,
  };
}
