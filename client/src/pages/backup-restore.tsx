import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Download,
  Upload,
  Database,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BackupInfo {
  id: string;
  filename: string;
  size: number;
  createdAt: string;
  status: "completed" | "in_progress" | "failed";
  type: "full" | "incremental";
  description?: string;
}

export default function BackupRestore() {
  const [isBackupDialogOpen, setIsBackupDialogOpen] = useState(false);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const [backupDescription, setBackupDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: backups = [], isLoading } = useQuery<BackupInfo[]>({
    queryKey: ["backups"],
    queryFn: async () => {
      const response = await apiRequest("/api/backups");
      return response || [];
    },
  });

  const createBackupMutation = useMutation({
    mutationFn: async (data: { description?: string }) => {
      return await apiRequest("/api/backups", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Backup Created",
        description: "Database backup has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["backups"] });
      setIsBackupDialogOpen(false);
      setBackupDescription("");
    },
    onError: (error) => {
      toast({
        title: "Backup Failed",
        description: "Failed to create backup. Please try again.",
        variant: "destructive",
      });
    },
  });

  const restoreBackupMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("backup", file);
      return await apiRequest("/api/backups/restore", "POST", formData);
    },
    onSuccess: () => {
      toast({
        title: "Restore Completed",
        description: "Database has been restored successfully.",
      });
      queryClient.invalidateQueries();
      setIsRestoreDialogOpen(false);
      setSelectedFile(null);
    },
    onError: (error) => {
      toast({
        title: "Restore Failed",
        description: "Failed to restore backup. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteBackupMutation = useMutation({
    mutationFn: async (backupId: string) => {
      return await apiRequest(`/api/backups/${backupId}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Backup Deleted",
        description: "Backup has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["backups"] });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete backup. Please try again.",
        variant: "destructive",
      });
    },
  });

  const downloadBackupMutation = useMutation({
    mutationFn: async (backupId: string) => {
      const response = await fetch(`/api/backups/${backupId}/download`);
      const blob = await response.blob();
      return blob;
    },
    onSuccess: (blob, backupId) => {
      const backup = backups.find((b) => b.id === backupId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = backup?.filename || `backup-${backupId}.sql`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download Started",
        description: "Backup download has started.",
      });
    },
    onError: (error) => {
      toast({
        title: "Download Failed",
        description: "Failed to download backup. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "in_progress":
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case "failed":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleCreateBackup = () => {
    createBackupMutation.mutate({ description: backupDescription });
  };

  const handleRestoreBackup = () => {
    if (selectedFile) {
      restoreBackupMutation.mutate(selectedFile);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Backup & Restore</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage database backups and restore data
          </p>
        </div>
        <div className="flex space-x-2">
          <Dialog
            open={isBackupDialogOpen}
            onOpenChange={setIsBackupDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Database className="mr-2 h-4 w-4" />
                Create Backup
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Backup</DialogTitle>
                <DialogDescription>
                  Create a full backup of your database. This may take a few
                  minutes.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    placeholder="Enter backup description..."
                    value={backupDescription}
                    onChange={(e) => setBackupDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsBackupDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateBackup}
                  disabled={createBackupMutation.isPending}
                >
                  {createBackupMutation.isPending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Backup"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isRestoreDialogOpen}
            onOpenChange={setIsRestoreDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Restore Backup
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Restore from Backup</DialogTitle>
                <DialogDescription>
                  Upload a backup file to restore your database. This will
                  overwrite current data.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="backup-file">Select Backup File</Label>
                  <Input
                    id="backup-file"
                    type="file"
                    accept=".sql,.backup"
                    onChange={handleFileSelect}
                  />
                </div>
                {selectedFile && (
                  <div className="text-sm text-muted-foreground">
                    Selected: {selectedFile.name} (
                    {formatFileSize(selectedFile.size)})
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsRestoreDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRestoreBackup}
                  disabled={!selectedFile || restoreBackupMutation.isPending}
                  variant="destructive"
                >
                  {restoreBackupMutation.isPending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Restoring...
                    </>
                  ) : (
                    "Restore Backup"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Backup Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Backups</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{backups.length}</div>
            <p className="text-xs text-muted-foreground">
              {backups.filter((b) => b.status === "completed").length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatFileSize(backups.reduce((sum, b) => sum + b.size, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Average:{" "}
              {backups.length > 0
                ? formatFileSize(
                    backups.reduce((sum, b) => sum + b.size, 0) / backups.length
                  )
                : "0 Bytes"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Backup</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {backups.length > 0
                ? new Date(backups[0].createdAt).toLocaleDateString()
                : "Never"}
            </div>
            <p className="text-xs text-muted-foreground">
              {backups.length > 0
                ? new Date(backups[0].createdAt).toLocaleTimeString()
                : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Backup List */}
      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : backups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="mx-auto h-12 w-12 mb-4" />
              <p>No backups found</p>
              <p className="text-sm">Create your first backup to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {backups.map((backup) => (
                <div
                  key={backup.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(backup.status)}
                      <Badge className={getStatusColor(backup.status)}>
                        {backup.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium">{backup.filename}</p>
                      <p className="text-sm text-muted-foreground">
                        {backup.description || "No description"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(backup.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {formatFileSize(backup.size)}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadBackupMutation.mutate(backup.id)}
                      disabled={downloadBackupMutation.isPending}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteBackupMutation.mutate(backup.id)}
                      disabled={deleteBackupMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
