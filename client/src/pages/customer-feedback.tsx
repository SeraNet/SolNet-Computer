import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useAuth } from "../hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { PageLayout } from "../components/layout/page-layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Star,
  MessageSquare,
  Filter,
  Search,
  Calendar,
  User,
  Mail,
  Phone,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Reply,
  Trash2,
  RefreshCw,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  EyeOff,
  SortAsc,
  SortDesc,
  Zap,
  Info,
  Lightbulb,
  Activity,
  Bell,
  Download,
  Upload,
  Save,
  Copy,
  Share2,
  Archive,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Receipt,
  Building,
  Smartphone,
  Repeat,
  AlertCircle,
  CheckSquare,
  Square,
  Tag,
  Settings,
  X,
  Award,
  Heart,
  Award as Trophy,
  MessageCircle,
  Smile,
  Frown,
  Meh,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "../components/ui/skeleton";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Progress } from "../components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Switch } from "../components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";

interface CustomerFeedback {
  id: string;
  customerName: string | null;
  customerEmail: string | null;
  serviceType: string;
  rating: number;
  comment: string | null;
  serviceQuality: number;
  speedOfService: number;
  pricing: number;
  communication: number;
  wouldRecommend: boolean;
  isPublic: boolean;
  respondedAt: string | null;
  response: string | null;
  createdAt: string;
  locationId: string | null;
  customerPhone?: string | null;
  customerAddress?: string | null;
}

interface ServiceType {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
}

const CustomerFeedbackPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedFeedback, setSelectedFeedback] =
    useState<CustomerFeedback | null>(null);
  const [responseText, setResponseText] = useState("");
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [highlightedFeedbackId, setHighlightedFeedbackId] = useState<
    string | null
  >(null);

  // Enhanced state management
  const [viewMode, setViewMode] = useState<"list" | "grid" | "analytics">(
    "list"
  );
  const [sortBy, setSortBy] = useState<
    "date" | "rating" | "service" | "status"
  >("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showInsights, setShowInsights] = useState(true);
  const [compactView, setCompactView] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedFeedbackItems, setSelectedFeedbackItems] = useState<string[]>(
    []
  );
  const [bulkActions, setBulkActions] = useState(false);
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      type: "info" | "warning" | "success" | "error";
      message: string;
      timestamp: Date;
    }>
  >([]);
  const [activeTab, setActiveTab] = useState("overview");

  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all customer feedback
  const { data: feedbackData, isLoading: isLoadingFeedback } = useQuery({
    queryKey: ["customer-feedback"],
    queryFn: () => apiRequest("/api/customer-feedback", "GET"),
  });

  // Fetch service types for filter
  const { data: serviceTypes } = useQuery({
    queryKey: ["service-types"],
    queryFn: () => apiRequest("/api/service-types", "GET"),
  });

  // Respond to feedback mutation
  const respondToFeedbackMutation = useMutation({
    mutationFn: async ({
      feedbackId,
      response,
    }: {
      feedbackId: string;
      response: string;
    }) => {
      return apiRequest(
        `/api/customer-feedback/${feedbackId}/respond`,
        "POST",
        {
          response,
        }
      );
    },
    onSuccess: () => {
      toast.success("Response sent successfully!");
      queryClient.invalidateQueries({ queryKey: ["customer-feedback"] });
      setIsResponseDialogOpen(false);
      setResponseText("");
      setSelectedFeedback(null);
    },
    onError: (error: any) => {
      toast.error(`Failed to send response: ${error.message}`);
    },
  });

  // Delete feedback mutation
  const deleteFeedbackMutation = useMutation({
    mutationFn: async (feedbackId: string) => {
      return apiRequest(`/api/customer-feedback/${feedbackId}`, "DELETE");
    },
    onSuccess: () => {
      toast.success("Feedback deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["customer-feedback"] });
    },
    onError: (error: any) => {
      toast.error(`Failed to delete feedback: ${error.message}`);
    },
  });

  const feedback: CustomerFeedback[] = feedbackData || [];

  // Check for feedbackId in URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const feedbackId = urlParams.get("feedbackId");
    if (feedbackId) {
      setHighlightedFeedbackId(feedbackId);
      // Clear the URL parameter after reading it
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);

      // Show a toast to indicate the feedback was highlighted
      toast.success("Feedback Highlighted", {
        description:
          "The feedback from your notification has been highlighted below.",
      });
    }
  }, []);

  // Filter feedback based on search and filters
  const filteredFeedback = feedback.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      item.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serviceType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesService =
      serviceFilter === "all" || item.serviceType === serviceFilter;

    const matchesRating =
      ratingFilter === "all" ||
      (ratingFilter === "5" && item.rating === 5) ||
      (ratingFilter === "4" && item.rating === 4) ||
      (ratingFilter === "3" && item.rating === 3) ||
      (ratingFilter === "2" && item.rating === 2) ||
      (ratingFilter === "1" && item.rating === 1);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "responded" && item.response) ||
      (statusFilter === "pending" && !item.response);

    return matchesSearch && matchesService && matchesRating && matchesStatus;
  });

  // Sort feedback based on selected criteria
  const sortedFeedback = [...filteredFeedback].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "date":
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case "rating":
        comparison = a.rating - b.rating;
        break;
      case "service":
        comparison = a.serviceType.localeCompare(b.serviceType);
        break;
      case "status":
        const aHasResponse = !!a.response;
        const bHasResponse = !!b.response;
        comparison = aHasResponse === bHasResponse ? 0 : aHasResponse ? -1 : 1;
        break;
      default:
        comparison = 0;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  const handleRespond = (feedback: CustomerFeedback) => {
    setSelectedFeedback(feedback);
    setIsResponseDialogOpen(true);
  };

  const handleViewDetails = (feedback: CustomerFeedback) => {
    setSelectedFeedback(feedback);
    setIsDetailDialogOpen(true);
  };

  const handleSendResponse = () => {
    if (!selectedFeedback || !responseText.trim()) {
      toast.error("Please enter a response");
      return;
    }

    respondToFeedbackMutation.mutate({
      feedbackId: selectedFeedback.id,
      response: responseText.trim(),
    });
  };

  const handleDelete = (feedbackId: string) => {
    if (confirm("Are you sure you want to delete this feedback?")) {
      deleteFeedbackMutation.mutate(feedbackId);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "bg-green-100 text-green-800";
    if (rating >= 3) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getStatusBadge = (feedback: CustomerFeedback) => {
    if (feedback.response) {
      return <Badge className="bg-green-100 text-green-800">Responded</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
  };

  // Enhanced helper functions
  const addNotification = (
    type: "info" | "warning" | "success" | "error",
    message: string
  ) => {
    const notification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date(),
    };

    setNotifications((prev) => [...prev, notification].slice(-5)); // Keep last 5

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    }, 5000);
  };

  const getRatingIcon = (rating: number) => {
    if (rating >= 4) return <Smile className="h-4 w-4 text-green-600" />;
    if (rating >= 3) return <Meh className="h-4 w-4 text-yellow-600" />;
    return <Frown className="h-4 w-4 text-red-600" />;
  };

  const getFeedbackStatus = (feedback: CustomerFeedback) => {
    if (feedback.response) {
      return {
        status: "responded",
        color: "text-green-600",
        icon: <CheckCircle className="h-4 w-4" />,
      };
    }
    return {
      status: "pending",
      color: "text-yellow-600",
      icon: <Clock className="h-4 w-4" />,
    };
  };

  const calculateFeedbackStats = () => {
    const totalFeedback = feedback.length;
    const averageRating =
      feedback.length > 0
        ? feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length
        : 0;
    const respondedCount = feedback.filter((f) => f.response).length;
    const pendingCount = feedback.filter((f) => !f.response).length;
    const highRatingCount = feedback.filter((f) => f.rating >= 4).length;
    const lowRatingCount = feedback.filter((f) => f.rating <= 2).length;

    return {
      totalFeedback,
      averageRating,
      respondedCount,
      pendingCount,
      highRatingCount,
      lowRatingCount,
      responseRate:
        totalFeedback > 0 ? (respondedCount / totalFeedback) * 100 : 0,
      satisfactionRate:
        totalFeedback > 0 ? (highRatingCount / totalFeedback) * 100 : 0,
    };
  };

  const getServiceTypeIcon = (serviceType: string) => {
    switch (serviceType.toLowerCase()) {
      case "repair":
        return <Wrench className="h-4 w-4" />;
      case "maintenance":
        return <Settings className="h-4 w-4" />;
      case "installation":
        return <Building className="h-4 w-4" />;
      case "consultation":
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <Receipt className="h-4 w-4" />;
    }
  };

  const getFeedbackPriority = (feedback: CustomerFeedback) => {
    const rating = feedback.rating;
    const hasResponse = !!feedback.response;
    const isRecent =
      new Date(feedback.createdAt) >
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    if (rating <= 2 && !hasResponse)
      return {
        priority: "high",
        color: "text-red-600",
        icon: <AlertTriangle className="h-4 w-4" />,
      };
    if (rating <= 3 && !hasResponse)
      return {
        priority: "medium",
        color: "text-yellow-600",
        icon: <Clock className="h-4 w-4" />,
      };
    if (isRecent && !hasResponse)
      return {
        priority: "medium",
        color: "text-blue-600",
        icon: <Info className="h-4 w-4" />,
      };
    return {
      priority: "normal",
      color: "text-gray-600",
      icon: <CheckCircle className="h-4 w-4" />,
    };
  };

  if (isLoadingFeedback) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <PageLayout
        title="Customer Feedback Management"
        subtitle="Monitor, analyze, and respond to customer reviews with intelligent insights"
        icon={MessageSquare}
      >
        {/* Quick Stats Bar */}
        <Card className="card-elevated mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                  {calculateFeedbackStats().averageRating.toFixed(1)} Avg Rating
                </span>
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  {calculateFeedbackStats().respondedCount} Responded
                </span>
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  {calculateFeedbackStats().pendingCount} Pending
                </span>
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  {calculateFeedbackStats().totalFeedback} Total
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="space-y-2 mb-6">
            {notifications.map((notification) => (
              <Alert
                key={notification.id}
                className={`border-l-4 ${
                  notification.type === "success"
                    ? "border-green-500 bg-green-50 dark:bg-green-950/30 dark:border-green-600"
                    : notification.type === "warning"
                    ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30 dark:border-yellow-600"
                    : notification.type === "error"
                    ? "border-red-500 bg-red-50 dark:bg-red-950/30 dark:border-red-600"
                    : "border-blue-500 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-600"
                }`}
              >
                <AlertDescription className="flex items-center justify-between">
                  <span className="text-slate-900 dark:text-slate-100">{notification.message}</span>
                  <span className="text-xs text-gray-500 dark:text-slate-400">
                    {notification.timestamp.toLocaleTimeString()}
                  </span>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="card-elevated">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Feedback</p>
                <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {calculateFeedbackStats().totalFeedback}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                All customer reviews
              </p>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Average Rating</p>
                <div className="p-2 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg">
                  <Star className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {calculateFeedbackStats().averageRating.toFixed(1)}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Overall satisfaction
              </p>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Response Rate</p>
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <Reply className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {calculateFeedbackStats().responseRate.toFixed(1)}%
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Feedback responded to
              </p>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Satisfaction Rate</p>
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                  <Heart className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {calculateFeedbackStats().satisfactionRate.toFixed(1)}%
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                High ratings (4-5 stars)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Controls and Filters */}
        <Card className="card-elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2 text-slate-900 dark:text-slate-100">
                <Filter className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                <span>Controls & Filters</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowInsights(!showInsights)}
                      className={
                        showInsights
                          ? "bg-teal-50 border-teal-200 text-teal-700"
                          : ""
                      }
                    >
                      {showInsights ? (
                        <Eye className="h-4 w-4 mr-2" />
                      ) : (
                        <EyeOff className="h-4 w-4 mr-2" />
                      )}
                      Insights
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle smart insights and recommendations</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCompactView(!compactView)}
                      className={
                        compactView
                          ? "bg-blue-50 border-blue-200 text-blue-700"
                          : ""
                      }
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      {compactView ? "Compact" : "Normal"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle compact view mode</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAutoRefresh(!autoRefresh)}
                      className={
                        autoRefresh
                          ? "bg-green-50 border-green-200 text-green-700"
                          : ""
                      }
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-2 ${
                          autoRefresh ? "animate-spin" : ""
                        }`}
                      />
                      Auto-refresh
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Enable automatic data refresh</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Search
                </label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search feedback..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Service Type
                </label>
                <Select value={serviceFilter} onValueChange={setServiceFilter}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent side="bottom" sideOffset={4}>
                    <SelectItem value="all">All Services</SelectItem>
                    {serviceTypes?.map((service: ServiceType) => (
                      <SelectItem key={service.id} value={service.name}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Rating
                </label>
                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent side="bottom" sideOffset={4}>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent side="bottom" sideOffset={4}>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending Response</SelectItem>
                    <SelectItem value="responded">Responded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Sort By
                </label>
                <Select
                  value={sortBy}
                  onValueChange={(value: any) => setSortBy(value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent side="bottom" sideOffset={4}>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                >
                  {sortOrder === "asc" ? (
                    <SortAsc className="h-4 w-4" />
                  ) : (
                    <SortDesc className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setServiceFilter("all");
                    setRatingFilter("all");
                    setStatusFilter("all");
                    setSortBy("date");
                    setSortOrder("desc");
                    addNotification("info", "Filters cleared");
                  }}
                >
                  Clear All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Insights Section */}
        {showInsights && (
          <Card className="card-elevated mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Feedback Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {calculateFeedbackStats().averageRating >= 4 && (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Smile className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-300">
                      High Satisfaction
                    </span>
                  </div>
                  <p className="text-xs text-green-700 dark:text-green-400">
                    {calculateFeedbackStats().averageRating.toFixed(1)} average
                    rating
                  </p>
                  <div className="mt-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 p-2 rounded">
                    <Trophy className="h-3 w-3 inline mr-1" />
                    Excellent customer satisfaction
                  </div>
                </div>
              )}

              {calculateFeedbackStats().responseRate > 80 && (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Reply className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                      High Response Rate
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    {calculateFeedbackStats().responseRate.toFixed(1)}% feedback
                    responded to
                  </p>
                  <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 p-2 rounded">
                    <CheckCircle className="h-3 w-3 inline mr-1" />
                    Excellent customer service
                  </div>
                </div>
              )}

              {calculateFeedbackStats().pendingCount > 0 && (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                      Pending Responses
                    </span>
                  </div>
                  <p className="text-xs text-yellow-700 dark:text-yellow-400">
                    {calculateFeedbackStats().pendingCount} feedback awaiting
                    response
                  </p>
                  <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30 p-2 rounded">
                    <AlertTriangle className="h-3 w-3 inline mr-1" />
                    Action required
                  </div>
                </div>
              )}

              {calculateFeedbackStats().lowRatingCount > 0 && (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Frown className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">
                      Low Ratings
                    </span>
                  </div>
                  <p className="text-xs text-red-700 dark:text-red-400">
                    {calculateFeedbackStats().lowRatingCount} feedback with low
                    ratings
                  </p>
                  <div className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-2 rounded">
                    <AlertTriangle className="h-3 w-3 inline mr-1" />
                    Immediate attention needed
                  </div>
                </div>
              )}

              {calculateFeedbackStats().satisfactionRate > 80 && (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium text-purple-800 dark:text-purple-300">
                      High Satisfaction Rate
                    </span>
                  </div>
                  <p className="text-xs text-purple-700 dark:text-purple-400">
                    {calculateFeedbackStats().satisfactionRate.toFixed(1)}%
                    satisfied customers
                  </p>
                  <div className="mt-2 text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 p-2 rounded">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    Strong customer loyalty
                  </div>
                </div>
              )}

              {calculateFeedbackStats().totalFeedback > 10 && (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-sm font-medium text-indigo-800 dark:text-indigo-300">
                      Feedback Volume
                    </span>
                  </div>
                  <p className="text-xs text-indigo-700 dark:text-indigo-400">
                    {calculateFeedbackStats().totalFeedback} total feedback
                    received
                  </p>
                  <div className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 p-2 rounded">
                    <Activity className="h-3 w-3 inline mr-1" />
                    Active customer engagement
                  </div>
                </div>
              )}
            </div>
            </CardContent>
          </Card>
        )}

        {/* Feedback Table */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <MessageSquare className="h-5 w-5" />
              Customer Feedback
            </CardTitle>
            <CardDescription>
              {sortedFeedback.length} feedback items • Sorted by {sortBy} (
              {sortOrder === "asc" ? "ascending" : "descending"})
            </CardDescription>
          </CardHeader>
          <CardContent>
            {compactView ? (
              // Compact Grid View
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {sortedFeedback.length === 0 ? (
                    <div className="col-span-full text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <MessageSquare className="h-8 w-8 text-gray-400 dark:text-slate-500" />
                        <p className="text-gray-500 dark:text-slate-400">No feedback found</p>
                        <p className="text-sm text-gray-400 dark:text-slate-500">
                          {searchTerm ||
                          serviceFilter !== "all" ||
                          ratingFilter !== "all" ||
                          statusFilter !== "all"
                            ? "Try adjusting your filters"
                            : "No customer feedback available yet"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    sortedFeedback.map((feedback) => {
                      const feedbackStatus = getFeedbackStatus(feedback);
                      const priority = getFeedbackPriority(feedback);

                      return (
                        <Card
                          key={feedback.id}
                          className={`card-elevated hover:shadow-lg transition-shadow ${
                            highlightedFeedbackId === feedback.id
                              ? "ring-4 ring-blue-500 ring-opacity-50 bg-blue-50/50 dark:bg-blue-950/50"
                              : ""
                          }`}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                                  <User className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                                </div>
                                <div>
                                  <div className="font-medium text-sm text-slate-900 dark:text-slate-100">
                                    {feedback.customerName || "Anonymous"}
                                  </div>
                                  <div className="text-xs text-gray-600 dark:text-slate-400">
                                    {feedback.customerEmail || "No email"}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                {priority.icon}
                                <Badge
                                  variant={
                                    feedback.response ? "default" : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {feedback.response ? "Responded" : "Pending"}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                {getServiceTypeIcon(feedback.serviceType)}
                                <Badge className="text-xs" variant="outline">
                                  {feedback.serviceType}
                                </Badge>
                                <div className="flex items-center space-x-1">
                                  {renderStars(feedback.rating)}
                                  {getRatingIcon(feedback.rating)}
                                </div>
                              </div>

                              <div className="text-xs space-y-1">
                                <div className="flex items-center gap-1 text-gray-600 dark:text-slate-400">
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    {new Date(
                                      feedback.createdAt
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                {feedback.customerPhone && (
                                  <div className="flex items-center gap-1 text-gray-600 dark:text-slate-400">
                                    <Phone className="h-3 w-3" />
                                    <span className="truncate">
                                      {feedback.customerPhone}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="text-xs">
                                <p className="text-gray-700 dark:text-slate-300 line-clamp-2">
                                  {feedback.comment || "No review text"}
                                </p>
                                {feedback.wouldRecommend && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <ThumbsUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                                    <span className="text-green-600 dark:text-green-400">
                                      Would recommend
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-1 pt-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewDetails(feedback)}
                                  className="h-7 px-2"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                {!feedback.response && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRespond(feedback)}
                                    className="h-7 px-2 text-blue-600 hover:text-blue-700"
                                  >
                                    <Reply className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(feedback.id)}
                                  className="h-7 px-2 text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              // Normal Table View
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Review</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedFeedback.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <MessageSquare className="h-8 w-8 text-gray-400 dark:text-slate-500" />
                            <p className="text-gray-500 dark:text-slate-400">No feedback found</p>
                            <p className="text-sm text-gray-400 dark:text-slate-500">
                              {searchTerm ||
                              serviceFilter !== "all" ||
                              ratingFilter !== "all" ||
                              statusFilter !== "all"
                                ? "Try adjusting your filters"
                                : "No customer feedback available yet"}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedFeedback.map((feedback) => {
                        const feedbackStatus = getFeedbackStatus(feedback);
                        const priority = getFeedbackPriority(feedback);

                        return (
                          <TableRow
                            key={feedback.id}
                            className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 ${
                              highlightedFeedbackId === feedback.id
                                ? "bg-blue-50 dark:bg-blue-950/50 ring-2 ring-blue-200 dark:ring-blue-800"
                                : ""
                            }`}
                          >
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium flex items-center gap-2 text-slate-900 dark:text-slate-100">
                                  {feedback.customerName || "Anonymous"}
                                  {priority.icon}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-slate-400 flex items-center">
                                  <Mail className="h-3 w-3 mr-1" />
                                  {feedback.customerEmail || "No email"}
                                </div>
                                {feedback.customerPhone && (
                                  <div className="text-sm text-gray-500 dark:text-slate-400 flex items-center">
                                    <Phone className="h-3 w-3 mr-1" />
                                    {feedback.customerPhone}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getServiceTypeIcon(feedback.serviceType)}
                                <Badge variant="outline">
                                  {feedback.serviceType}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                {renderStars(feedback.rating)}
                                <Badge
                                  className={getRatingColor(feedback.rating)}
                                >
                                  {feedback.rating}/5
                                </Badge>
                                {getRatingIcon(feedback.rating)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-xs">
                                <p className="text-sm truncate text-slate-700 dark:text-slate-300">
                                  {feedback.comment || "No review text"}
                                </p>
                                {feedback.wouldRecommend && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <ThumbsUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                                    <span className="text-xs text-green-600 dark:text-green-400">
                                      Would recommend
                                    </span>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {feedbackStatus.icon}
                                <Badge
                                  className={
                                    feedback.response
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }
                                >
                                  {feedbackStatus.status}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(
                                  feedback.createdAt
                                ).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        handleViewDetails(feedback)
                                      }
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>View details</p>
                                  </TooltipContent>
                                </Tooltip>

                                {!feedback.response && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleRespond(feedback)}
                                        className="text-blue-600 hover:text-blue-700"
                                      >
                                        <Reply className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Respond to feedback</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDelete(feedback.id)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Delete feedback</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Response Dialog */}
        <Dialog
          open={isResponseDialogOpen}
          onOpenChange={setIsResponseDialogOpen}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Respond to Feedback</DialogTitle>
              <DialogDescription>
                Send a response to the customer's feedback
              </DialogDescription>
            </DialogHeader>
            {selectedFeedback && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Customer Feedback</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Customer:</strong> {selectedFeedback.customerName}
                    </div>
                    <div>
                      <strong>Email:</strong> {selectedFeedback.customerEmail}
                    </div>
                    <div>
                      <strong>Service:</strong> {selectedFeedback.serviceType}
                    </div>
                    <div>
                      <strong>Rating:</strong> {selectedFeedback.rating}/5
                    </div>
                    <div>
                      <strong>Review:</strong> {selectedFeedback.comment}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Your Response</label>
                  <Textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Enter your response to the customer..."
                    rows={4}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsResponseDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendResponse}
                    disabled={respondToFeedbackMutation.isPending}
                  >
                    {respondToFeedbackMutation.isPending
                      ? "Sending..."
                      : "Send Response"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Feedback Details</DialogTitle>
            </DialogHeader>
            {selectedFeedback && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Customer Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        <span>
                          {selectedFeedback.customerName || "Anonymous"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        <span>
                          {selectedFeedback.customerEmail || "No email"}
                        </span>
                      </div>
                      {selectedFeedback.customerPhone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          <span>{selectedFeedback.customerPhone}</span>
                        </div>
                      )}
                      {selectedFeedback.customerAddress && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{selectedFeedback.customerAddress}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Service Details</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Service Type:</strong>{" "}
                        {selectedFeedback.serviceType}
                      </div>
                      <div>
                        <strong>Rating:</strong> {selectedFeedback.rating}/5
                      </div>
                      <div>
                        <strong>Would Recommend:</strong>{" "}
                        {selectedFeedback.wouldRecommend ? (
                          <ThumbsUp className="h-4 w-4 inline text-green-500" />
                        ) : (
                          <ThumbsDown className="h-4 w-4 inline text-red-500" />
                        )}
                      </div>
                      <div>
                        <strong>Date:</strong>{" "}
                        {new Date(selectedFeedback.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Detailed Ratings</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Service Quality:</strong>{" "}
                      {selectedFeedback.serviceQuality}/5
                    </div>
                    <div>
                      <strong>Speed of Service:</strong>{" "}
                      {selectedFeedback.speedOfService}/5
                    </div>
                    <div>
                      <strong>Pricing:</strong> {selectedFeedback.pricing}/5
                    </div>
                    <div>
                      <strong>Communication:</strong>{" "}
                      {selectedFeedback.communication}/5
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Review</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    {selectedFeedback.comment || "No review text provided"}
                  </div>
                </div>

                {selectedFeedback.response && (
                  <div>
                    <h4 className="font-medium mb-2">Your Response</h4>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">
                        Responded on{" "}
                        {new Date(
                          selectedFeedback.respondedAt!
                        ).toLocaleString()}
                      </div>
                      {selectedFeedback.response}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsDetailDialogOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </PageLayout>
    </TooltipProvider>
  );
};

export default CustomerFeedbackPage;
