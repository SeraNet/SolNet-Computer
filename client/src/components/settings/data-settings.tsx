import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Database,
  Download,
  Upload,
  RotateCcw,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function DataSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [backupProgress, setBackupProgress] = useState(0);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [settings, setSettings] = useState({
    autoBackup: true,
    backupFrequency: "daily",
    backupTime: "02:00",
    keepBackups: "30",
    compression: true,
    encryption: true,
  });

  // Fetch backup history from API
  const { data: backupHistory = [], refetch: refetchBackupHistory } = useQuery({
    queryKey: ["backup-history"],
    queryFn: () => apiRequest("/api/data/backup", "GET"),
  });

  // Backup mutation
  const backupMutation = useMutation({
    mutationFn: () => apiRequest("/api/data/backup", "POST"),
    onSuccess: (data) => {
      setIsBackingUp(false);
      setBackupProgress(100);
      refetchBackupHistory();
      toast({
        title: "Backup Completed",
        description: "Your data has been backed up successfully.",
      });
    },
    onError: (error: any) => {
      setIsBackingUp(false);
      toast({
        title: "Backup Failed",
        description: error.message || "Failed to create backup",
        variant: "destructive",
      });
    },
  });

  // Restore mutation
  const restoreMutation = useMutation({
    mutationFn: (backupId: string) =>
      apiRequest("/api/data/restore", "POST", { backupId }),
    onSuccess: () => {
      toast({
        title: "Restore Completed",
        description: "Data restoration completed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Restore Failed",
        description: error.message || "Failed to restore data",
        variant: "destructive",
      });
    },
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: (type: string) =>
      apiRequest("/api/data/export", "POST", { type }),
    onSuccess: (data, type) => {
      // Create download link
      const blob = new Blob([JSON.stringify(data.data, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Completed",
        description: `${type} data exported successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export data",
        variant: "destructive",
      });
    },
  });

  // Import mutation
  const importMutation = useMutation({
    mutationFn: ({ type, data }: { type: string; data: any }) =>
      apiRequest("/api/data/import", "POST", { type, data }),
    onSuccess: (data, variables) => {
      toast({
        title: "Import Completed",
        description:
          data.message ||
          `Successfully imported ${data.importedCount} ${variables.type} records.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import data",
        variant: "destructive",
      });
    },
  });

  // Settings mutation
  const settingsMutation = useMutation({
    mutationFn: (settings: any) =>
      apiRequest("/api/data/settings", "PUT", settings),
    onSuccess: () => {
      toast({
        title: "Settings Saved",
        description:
          "Your data management settings have been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    },
  });

  const handleCreateBackup = () => {
    setIsBackingUp(true);
    setBackupProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setBackupProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    backupMutation.mutate();
  };

  const handleRestore = (backupId: string) => {
    restoreMutation.mutate(backupId);
  };

  const handleExport = (type: string) => {
    exportMutation.mutate(type);
  };

  const handleImport = (type: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        importMutation.mutate({ type, data });
      } catch (error) {
        toast({
          title: "Invalid File",
          description: "Please select a valid JSON file.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleSaveSettings = () => {
    settingsMutation.mutate(settings);
  };

  return (
    <div className="space-y-6">
      {/* Backup & Restore */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Database className="h-5 w-5 text-green-600 dark:text-green-400" />
            Backup & Restore
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Manage your data backups and restoration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleCreateBackup}
              disabled={isBackingUp}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {isBackingUp ? "Creating Backup..." : "Create Backup Now"}
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restore Data
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Restore Data</DialogTitle>
                  <DialogDescription>
                    Choose a backup to restore your data. This will overwrite
                    current data.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Backup</Label>
                    <Select
                      onValueChange={(value) => {
                        // Store selected backup ID for restore
                        (window as any).selectedBackupId = value;
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a backup..." />
                      </SelectTrigger>
                      <SelectContent>
                        {backupHistory.map((backup: any) => (
                          <SelectItem key={backup.id} value={backup.id}>
                            {backup.date} at {backup.time} ({backup.size})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Warning: This action will overwrite all current data.
                      Make sure you have a recent backup.
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      const backupId = (window as any).selectedBackupId;
                      if (backupId) {
                        handleRestore(backupId);
                      } else {
                        toast({
                          title: "No Backup Selected",
                          description: "Please select a backup to restore.",
                          variant: "destructive",
                        });
                      }
                    }}
                    className="w-full"
                    variant="destructive"
                    disabled={restoreMutation.isPending}
                  >
                    {restoreMutation.isPending
                      ? "Restoring..."
                      : "Restore Data"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {isBackingUp && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Backup Progress</span>
                <span>{backupProgress}%</span>
              </div>
              <Progress value={backupProgress} className="w-full" />
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Backup History</h3>
            <div className="space-y-2">
              {backupHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No backups found
                </p>
              ) : (
                backupHistory.map((backup: any) => (
                  <div
                    key={backup.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {backup.status === "completed" ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium">
                          {backup.date} at {backup.time}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{backup.size}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Download backup file
                          const link = document.createElement("a");
                          link.href = `/api/data/backup/${backup.id}/download`;
                          link.download = backup.filename;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      >
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(backup.id)}
                        disabled={restoreMutation.isPending}
                      >
                        Restore
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auto Backup Settings */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Automatic Backup Settings
          </CardTitle>
          <CardDescription>
            Configure automatic backup preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">
                  Enable Auto Backup
                </Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Automatically backup data at scheduled intervals
                </p>
              </div>
              <Switch
                checked={settings.autoBackup}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, autoBackup: checked }))
                }
              />
            </div>

            {settings.autoBackup && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Backup Frequency</Label>
                  <Select
                    value={settings.backupFrequency}
                    onValueChange={(value) =>
                      setSettings((prev) => ({
                        ...prev,
                        backupFrequency: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Backup Time</Label>
                  <Input
                    type="time"
                    value={settings.backupTime}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        backupTime: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Keep Backups (days)</Label>
                  <Input
                    type="number"
                    value={settings.keepBackups}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        keepBackups: e.target.value,
                      }))
                    }
                    min="1"
                    max="365"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Compression</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Compress backup files to save space
                </p>
              </div>
              <Switch
                checked={settings.compression}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, compression: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Encryption</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Encrypt backup files for security
                </p>
              </div>
              <Switch
                checked={settings.encryption}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, encryption: checked }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import & Export */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Import & Export
          </CardTitle>
          <CardDescription>
            Import and export your data in various formats
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h3 className="font-medium">Export Data</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleExport("Customers")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Customers
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleExport("Inventory")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Inventory
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleExport("Sales")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Sales Data
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleExport("All")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export All Data
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Import Data</h3>
              <div className="space-y-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Upload className="h-4 w-4 mr-2" />
                      Import Customers
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Import Customers</DialogTitle>
                      <DialogDescription>
                        Upload a JSON file with customer data
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        type="file"
                        accept=".json"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            (window as any).importCustomerFile = file;
                          }
                        }}
                      />
                      <Button
                        onClick={() => {
                          const file = (window as any).importCustomerFile;
                          if (file) {
                            handleImport("customers", file);
                          } else {
                            toast({
                              title: "No File Selected",
                              description: "Please select a file to import.",
                              variant: "destructive",
                            });
                          }
                        }}
                        className="w-full"
                        disabled={importMutation.isPending}
                      >
                        {importMutation.isPending
                          ? "Importing..."
                          : "Import Customers"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Upload className="h-4 w-4 mr-2" />
                      Import Inventory
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Import Inventory</DialogTitle>
                      <DialogDescription>
                        Upload a JSON file with inventory data
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        type="file"
                        accept=".json"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            (window as any).importInventoryFile = file;
                          }
                        }}
                      />
                      <Button
                        onClick={() => {
                          const file = (window as any).importInventoryFile;
                          if (file) {
                            handleImport("inventory", file);
                          } else {
                            toast({
                              title: "No File Selected",
                              description: "Please select a file to import.",
                              variant: "destructive",
                            });
                          }
                        }}
                        className="w-full"
                        disabled={importMutation.isPending}
                      >
                        {importMutation.isPending
                          ? "Importing..."
                          : "Import Inventory"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveSettings}
          className="px-6"
          disabled={settingsMutation.isPending}
        >
          {settingsMutation.isPending ? "Saving..." : "Save Data Settings"}
        </Button>
      </div>
    </div>
  );
}
