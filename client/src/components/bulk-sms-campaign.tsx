import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MessageSquare,
  Users,
  Send,
  Calendar,
  Target,
  Eye,
  Copy,
  Globe,
  Clock,
  CheckCircle,
  AlertTriangle,
  Filter,
  Search,
  Download,
  Upload,
} from "lucide-react";

// Campaign Schema
const campaignSchema = z.object({
  name: z.string().min(3, "Campaign name must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  occasion: z.enum([
    "new_year",
    "christmas",
    "easter",
    "eid",
    "promotion",
    "announcement",
    "custom",
  ]),
  customOccasion: z.string().optional(),
  scheduledDate: z.string().optional(),
  targetGroup: z.enum([
    "all_customers",
    "active_customers",
    "recent_customers",
    "high_value_customers",
    "custom_filter",
    "selected_recipients",
    "recipient_group",
  ]),
  customFilters: z
    .object({
      deviceTypes: z.array(z.string()).optional(),
      locations: z.array(z.string()).optional(),
      lastVisitDays: z.number().optional(),
      minTotalSpent: z.number().optional(),
    })
    .optional(),
  selectedRecipients: z.array(z.string()).optional(),
  selectedRecipientGroup: z.string().optional(),
  previewMode: z.boolean().default(true),
});

type CampaignForm = z.infer<typeof campaignSchema>;

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalSpent: number;
  lastVisit: string;
  deviceCount: number;
  location: string;
}

