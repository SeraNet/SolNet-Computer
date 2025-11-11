import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Download, Upload, FileSpreadsheet } from "lucide-react";

type Props = {
  entity:
    | "inventory"
    | "customers"
    | "expenses"
    | "service-types"
    | "device-types"
    | "models"
    | "brands"
    | "devices"
    | "service-management";
  className?: string;
  showTemplates?: boolean;
};

export function ImportExportControls({
  entity,
  className,
  showTemplates = true,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const queryClient = useQueryClient();

  const invalidateFor = (e: Props["entity"]) => {
    const keys: any[] = [];
    if (e === "inventory") keys.push(["inventory"], ["/api/inventory"]);
    if (e === "customers") keys.push(["customers"], ["/api/customers"]);
    if (e === "expenses")
      keys.push(["expenses"], ["/api/expenses"], ["expenses", "stats"]);
    if (e === "service-types") keys.push(["/api/service-types"]);
    if (e === "device-types") keys.push(["/api/device-types"]);
    if (e === "models") keys.push(["/api/models"]);
    if (e === "brands") keys.push(["/api/brands"]);

    if (e === "devices") keys.push(["/api/devices"], ["devices"]);
    if (e === "service-management") {
      keys.push(
        ["/api/service-types"],
        ["/api/brands"],
        ["/api/models"],
        ["/api/device-types"]
      );
    }
    keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
  };

  const onExport = async () => {
    try {
      setIsExporting(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/export/${entity}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${entity}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast({
        title: "Export completed",
        description: `Downloaded ${entity}.xlsx`,
      });
    } catch (e) {
      toast({
        title: "Export failed",
        description: (e as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const onImport = async (file: File) => {
    try {
      setIsImporting(true);
      const formData = new FormData();
      formData.append("file", file);
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/import/${entity}`, {
        method: "POST",
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      toast({
        title: "Import complete",
        description: json.message || `${json.inserted} rows inserted`,
      });
      invalidateFor(entity);
    } catch (e) {
      toast({
        title: "Import failed",
        description: (e as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const onDownloadTemplate = async () => {
    try {
      setIsDownloadingTemplate(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/templates/${entity}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error("Template download failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${entity}-template.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast({
        title: "Template downloaded",
        description: `Downloaded ${entity}-template.xlsx`,
      });
    } catch (e) {
      toast({
        title: "Template download failed",
        description: (e as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const getEntityDisplayName = (e: Props["entity"]) => {
    const names: Record<Props["entity"], string> = {
      inventory: "Inventory",
      customers: "Customers",
      expenses: "Expenses",
      "service-types": "Service Types",
      "device-types": "Device Types",
      models: "Models",
      brands: "Brands",

      devices: "Devices",
      "service-management": "Service Management",
    };
    return names[e];
  };

  return (
    <div className={`flex gap-2 flex-wrap ${className || ""}`}>
      <Button
        variant="outline"
        onClick={onExport}
        disabled={isExporting}
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        {isExporting ? "Exporting..." : "Export XLSX"}
      </Button>

      {showTemplates && (
        <Button
          variant="outline"
          onClick={onDownloadTemplate}
          disabled={isDownloadingTemplate}
          className="flex items-center gap-2"
        >
          <FileSpreadsheet className="h-4 w-4" />
          {isDownloadingTemplate ? "Downloading..." : "Download Template"}
        </Button>
      )}

      <Input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImport(file);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }}
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting}
        className="flex items-center gap-2"
      >
        <Upload className="h-4 w-4" />
        {isImporting ? "Importing..." : "Import XLSX"}
      </Button>
    </div>
  );
}
