import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Printer, Send, Search, Calendar, DollarSign, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format, parseISO } from "date-fns";

interface LoanInvoice {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deviceDescription: string;
  serviceDescription: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string;
  status: "pending" | "overdue" | "paid" | "cancelled";
  notes?: string;
  createdAt: string;
}

export default function LoanInvoices() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState<LoanInvoice | null>(null);

  const { data: invoices = [], isLoading } = useQuery<LoanInvoice[]>({
    queryKey: ["/api/loan-invoices"],
  });

  const { data: customers = [] } = useQuery<any[]>({
    queryKey: ["/api/customers"],
  });

  const [formData, setFormData] = useState({
    customerId: "",
    deviceDescription: "",
    serviceDescription: "",
    totalAmount: "",
    paidAmount: "0",
    dueDate: new Date().toISOString().split('T')[0],
    notes: "",
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: any) => {
      // Convert date string to proper Date object
      const invoiceData = {
        ...data,
        dueDate: new Date(data.dueDate).toISOString(),
        totalAmount: parseFloat(data.totalAmount),
        paidAmount: parseFloat(data.paidAmount),
      };
      const response = await apiRequest("POST", "/api/loan-invoices", invoiceData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Loan invoice created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/loan-invoices"] });
      setIsDialogOpen(false);
      setFormData({
        customerId: "",
        deviceDescription: "",
        serviceDescription: "",
        totalAmount: "",
        paidAmount: "0",
        dueDate: new Date().toISOString().split('T')[0],
        notes: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const printInvoice = (invoice: LoanInvoice) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice - ${invoice.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company-name { font-size: 24px; font-weight: bold; color: #333; }
            .invoice-details { display: flex; justify-content: space-between; margin: 30px 0; }
            .customer-info, .invoice-info { width: 48%; }
            .section-title { font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
            .service-details { margin: 30px 0; }
            .amount-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .amount-table th, .amount-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            .amount-table th { background-color: #f5f5f5; }
            .total-row { font-weight: bold; background-color: #f9f9f9; }
            .payment-status { text-align: center; margin: 20px 0; }
            .status-pending { color: #f59e0b; }
            .status-overdue { color: #ef4444; }
            .status-paid { color: #10b981; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">LeulNet Computer Services</div>
            <p>Professional Computer Repair & Services</p>
          </div>
          
          <div class="invoice-details">
            <div class="customer-info">
              <div class="section-title">Bill To:</div>
              <p><strong>${invoice.customerName}</strong></p>
              <p>Email: ${invoice.customerEmail}</p>
              <p>Phone: ${invoice.customerPhone}</p>
            </div>
            <div class="invoice-info">
              <div class="section-title">Invoice Details:</div>
              <p><strong>Invoice #:</strong> ${invoice.id.substring(0, 8)}</p>
              <p><strong>Date:</strong> ${format(parseISO(invoice.createdAt), "MMM dd, yyyy")}</p>
              <p><strong>Due Date:</strong> ${format(parseISO(invoice.dueDate), "MMM dd, yyyy")}</p>
            </div>
          </div>

          <div class="service-details">
            <div class="section-title">Service Details:</div>
            <p><strong>Device:</strong> ${invoice.deviceDescription}</p>
            <p><strong>Service:</strong> ${invoice.serviceDescription}</p>
            ${invoice.notes ? `<p><strong>Notes:</strong> ${invoice.notes}</p>` : ''}
          </div>

          <table class="amount-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total Service Amount</td>
                <td>$${invoice.totalAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Amount Paid</td>
                <td>$${invoice.paidAmount.toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td><strong>Remaining Balance</strong></td>
                <td><strong>$${invoice.remainingAmount.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>

          <div class="payment-status">
            <p class="status-${invoice.status}"><strong>Status: ${invoice.status.toUpperCase()}</strong></p>
          </div>

          <div class="footer">
            <p>Thank you for choosing LeulNet Computer Services!</p>
            <p>Please contact us if you have any questions about this invoice.</p>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const sendInvoiceEmail = async (invoice: LoanInvoice) => {
    try {
      await apiRequest("POST", `/api/loan-invoices/${invoice.id}/send-email`, {});
      toast({
        title: "Success",
        description: "Invoice sent to customer email.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invoice email.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId || !formData.deviceDescription || !formData.serviceDescription || !formData.totalAmount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const remainingAmount = parseFloat(formData.totalAmount) - parseFloat(formData.paidAmount);
    createInvoiceMutation.mutate({
      ...formData,
      totalAmount: parseFloat(formData.totalAmount),
      paidAmount: parseFloat(formData.paidAmount),
      remainingAmount,
    });
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.deviceDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "overdue": return "bg-red-100 text-red-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return <div>Loading invoices...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Loan Invoices</h1>
            <p className="text-muted-foreground">Manage payment requests for services with loans</p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Loan Invoice</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="customerId">Customer</Label>
                <Select 
                  value={formData.customerId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, customerId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer: any) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="deviceDescription">Device Description</Label>
                <Input
                  id="deviceDescription"
                  value={formData.deviceDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, deviceDescription: e.target.value }))}
                  placeholder="e.g., iPhone 13 Pro"
                  required
                />
              </div>

              <div>
                <Label htmlFor="serviceDescription">Service Description</Label>
                <Input
                  id="serviceDescription"
                  value={formData.serviceDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, serviceDescription: e.target.value }))}
                  placeholder="e.g., Screen replacement"
                  required
                />
              </div>

              <div>
                <Label htmlFor="totalAmount">Total Amount</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  step="0.01"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="paidAmount">Amount Paid</Label>
                <Input
                  id="paidAmount"
                  type="number"
                  step="0.01"
                  value={formData.paidAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, paidAmount: e.target.value }))}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes"
                />
              </div>

              <Button type="submit" className="w-full" disabled={createInvoiceMutation.isPending}>
                {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${invoices.reduce((sum, inv) => sum + inv.remainingAmount, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoices.filter(inv => inv.status === "pending").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {invoices.filter(inv => inv.status === "overdue").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid This Month</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {invoices.filter(inv => inv.status === "paid").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle>Loan Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredInvoices.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No invoices found. Create your first loan invoice to get started.
              </p>
            ) : (
              filteredInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-12 bg-primary rounded"></div>
                    <div>
                      <h3 className="font-medium">{invoice.customerName}</h3>
                      <p className="text-sm text-muted-foreground">{invoice.deviceDescription}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Due: {format(parseISO(invoice.dueDate), "MMM dd, yyyy")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-lg font-semibold">${invoice.remainingAmount.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">
                        of ${invoice.totalAmount.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => printInvoice(invoice)}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendInvoiceEmail(invoice)}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}