interface RecipientGroup {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface Campaign {
  id: string;
  name: string;
  message: string;
  occasion: string;
  customOccasion?: string;
  scheduledDate?: string;
  targetGroup: string;
  customFilters?: any;
  status: "draft" | "scheduled" | "sending" | "completed" | "failed";
  sentCount: number;
  totalCount: number;
  createdAt: string;
  sentAt?: string;
}

// Predefined occasion templates
const occasionTemplates = {
  new_year: {
    amharic: `🎉 አዲስ ዓመት እንደሚደርስ እንወድዳለን!

ውድ {customerName}፣

አዲሱ ዓመት ለእርስዎ እና ለቤተሰብዎ ደስታ፣ ጤና እና ስኬት የሚያመጣ ይሁን!

አገልግሎታችንን ስለመረጡ እናመሰግናለን። በአዲሱ ዓመት ውስጥ እንደገና እንድትመጡ እንጠብቃለን!

እንደምን አዲስ ዓመት! 🎊`,
    english: `🎉 Happy New Year!

Dear {customerName},

As we approach the new year, we want to extend our warmest wishes to you and your family!

May the new year bring you joy, health, and success!

Thank you for choosing our service. We look forward to serving you again in the new year!

Happy New Year! 🎊`,
    mixed: `🎉 Happy New Year! / እንደምን አዲስ ዓመት!

Dear {customerName} / ውድ {customerName}፣

As we approach the new year, we want to extend our warmest wishes to you and your family!
አዲሱ ዓመት ለእርስዎ እና ለቤተሰብዎ ደስታ፣ ጤና እና ስኬት የሚያመጣ ይሁን!

Thank you for choosing our service. We look forward to serving you again in the new year!
አገልግሎታችንን ስለመረጡ እናመሰግናለን። በአዲሱ ዓመት ውስጥ እንደገና እንድትመጡ እንጠብቃለን!

Happy New Year! / እንደምን አዲስ ዓመት! 🎊`,
  },
  christmas: {
    amharic: `🎄 መልካም ገና!

ውድ {customerName}፣

ገና በደስታ እና በሰላም እንዲሆን እንወድዳለን!

እግዚአብሔር በሰላም ያስገባዎት። አገልግሎታችንን ስለመረጡ እናመሰግናለን!

መልካም ገና! 🎅`,
    english: `🎄 Merry Christmas!

Dear {customerName},

We wish you a Christmas filled with joy and peace!

God bless you. Thank you for choosing our service!

Merry Christmas! 🎅`,
    mixed: `🎄 Merry Christmas! / መልካም ገና!

Dear {customerName} / ውድ {customerName}፣

We wish you a Christmas filled with joy and peace!
ገና በደስታ እና በሰላም እንዲሆን እንወድዳለን!

God bless you. Thank you for choosing our service!
እግዚአብሔር በሰላም ያስገባዎት። አገልግሎታችንን ስለመረጡ እናመሰግናለን!

Merry Christmas! / መልካም ገና! 🎅`,
  },
  promotion: {
    amharic: `🔥 ልዩ ቅናሽ!

ውድ {customerName}፣

ለደጋፊዎቻችን ልዩ ቅናሽ አለን!

📱 ሁሉም የጥገና አገልግሎቶች ላይ 20% ቅናሽ
⏰ እስከ {endDate} ድረስ ብቻ

ይህን እድል አያምሉ! ለተጨማሪ መረጃ ያግኙን።

አገልግሎታችንን ስለመረጡ እናመሰግናለን! 💰`,
    english: `🔥 Special Discount!

Dear {customerName},

We have a special discount for our valued customers!

📱 20% off on all repair services
⏰ Valid until {endDate} only

Don't miss this opportunity! Contact us for more details.

Thank you for choosing our service! 💰`,
    mixed: `🔥 Special Discount! / ልዩ ቅናሽ!

Dear {customerName} / ውድ {customerName}፣

We have a special discount for our valued customers!
ለደጋፊዎቻችን ልዩ ቅናሽ አለን!

📱 20% off on all repair services / ሁሉም የጥገና አገልግሎቶች ላይ 20% ቅናሽ
⏰ Valid until {endDate} only / እስከ {endDate} ድረስ ብቻ

Don't miss this opportunity! Contact us for more details.
ይህን እድል አያምሉ! ለተጨማሪ መረጃ ያግኙን።

Thank you for choosing our service! / አገልግሎታችንን ስለመረጡ እናመሰግናለን! 💰`,
  },
};

export function BulkSMSCampaign() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedLanguage, setSelectedLanguage] = useState<
    "amharic" | "english" | "mixed"
  >("amharic");
  const [previewCustomers, setPreviewCustomers] = useState<Customer[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [showRecipientSelector, setShowRecipientSelector] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [selectedRecipientGroup, setSelectedRecipientGroup] = useState<string>("");

  // Fetch customers for campaign targeting
  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await apiRequest("/api/customers", "GET");
      return response as Customer[];
    },
  });

  // Fetch existing campaigns
  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ["sms-campaigns"],
    queryFn: async () => {
      const response = await apiRequest("/api/sms-campaigns", "GET");
      return response as Campaign[];
    },
  });

  // Fetch recipient groups
  const { data: recipientGroups, isLoading: groupsLoading } = useQuery({
    queryKey: ["recipient-groups"],
    queryFn: async () => {
      const response = await apiRequest("/api/recipient-groups", "GET");
      return response as RecipientGroup[];
    },
  });

  // Send campaign mutation
  const sendCampaignMutation = useMutation({
    mutationFn: async (data: CampaignForm) => {
      return await apiRequest("/api/sms-campaigns/send", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "SMS campaign sent successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["sms-campaigns"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send SMS campaign",
        variant: "destructive",
      });
    },
  });

  // Schedule campaign mutation
  const scheduleCampaignMutation = useMutation({
    mutationFn: async (data: CampaignForm) => {
      return await apiRequest("/api/sms-campaigns/schedule", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "SMS campaign scheduled successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["sms-campaigns"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to schedule SMS campaign",
        variant: "destructive",
      });
    },
  });

  // Update campaign mutation
  const updateCampaignMutation = useMutation({
    mutationFn: async (data: CampaignForm) => {
      return await apiRequest(
        `/api/sms-campaigns/${editingCampaign?.id}`,
        "PUT",
        data
      );
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "SMS campaign updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["sms-campaigns"] });
      setEditingCampaign(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update SMS campaign",
        variant: "destructive",
      });
    },
  });

  // Delete campaign mutation
  const deleteCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      return await apiRequest(`/api/sms-campaigns/${campaignId}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "SMS campaign deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["sms-campaigns"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete SMS campaign",
        variant: "destructive",
      });
    },
  });

  const form = useForm<CampaignForm>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: "",
      message: "",
      occasion: "new_year",
      targetGroup: "all_customers",
      previewMode: true,
    },
  });

  // Load occasion template when occasion changes
  useEffect(() => {
    const occasion = form.watch("occasion");
    if (
      occasion &&
      occasionTemplates[occasion as keyof typeof occasionTemplates]
    ) {
      const template =
        occasionTemplates[occasion as keyof typeof occasionTemplates][
          selectedLanguage
        ];
      if (template) {
        form.setValue("message", template);
      }
    }
  }, [form.watch("occasion"), selectedLanguage, form]);

  const onSubmit = (data: CampaignForm) => {
    const formData = {
      ...data,
      selectedRecipients:
        selectedRecipients.length > 0 ? selectedRecipients : undefined,
      selectedRecipientGroup: data.selectedRecipientGroup,
    };

    if (editingCampaign) {
      updateCampaignMutation.mutate(formData);
    } else if (data.scheduledDate) {
      scheduleCampaignMutation.mutate(formData);
    } else {
      sendCampaignMutation.mutate(formData);
    }
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    form.reset({
      name: campaign.name,
      message: campaign.message,
      occasion: campaign.occasion as any,
      targetGroup: campaign.targetGroup as any,
      customFilters: campaign.customFilters,
      scheduledDate: campaign.scheduledDate,
    });
  };

  const handleDeleteCampaign = (campaignId: string) => {
    if (confirm("Are you sure you want to delete this campaign?")) {
      deleteCampaignMutation.mutate(campaignId);
    }
  };

  const handleCancelEdit = () => {
    setEditingCampaign(null);
    form.reset({
      name: "",
      message: "",
      occasion: "new_year",
      targetGroup: "all_customers",
      previewMode: true,
    });
    setSelectedRecipients([]);
  };

  const handlePreview = () => {
    const targetGroup = form.watch("targetGroup");
    const customFilters = form.watch("customFilters");

    if (!customers) return;

    let filteredCustomers = [...customers];

    // Apply filters based on target group
    switch (targetGroup) {
      case "active_customers":
        filteredCustomers = customers.filter(
          (c) =>
            new Date(c.lastVisit) >
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        );
        break;
      case "recent_customers":
        filteredCustomers = customers.filter(
          (c) =>
            new Date(c.lastVisit) >
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        );
        break;
      case "high_value_customers":
        filteredCustomers = customers.filter((c) => c.totalSpent > 1000);
        break;
      case "selected_recipients":
        filteredCustomers = customers.filter((c) =>
          selectedRecipients.includes(c.id)
        );
        break;
      case "recipient_group":
        // This will be handled by the backend when sending
        // For preview, we'll show a message that it will use the selected group
        const selectedGroup = recipientGroups?.find(group => group.id === selectedRecipientGroup);
        if (selectedGroup) {
          filteredCustomers = customers.slice(0, 3); // Show first 3 for preview
        }
        break;
      case "custom_filter":
        if (customFilters) {
          if (customFilters.deviceTypes?.length) {
            // This would need to be implemented based on your data structure
          }
          if (customFilters.minTotalSpent) {
            filteredCustomers = filteredCustomers.filter(
              (c) => c.totalSpent >= customFilters.minTotalSpent!
            );
          }
        }
        break;
    }

    setPreviewCustomers(filteredCustomers.slice(0, 5)); // Show first 5 for preview
    setShowPreview(true);
  };

  const formatPreviewMessage = (template: string, customer: Customer) => {
    return template
      .replace(/{customerName}/g, customer.name)
      .replace(
        /{endDate}/g,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
      );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Message copied to clipboard",
    });
  };

  if (customersLoading || campaignsLoading) {
    return <div>Loading campaign data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 text-white flex items-center justify-center">
          <Send className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Bulk SMS Campaigns
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Send SMS messages to groups of customers for special occasions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaign Creator */}
        <div className="lg:col-span-2">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Send className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                {editingCampaign ? "Edit Campaign" : "Create New Campaign"}
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                {editingCampaign
                  ? "Edit your SMS campaign"
                  : "Create and send SMS campaigns to your customers"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Campaign Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Campaign Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g., New Year 2025 Campaign"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="occasion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Occasion</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select occasion" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="new_year">New Year</SelectItem>
                              <SelectItem value="christmas">
                                Christmas
                              </SelectItem>
                              <SelectItem value="easter">Easter</SelectItem>
                              <SelectItem value="eid">Eid</SelectItem>
                              <SelectItem value="promotion">
                                Promotion
                              </SelectItem>
                              <SelectItem value="announcement">
                                Announcement
                              </SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Language Selection */}
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Message Template
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedLanguage("amharic")}
                              className={
                                selectedLanguage === "amharic"
                                  ? "bg-blue-100"
                                  : ""
                              }
                            >
                              Amharic
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedLanguage("english")}
                              className={
                                selectedLanguage === "english"
                                  ? "bg-blue-100"
                                  : ""
                              }
                            >
                              English
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedLanguage("mixed")}
                              className={
                                selectedLanguage === "mixed"
                                  ? "bg-blue-100"
                                  : ""
                              }
                            >
                              Mixed
                            </Button>
                          </div>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Enter your campaign message..."
                            className="min-h-[200px] font-mono text-sm"
                          />
                        </FormControl>
                        <FormDescription>
                          Use {"{customerName}"} to personalize the message for
                          each customer
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Target Group */}
                  <FormField
                    control={form.control}
                    name="targetGroup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Target Group
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select target group" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all_customers">
                              All Customers ({customers?.length || 0})
                            </SelectItem>
                            <SelectItem value="active_customers">
                              Active Customers (Last 30 days)
                            </SelectItem>
                            <SelectItem value="recent_customers">
                              Recent Customers (Last 7 days)
                            </SelectItem>
                            <SelectItem value="high_value_customers">
                              High Value Customers (&gt;1000 ETB)
                            </SelectItem>
                            <SelectItem value="selected_recipients">
                              Selected Recipients ({selectedRecipients.length})
                            </SelectItem>
                            <SelectItem value="recipient_group">
                              Recipient Group
                            </SelectItem>
                            <SelectItem value="custom_filter">
                              Custom Filter
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Recipient Selector */}
                  {form.watch("targetGroup") === "selected_recipients" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">
                          Selected Recipients ({selectedRecipients.length})
                        </Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowRecipientSelector(true)}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Select Recipients
                        </Button>
                      </div>
                      {selectedRecipients.length > 0 && (
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {selectedRecipients.length} recipient(s) selected
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Recipient Group Selector */}
                  {form.watch("targetGroup") === "recipient_group" && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="selectedRecipientGroup"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">
                              Select Recipient Group
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose a recipient group" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {recipientGroups?.map((group) => (
                                  <SelectItem key={group.id} value={group.id}>
                                    {group.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Choose a predefined recipient group for your campaign
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Scheduling */}
                  <FormField
                    control={form.control}
                    name="scheduledDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Schedule (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="datetime-local"
                            placeholder="Leave empty to send immediately"
                          />
                        </FormControl>
                        <FormDescription>
                          Schedule the campaign for a specific date and time
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePreview}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Preview
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        sendCampaignMutation.isPending ||
                        scheduleCampaignMutation.isPending ||
                        updateCampaignMutation.isPending
                      }
                      className="flex items-center gap-2"
                    >
                      {sendCampaignMutation.isPending ||
                      scheduleCampaignMutation.isPending ||
                      updateCampaignMutation.isPending ? (
                        <>
                          <Send className="h-4 w-4 animate-spin" />
                          {editingCampaign ? "Updating..." : "Sending..."}
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          {editingCampaign
                            ? "Update Campaign"
                            : form.watch("scheduledDate")
                            ? "Schedule Campaign"
                            : "Send Campaign"}
                        </>
                      )}
                    </Button>
                    {editingCampaign && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="flex items-center gap-2"
                      >
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Campaign History */}
        <div className="lg:col-span-1">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                Campaign History
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">Recent SMS campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns?.slice(0, 5).map((campaign) => (
                  <div key={campaign.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{campaign.name}</h4>
                      <Badge
                        variant={
                          campaign.status === "completed"
                            ? "default"
                            : campaign.status === "sending"
                            ? "secondary"
                            : campaign.status === "failed"
                            ? "destructive"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {campaign.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                      {campaign.sentCount}/{campaign.totalCount} sent
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCampaign(campaign)}
                        disabled={
                          campaign.status === "sending" ||
                          campaign.status === "completed"
                        }
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCampaign(campaign.id)}
                        disabled={deleteCampaignMutation.isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
                {(!campaigns || campaigns.length === 0) && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 text-center py-4">
                    No campaigns yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Campaign Preview
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Preview how your message will look for different customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Showing {previewCustomers.length} of {customers?.length || 0}{" "}
                  customers
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(false)}
                >
                  Close Preview
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {previewCustomers.map((customer) => (
                  <div key={customer.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{customer.name}</h4>
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {customer.phone}
                      </span>
                    </div>
                    <div className="p-3 bg-muted rounded text-sm whitespace-pre-wrap">
                      {formatPreviewMessage(form.watch("message"), customer)}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          formatPreviewMessage(form.watch("message"), customer)
                        )
                      }
                      className="mt-2"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recipient Selector Modal */}
      {showRecipientSelector && (
        <Card className="fixed inset-4 z-50 overflow-auto bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Select Recipients
            </CardTitle>
            <CardDescription>
              Choose specific customers to receive this campaign
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedRecipients.length} of {customers?.length || 0}{" "}
                  customers selected
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSelectedRecipients(customers?.map((c) => c.id) || [])
                    }
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedRecipients([])}
                  >
                    Clear All
                  </Button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {customers?.map((customer) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted"
                  >
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {customer.phone}
                      </p>
                    </div>
                    <Checkbox
                      checked={selectedRecipients.includes(customer.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedRecipients([
                            ...selectedRecipients,
                            customer.id,
                          ]);
                        } else {
                          setSelectedRecipients(
                            selectedRecipients.filter(
                              (id) => id !== customer.id
                            )
                          );
                        }
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowRecipientSelector(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => setShowRecipientSelector(false)}>
                  Done ({selectedRecipients.length} selected)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
