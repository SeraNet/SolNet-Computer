import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/currency";
import {
  Search,
  Filter,
  Plus,
  X,
  Wrench,
  Clock,
  AlertTriangle,
} from "lucide-react";

interface PredefinedProblem {
  id: string;
  name: string;
  description?: string;
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  estimatedCost?: string;
  estimatedDuration?: number;
}

interface PredefinedProblemsSelectorProps {
  selectedProblems: PredefinedProblem[];
  onProblemsChange: (problems: PredefinedProblem[]) => void;
  customDescription: string;
  onCustomDescriptionChange: (description: string) => void;
}

const categories = [
  "Hardware",
  "Software",
  "Network",
  "Battery",
  "Screen",
  "General",
];

const severities = [
  { value: "low", label: "Low", color: "bg-green-100 text-green-800" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-800" },
  { value: "critical", label: "Critical", color: "bg-red-100 text-red-800" },
];

export default function PredefinedProblemsSelector({
  selectedProblems,
  onProblemsChange,
  customDescription,
  onCustomDescriptionChange,
}: PredefinedProblemsSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [checkedProblems, setCheckedProblems] = useState<Set<string>>(
    new Set()
  );

  const { data: problems = [], isLoading } = useQuery({
    queryKey: ["predefined-problems"],
    queryFn: () => apiRequest("/api/predefined-problems"),
  });

  // Initialize checked problems when selectedProblems changes
  useEffect(() => {
    setCheckedProblems(new Set(selectedProblems.map((p) => p.id)));
  }, [selectedProblems]);

  const filteredProblems = problems.filter((problem: PredefinedProblem) => {
    const matchesSearch =
      problem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || problem.category === selectedCategory;
    const matchesSeverity =
      selectedSeverity === "all" || problem.severity === selectedSeverity;
    return matchesSearch && matchesCategory && matchesSeverity;
  });

  const handleProblemToggle = (
    problem: PredefinedProblem,
    checked: boolean
  ) => {
    const newCheckedProblems = new Set(checkedProblems);

    if (checked) {
      newCheckedProblems.add(problem.id);
    } else {
      newCheckedProblems.delete(problem.id);
    }

    setCheckedProblems(newCheckedProblems);

    const newSelectedProblems = problems.filter((p: PredefinedProblem) =>
      newCheckedProblems.has(p.id)
    );

    onProblemsChange(newSelectedProblems);
  };

  const handleRemoveProblem = (problemId: string) => {
    const newSelectedProblems = selectedProblems.filter(
      (p) => p.id !== problemId
    );
    onProblemsChange(newSelectedProblems);
  };

  const getSeverityColor = (severity: string) => {
    const severityInfo = severities.find((s) => s.value === severity);
    return severityInfo?.color || "bg-gray-100 text-gray-800";
  };

  const getSelectedProblemsDescription = () => {
    if (selectedProblems.length === 0) {
      return "No problems selected";
    }

    const problemNames = selectedProblems.map((p) => p.name);
    if (problemNames.length <= 2) {
      return problemNames.join(", ");
    }

    return `${problemNames.slice(0, 2).join(", ")} +${
      problemNames.length - 2
    } more`;
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium text-slate-900 dark:text-slate-100">
          Problem Description/To do *
        </Label>
        <div className="mt-2 space-y-3">
          {/* Selected Problems Display */}
          {selectedProblems.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Selected Problems ({selectedProblems.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedProblems.map((problem) => (
                  <Badge
                    key={problem.id}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <span className="text-xs">{problem.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => handleRemoveProblem(problem.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Problem Selection Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <Plus className="h-4 w-4 mr-2" />
                {selectedProblems.length === 0
                  ? "Select predefined problems..."
                  : getSelectedProblemsDescription()}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-slate-900 dark:text-slate-100">Select Predefined Problems</DialogTitle>
              </DialogHeader>

              <div className="flex-1 overflow-hidden flex flex-col">
                {/* Filters */}
                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-slate-500" />
                      <Input
                        placeholder="Search problems..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="w-40">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Category" />
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
                  <Select
                    value={selectedSeverity}
                    onValueChange={setSelectedSeverity}
                  >
                    <SelectTrigger className="w-40">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      {severities.map((severity) => (
                        <SelectItem key={severity.value} value={severity.value}>
                          {severity.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Problems List */}
                <div className="flex-1 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
                          Loading problems...
                        </p>
                      </div>
                    </div>
                  ) : filteredProblems.length === 0 ? (
                    <div className="text-center py-8">
                      <Wrench className="h-8 w-8 text-gray-400 dark:text-slate-500 mx-auto mb-2" />
                      <p className="text-gray-600 dark:text-slate-400">No problems found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filteredProblems.map((problem: PredefinedProblem) => (
                        <Card
                          key={problem.id}
                          className={`cursor-pointer transition-colors bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 ${
                            checkedProblems.has(problem.id)
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                              : "hover:border-gray-300 dark:hover:border-slate-500"
                          }`}
                          onClick={() =>
                            handleProblemToggle(
                              problem,
                              !checkedProblems.has(problem.id)
                            )
                          }
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={checkedProblems.has(problem.id)}
                                onCheckedChange={(checked) =>
                                  handleProblemToggle(
                                    problem,
                                    checked as boolean
                                  )
                                }
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="flex-1">
                                <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                  {problem.name}
                                </CardTitle>
                                <div className="flex items-center gap-2 mt-1">
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
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            {problem.description && (
                              <p className="text-xs text-gray-600 dark:text-slate-400 mb-2">
                                {problem.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400">
                              {problem.estimatedCost && (
                                <div className="flex items-center gap-1">
                                  <span>
                                    {formatCurrency(
                                      parseFloat(problem.estimatedCost)
                                    )}
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
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-600">
                <div className="text-sm text-gray-600 dark:text-slate-400">
                  {selectedProblems.length} problem(s) selected
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={() => setIsDialogOpen(false)}>Done</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Custom Description */}
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-slate-300">
              Additional Notes (Optional)
            </Label>
            <Textarea
              value={customDescription}
              onChange={(e) => onCustomDescriptionChange(e.target.value)}
              placeholder="Add any additional details or custom description..."
              className="mt-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
