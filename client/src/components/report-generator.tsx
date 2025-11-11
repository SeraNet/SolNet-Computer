import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Printer,
  Download,
  Calendar,
  BarChart3,
  Users,
  Package,
  Wrench,
  ShoppingCart,
  CreditCard,
  UserCheck,
  Database,
} from "lucide-react";

const reportSchema = z.object({
  reportType: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  includeDetails: z.boolean(),
  format: z.string(),
});

type ReportForm = z.infer<typeof reportSchema>;

const reportTypes = [
  {
    id: "inventory",
    name: "Inventory Report",
    description:
      "Current stock levels, low stock items, and inventory movements",
    icon: Package,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300",
  },
  {
    id: "repairs",
    name: "Active Repairs Report",
    description: "All active repairs with status, customer info, and progress",
    icon: Wrench,
    color: "bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-300",
  },
  {
    id: "sales",
    name: "Sales Report",
    description: "Sales transactions, revenue, and top-selling items",
    icon: ShoppingCart,
    color: "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-300",
  },
  {
    id: "loans",
    name: "Loan Invoices Report",
    description: "Outstanding loans, payments, and customer debt status",
    icon: CreditCard,
    color: "bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-300",
  },
  {
    id: "customers",
    name: "Customers Report",
    description: "Customer database, contact info, and service history",
    icon: Users,
    color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300",
  },
  {
    id: "workers",
    name: "Workers Report",
    description: "Employee information, roles, and performance metrics",
    icon: UserCheck,
    color: "bg-teal-100 text-teal-800 dark:bg-teal-950/30 dark:text-teal-300",
  },
  {
    id: "expenses",
    name: "Expenses Report",
    description: "Business expenses, categories, and financial overview",
    icon: BarChart3,
    color: "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-300",
  },
  {
    id: "comprehensive",
    name: "Comprehensive Report",
    description: "Complete system overview with all data types",
    icon: Database,
    color: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300",
  },
];

export default function ReportGenerator() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  const form = useForm<ReportForm>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reportType: "comprehensive",
      startDate: format(new Date().setDate(1), "yyyy-MM-dd"), // First day of current month
      endDate: format(new Date(), "yyyy-MM-dd"), // Today
      includeDetails: true,
      format: "pdf",
    },
  });

  const generateReport = async (data: ReportForm) => {
    setIsGenerating(true);
    try {
      const response = await apiRequest("/api/reports/generate", "POST", {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      });

      setReportData(response);
      setShowPreview(true);
      toast({
        title: "Report Generated",
        description: "Your report has been generated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const printReport = () => {
    if (!reportData) return;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${reportData.title}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .summary { margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .footer { margin-top: 30px; text-align: center; font-size: 12px; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${reportData.title}</h1>
              <p>Generated on: ${new Date().toLocaleString()}</p>
              <p>Period: ${form.getValues("startDate")} to ${form.getValues(
        "endDate"
      )}</p>
            </div>
            ${reportData.html}
            <div class="footer">
              <p>SolNet Computer Services - System Report</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const exportReport = async () => {
    if (!reportData) return;

    try {
      const response = await apiRequest("/api/reports/export", "POST", {
        reportData,
        format: form.getValues("format"),
      });

      // Create download link
      const blob = new Blob([response.data], { type: response.type });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportData.title.replace(/\s+/g, "_")}_${format(
        new Date(),
        "yyyy-MM-dd"
      )}.${form.getValues("format")}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Report Exported",
        description: "Your report has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export report. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Configuration */}
      <Card className="card-elevated">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white flex items-center justify-center">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl text-slate-900 dark:text-slate-100">Report Generator</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Generate concise, export-ready business reports
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(generateReport)}
            className="space-y-4"
          >
            {/* Report Type Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Report type
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {reportTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <div
                      key={type.id}
                      className={`group relative border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                        form.watch("reportType") === type.id
                          ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/30 ring-2 ring-blue-200 dark:ring-blue-800"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/50"
                      }`}
                      onClick={() => form.setValue("reportType", type.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg border border-slate-200 dark:border-slate-700 ${
                          form.watch("reportType") === type.id
                            ? "bg-blue-100 dark:bg-blue-900"
                            : "bg-slate-50 dark:bg-slate-700"
                        }`}>
                          <Icon className={`h-4 w-4 ${
                            form.watch("reportType") === type.id
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-slate-700 dark:text-slate-300"
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-slate-900 dark:text-slate-100 text-sm leading-5 mb-1">
                            {type.name}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            {type.description}
                          </p>
                        </div>
                        {form.watch("reportType") === type.id && (
                          <div className="absolute top-2 right-2">
                            <div className="h-4 w-4 rounded-full border-2 border-blue-500 dark:border-blue-400 bg-blue-500 dark:bg-blue-400 flex items-center justify-center">
                              <div className="h-1.5 w-1.5 rounded-full bg-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Date Range
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
              <Label htmlFor="startDate" className="text-xs text-slate-600 dark:text-slate-400">
                Start Date
              </Label>
                  <Input
                    id="startDate"
                    type="date"
                    className="border-slate-200 focus:border-blue-500 focus:ring-blue-500 h-9"
                    {...form.register("startDate")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-xs text-slate-600 dark:text-slate-400">
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    className="border-slate-200 focus:border-blue-500 focus:ring-blue-500 h-9"
                    {...form.register("endDate")}
                  />
                </div>
              </div>
            </div>

            {/* Report Options */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                Options
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-slate-600 dark:text-slate-400">
                    Output Format
                  </Label>
                  <Select
                    value={form.watch("format")}
                    onValueChange={(value) => form.setValue("format", value)}
                  >
                    <SelectTrigger className="h-9 max-w-[220px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                      <SelectItem value="csv">CSV File</SelectItem>
                      <SelectItem value="html">HTML Web Page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-600 dark:text-slate-400">
                    Report Details
                  </Label>
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 max-w-[420px]">
                    <Checkbox
                      id="includeDetails"
                      checked={form.watch("includeDetails")}
                      onCheckedChange={(checked) =>
                        form.setValue("includeDetails", checked as boolean)
                      }
                      className="data-[state=checked]:bg-blue-600"
                    />
                    <Label
                      htmlFor="includeDetails"
                      className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      Include detailed information in the report
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              size="sm"
              className="w-full max-w-xs"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 mr-2" />
                  Generating Report...
                </>
              ) : (
                <>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Report Preview and Actions */}
      {showPreview && reportData && (
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
              Report Preview & Export
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">Review and export your generated report</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Report Summary */}
            <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
              <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                {reportData.title}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 block mb-1">Records</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 text-lg">
                    {reportData.recordCount}
                  </span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 block mb-1">Generated</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {new Date(reportData.generatedAt).toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 block mb-1">Period</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                    {form.getValues("startDate")} to {form.getValues("endDate")}
                  </span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 block mb-1">Format</span>
                  <Badge variant="secondary" className="mt-1">
                    {form.getValues("format").toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={printReport}
                variant="outline"
                className="flex-1 max-w-xs"
              >
                <Printer className="mr-2 h-4 w-4" />
                Print Report
              </Button>
              <Button
                onClick={exportReport}
                className="flex-1 max-w-xs"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>

            {/* Report Preview */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 max-h-96 overflow-y-auto bg-white dark:bg-slate-800">
              <div
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: reportData.html }}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
