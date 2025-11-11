import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/currency";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Wrench,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const problemSchema = z.object({
  name: z.string().min(1, "Problem name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  severity: z.enum(["low", "medium", "high", "critical"]),
  estimatedCost: z.string().optional(),
  estimatedDuration: z.number().min(0).optional(),
  sortOrder: z.number().min(0).default(0),
});

type ProblemForm = z.infer<typeof problemSchema>;

const categories = [
  "Hardware",
  "Software",
  "Network",
  "Battery",
  "Screen",
  "General",
];

const severities = [
  { value: "low", label: "Low", color: "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-300" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-300" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-300" },
  { value: "critical", label: "Critical", color: "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-300" },
];

export default function PredefinedProblemsManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ProblemForm>({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "General",
      severity: "medium",
      estimatedCost: "",
      estimatedDuration: 0,
      sortOrder: 0,
    },
  });

  const { data: problems = [], isLoading } = useQuery({
    queryKey: ["predefined-problems"],
    queryFn: () => apiRequest("/api/predefined-problems"),
  });

  const createProblemMutation = useMutation({
    mutationFn: (data: ProblemForm) =>
      apiRequest("/api/predefined-problems", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["predefined-problems"] });
      toast({
        title: "Problem Created",
        description: "Predefined problem has been created successfully.",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create problem",
        variant: "destructive",
      });
    },
  });

  const updateProblemMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProblemForm }) =>
      apiRequest(`/api/predefined-problems/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["predefined-problems"] });
      toast({
        title: "Problem Updated",
        description: "Predefined problem has been updated successfully.",
      });
      setIsDialogOpen(false);
      setEditingProblem(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update problem",
        variant: "destructive",
      });
    },
  });

  const deleteProblemMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/predefined-problems/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["predefined-problems"] });
      toast({
        title: "Problem Deleted",
        description: "Predefined problem has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete problem",
        variant: "destructive",
      });
    },
  });

  const filteredProblems = problems.filter((problem: any) => {
    const matchesSearch =
      problem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || problem.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = (data: ProblemForm) => {
    // Convert empty string to undefined for optional fields
    const submitData = {
      ...data,
      estimatedCost: data.estimatedCost === "" ? undefined : data.estimatedCost,
      estimatedDuration:
        data.estimatedDuration === 0 ? undefined : data.estimatedDuration,
    };

    if (editingProblem) {
      updateProblemMutation.mutate({ id: editingProblem.id, data: submitData });
    } else {
      createProblemMutation.mutate(submitData);
    }
  };

  const handleEdit = (problem: any) => {
    setEditingProblem(problem);
    form.reset({
      name: problem.name,
      description: problem.description || "",
      category: problem.category,
      severity: problem.severity,
      estimatedCost: problem.estimatedCost || "",
      estimatedDuration: problem.estimatedDuration || 0,
      sortOrder: problem.sortOrder || 0,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this predefined problem?")) {
      deleteProblemMutation.mutate(id);
    }
  };

  const handleCreate = () => {
    setEditingProblem(null);
    form.reset({
      name: "",
      description: "",
      category: "General",
      severity: "medium",
      estimatedCost: "",
      estimatedDuration: 0,
      sortOrder: 0,
    });
    setIsDialogOpen(true);
  };

  const getSeverityColor = (severity: string) => {
    const severityInfo = severities.find((s) => s.value === severity);
    return severityInfo?.color || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Loading predefined problems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Predefined Problems
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Manage common device problems for quick selection during
            registration
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Problem
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingProblem ? "Edit Problem" : "Add New Problem"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Problem Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Screen not working"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Detailed description of the problem..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="severity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Severity *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select severity" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {severities.map((severity) => (
                              <SelectItem
                                key={severity.value}
                                value={severity.value}
                              >
                                {severity.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="estimatedCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Cost</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estimatedDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="60"
                            value={field.value || 0}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? parseInt(e.target.value) : 0
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="sortOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Order</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={field.value || 0}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? parseInt(e.target.value) : 0
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      createProblemMutation.isPending ||
                      updateProblemMutation.isPending
                    }
                  >
                    {editingProblem ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search problems..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Problems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProblems.map((problem: any) => (
          <Card key={problem.id} className="card-elevated hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {problem.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {problem.category}
                    </Badge>
                    <Badge
                      className={`text-xs ${getSeverityColor(
                        problem.severity
                      )}`}
                    >
                      {problem.severity}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(problem)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(problem.id)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {problem.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  {problem.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                {problem.estimatedCost && (
                  <div className="flex items-center gap-1">
                    <span>
                      {formatCurrency(parseFloat(problem.estimatedCost))}
                    </span>
                  </div>
                )}
                {problem.estimatedDuration && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{problem.estimatedDuration} min</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProblems.length === 0 && (
        <Card className="card-elevated">
          <CardContent className="py-12">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4">
            <Wrench className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
            No problems found
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            {searchTerm || selectedCategory !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by adding your first predefined problem"}
          </p>
        </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
