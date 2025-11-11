import { useState } from "react";
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
import {
  MessageSquare,
  Smartphone,
  Save,
  RotateCcw,
  Eye,
  Copy,
  CheckCircle,
  Globe,
} from "lucide-react";
import React from "react";

// SMS Template Schema
const smsTemplateSchema = z.object({
  deviceRegistration: z
    .string()
    .min(10, "Message must be at least 10 characters"),
  deviceStatusUpdate: z
    .string()
    .min(10, "Message must be at least 10 characters"),
  deviceReadyForPickup: z
    .string()
    .min(10, "Message must be at least 10 characters"),
  language: z.enum(["amharic", "english", "mixed"]),
});

type SMSTemplateForm = z.infer<typeof smsTemplateSchema>;

interface SMSTemplate {
  id: string;
  deviceRegistration: string;
  deviceStatusUpdate: string;
  deviceReadyForPickup: string;
  language: "amharic" | "english" | "mixed";
  createdAt: string;
  updatedAt: string;
}

// Default templates
const defaultTemplates = {
  amharic: {
    deviceRegistration: `🔧 መሣሪያ ምዝገባ የተረጋገጠ ነው

ውድ {customerName}፣

የእርስዎ መሣሪያ ለጥገና አገልግሎት በተሳካተ ሁኔታ ተመዝግቧል።

📱 የመሣሪያ ዝርዝር፦
• አይነት፦ {deviceType}
• የምርት ስም፦ {brand}
• ሞዴል፦ {model}
• ችግር፦ {problemDescription}

🔢 የመከታተል ቁጥር፦ {receiptNumber}

የጥገና ሂደቱን እንደቀጥለን እንወቃለን። የመከታተል ቁጥሩን በመጠቀም የመሣሪያዎን ሁኔታ መከታተል ይችላሉ።

አገልግሎታችንን ስለመረጡ እናመሰግናለን!`,

    deviceStatusUpdate: `📱 የመሣሪያ ሁኔታ ዝመና

ውድ {customerName}፣

{statusMessage}

🔢 የመከታተል ቁጥር፦ {receiptNumber}
📱 መሣሪያ፦ {deviceType} {brand} {model}{costInfo}{completionInfo}

እባክዎ ትዕግስት ያድርጉ!`,

    deviceReadyForPickup: `🎉 መሣሪያ ለመውሰድ ዝግጁ ነው!

ውድ {customerName}፣

የእርስዎ መሣሪያ ጥገና ተጠናቅቋል እና ለመውሰድ ዝግጁ ነው!

📱 መሣሪያ፦ {deviceType} {brand} {model}
🔢 የመከታተል ቁጥር፦ {receiptNumber}{costInfo}

እባክዎ መሣሪያዎን ሲወስዱ የመከታተል ቁጥሩን ያመጡ።

እርስዎን እንድናይ እንጠብቃለን!`,
  },
  english: {
    deviceRegistration: `🔧 Device Registration Confirmed

Dear {customerName},

Your device has been successfully registered for repair service.

📱 Device Details:
• Type: {deviceType}
• Brand: {brand}
• Model: {model}
• Issue: {problemDescription}

🔢 Tracking Number: {receiptNumber}

We will continue with the repair process. You can track your device status using the tracking number.

Thank you for choosing our service!`,

    deviceStatusUpdate: `📱 Device Status Update

Dear {customerName},

{statusMessage}

🔢 Tracking Number: {receiptNumber}
📱 Device: {deviceType} {brand} {model}{costInfo}{completionInfo}

Please be patient!`,

    deviceReadyForPickup: `🎉 Device Ready for Pickup!

Dear {customerName},

Your device repair has been completed and is ready for pickup!

📱 Device: {deviceType} {brand} {model}
🔢 Tracking Number: {receiptNumber}{costInfo}

Please bring the tracking number when you come to collect your device.

We look forward to seeing you!`,
  },
  mixed: {
    deviceRegistration: `🔧 Device Registration የተረጋገጠ ነው

Dear {customerName} / ውድ {customerName}፣

Your device has been successfully registered for repair service.
የእርስዎ መሣሪያ ለጥገና አገልግሎት በተሳካተ ሁኔታ ተመዝግቧል።

📱 Device Details / የመሣሪያ ዝርዝር፦
• Type/አይነት: {deviceType}
• Brand/የምርት ስም: {brand}
• Model/ሞዴል: {model}
• Issue/ችግር: {problemDescription}

🔢 Tracking Number / የመከታተል ቁጥር: {receiptNumber}

Thank you for choosing our service! / አገልግሎታችንን ስለመረጡ እናመሰግናለን!`,

    deviceStatusUpdate: `📱 Device Status Update / የመሣሪያ ሁኔታ ዝመና

Dear {customerName} / ውድ {customerName}፣

{statusMessage}

🔢 Tracking Number / የመከታተል ቁጥር: {receiptNumber}
📱 Device / መሣሪያ: {deviceType} {brand} {model}{costInfo}{completionInfo}

Please be patient! / እባክዎ ትዕግስት ያድርጉ!`,

    deviceReadyForPickup: `🎉 Device Ready for Pickup! / መሣሪያ ለመውሰድ ዝግጁ ነው!

Dear {customerName} / ውድ {customerName}፣

Your device repair has been completed and is ready for pickup!
የእርስዎ መሣሪያ ጥገና ተጠናቅቋል እና ለመውሰድ ዝግጁ ነው!

📱 Device / መሣሪያ: {deviceType} {brand} {model}
🔢 Tracking Number / የመከታተል ቁጥር: {receiptNumber}{costInfo}

Please bring the tracking number when you come to collect your device.
እባክዎ መሣሪያዎን ሲወስዱ የመከታተል ቁጥሩን ያመጡ።

We look forward to seeing you! / እርስዎን እንድናይ እንጠብቃለን!`,
  },
};

// Available variables for templates
const availableVariables = [
  { variable: "{customerName}", description: "Customer's name" },
  { variable: "{customerPhone}", description: "Customer's phone number" },
  {
    variable: "{deviceType}",
    description: "Type of device (e.g., Laptop, Phone)",
  },
  { variable: "{brand}", description: "Brand name (e.g., Dell, Samsung)" },
  { variable: "{model}", description: "Model name" },
  {
    variable: "{problemDescription}",
    description: "Description of the problem",
  },
  { variable: "{receiptNumber}", description: "Receipt/tracking number" },
  { variable: "{status}", description: "Current status" },
  { variable: "{statusMessage}", description: "Status-specific message" },
  { variable: "{totalCost}", description: "Total cost (if available)" },
  { variable: "{costInfo}", description: "Cost information with formatting" },
  {
    variable: "{estimatedCompletionDate}",
    description: "Estimated completion date",
  },
  {
    variable: "{completionInfo}",
    description: "Completion date with formatting",
  },
];

export function SMSTemplateEditor() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [previewData, setPreviewData] = useState({
    customerName: "Abebe Kebede",
    customerPhone: "+251910039295",
    deviceType: "Laptop",
    brand: "Dell",
    model: "Inspiron 15",
    problemDescription: "Screen not working, battery issues",
    receiptNumber: "LNL-2024-001",
    status: "in_progress",
    statusMessage: "⚙️ በእርስዎ መሣሪያ ላይ እያሰራን ነው።",
    totalCost: "2,500",
    estimatedCompletionDate: "2024-12-25",
  });

  // Fetch SMS templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ["sms-templates"],
    queryFn: async () => {
      const response = await apiRequest("/api/sms-templates", "GET");
      return response as SMSTemplateForm;
    },
  });

  // Update SMS templates mutation
  const updateTemplatesMutation = useMutation({
    mutationFn: async (data: SMSTemplateForm) => {
      return await apiRequest("/api/sms-templates", "PUT", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "SMS templates updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["sms-templates"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update SMS templates",
        variant: "destructive",
      });
    },
  });

  // Reset to default templates mutation
  const resetTemplatesMutation = useMutation({
    mutationFn: async (language: "amharic" | "english" | "mixed") => {
      return await apiRequest("/api/sms-templates/reset", "POST", { language });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "SMS templates reset to default",
      });
      queryClient.invalidateQueries({ queryKey: ["sms-templates"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to reset SMS templates",
        variant: "destructive",
      });
    },
  });

  const form = useForm<SMSTemplateForm>({
    resolver: zodResolver(smsTemplateSchema),
    defaultValues: {
      deviceRegistration: "",
      deviceStatusUpdate: "",
      deviceReadyForPickup: "",
      language: "amharic",
    },
  });

  // Load templates into form when data is available
  React.useEffect(() => {
    if (templates) {
      form.reset({
        deviceRegistration: templates.deviceRegistration || "",
        deviceStatusUpdate: templates.deviceStatusUpdate || "",
        deviceReadyForPickup: templates.deviceReadyForPickup || "",
        language: templates.language || "amharic",
      });
    }
  }, [templates, form]);

  const onSubmit = (data: SMSTemplateForm) => {
    updateTemplatesMutation.mutate(data);
  };

  const handleReset = (language: "amharic" | "english" | "mixed") => {
    const defaultTemplate = defaultTemplates[language];
    form.reset({
      deviceRegistration: defaultTemplate.deviceRegistration,
      deviceStatusUpdate: defaultTemplate.deviceStatusUpdate,
      deviceReadyForPickup: defaultTemplate.deviceReadyForPickup,
      language: language,
    });
    resetTemplatesMutation.mutate(language);
  };

  const handleLanguageChange = (language: "amharic" | "english" | "mixed") => {
    const defaultTemplate = defaultTemplates[language];
    form.setValue("language", language);
    form.setValue("deviceRegistration", defaultTemplate.deviceRegistration);
    form.setValue("deviceStatusUpdate", defaultTemplate.deviceStatusUpdate);
    form.setValue("deviceReadyForPickup", defaultTemplate.deviceReadyForPickup);
  };

  const formatPreviewMessage = (template: string) => {
    return template
      .replace(/{customerName}/g, previewData.customerName)
      .replace(/{customerPhone}/g, previewData.customerPhone)
      .replace(/{deviceType}/g, previewData.deviceType)
      .replace(/{brand}/g, previewData.brand)
      .replace(/{model}/g, previewData.model)
      .replace(/{problemDescription}/g, previewData.problemDescription)
      .replace(/{receiptNumber}/g, previewData.receiptNumber)
      .replace(/{status}/g, previewData.status)
      .replace(/{statusMessage}/g, previewData.statusMessage)
      .replace(/{totalCost}/g, previewData.totalCost)
      .replace(/{costInfo}/g, `\n💰 Total Cost: ${previewData.totalCost} ETB`)
      .replace(
        /{estimatedCompletionDate}/g,
        previewData.estimatedCompletionDate
      )
      .replace(
        /{completionInfo}/g,
        `\n📅 Estimated Completion: ${previewData.estimatedCompletionDate}`
      );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Template copied to clipboard",
    });
  };

  if (isLoading) {
    return <div>Loading SMS templates...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            SMS Message Templates
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Customize the SMS messages sent to customers for device updates
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Language Selection */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Language Settings
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Choose the language for your SMS templates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Language</FormLabel>
                    <Select
                      onValueChange={(
                        value: "amharic" | "english" | "mixed"
                      ) => {
                        field.onChange(value);
                        handleLanguageChange(value);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="amharic">Amharic (አማርኛ)</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="mixed">
                          Mixed (Amharic + English)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the primary language for your SMS messages
                    </FormDescription>
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleReset("amharic")}
                  disabled={resetTemplatesMutation.isPending}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset to Amharic
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleReset("english")}
                  disabled={resetTemplatesMutation.isPending}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset to English
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleReset("mixed")}
                  disabled={resetTemplatesMutation.isPending}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset to Mixed
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Available Variables */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                Available Variables
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Use these variables in your templates to insert dynamic content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableVariables.map((variable) => (
                  <div
                    key={variable.variable}
                    className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <code className="text-sm font-mono bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
                        {variable.variable}
                      </code>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {variable.description}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(variable.variable)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Template Editor */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Smartphone className="h-5 w-5 text-green-600 dark:text-green-400" />
                Message Templates
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Edit your SMS message templates. Use the variables above to
                insert dynamic content.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Device Registration Template */}
              <FormField
                control={form.control}
                name="deviceRegistration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Device Registration Message
                      <Badge variant="secondary">
                        Sent when device is registered
                      </Badge>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter your device registration message template..."
                        className="min-h-[200px] font-mono text-sm"
                      />
                    </FormControl>
                    <FormDescription>
                      This message is sent when a new device is registered for
                      repair
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Device Status Update Template */}
              <FormField
                control={form.control}
                name="deviceStatusUpdate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Device Status Update Message
                      <Badge variant="secondary">
                        Sent when status changes
                      </Badge>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter your device status update message template..."
                        className="min-h-[200px] font-mono text-sm"
                      />
                    </FormControl>
                    <FormDescription>
                      This message is sent when the device status is updated
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Device Ready for Pickup Template */}
              <FormField
                control={form.control}
                name="deviceReadyForPickup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Device Ready for Pickup Message
                      <Badge variant="secondary">
                        Sent when device is ready
                      </Badge>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter your device ready for pickup message template..."
                        className="min-h-[200px] font-mono text-sm"
                      />
                    </FormControl>
                    <FormDescription>
                      This message is sent when the device is ready for pickup
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Eye className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                Message Preview
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Preview how your messages will look with sample data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Device Registration Preview */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded">
                      <MessageSquare className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <Label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Device Registration
                    </Label>
                  </div>
                  <div className="relative">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-2 border-blue-200 dark:border-blue-800 rounded-2xl shadow-sm">
                      <div className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {formatPreviewMessage(form.watch("deviceRegistration"))}
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      copyToClipboard(
                        formatPreviewMessage(form.watch("deviceRegistration"))
                      )
                    }
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Preview
                  </Button>
                </div>

                {/* Status Update Preview */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-green-100 dark:bg-green-900 rounded">
                      <MessageSquare className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                    </div>
                    <Label className="text-sm font-medium text-slate-900 dark:text-slate-100">Status Update</Label>
                  </div>
                  <div className="relative">
                    <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-200 dark:border-green-800 rounded-2xl shadow-sm">
                      <div className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {formatPreviewMessage(form.watch("deviceStatusUpdate"))}
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      copyToClipboard(
                        formatPreviewMessage(form.watch("deviceStatusUpdate"))
                      )
                    }
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Preview
                  </Button>
                </div>

                {/* Ready for Pickup Preview */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-100 dark:bg-purple-900 rounded">
                      <MessageSquare className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <Label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Ready for Pickup
                    </Label>
                  </div>
                  <div className="relative">
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-950/30 dark:to-fuchsia-950/30 border-2 border-purple-200 dark:border-purple-800 rounded-2xl shadow-sm">
                      <div className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {formatPreviewMessage(form.watch("deviceReadyForPickup"))}
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      copyToClipboard(
                        formatPreviewMessage(form.watch("deviceReadyForPickup"))
                      )
                    }
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Preview
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={updateTemplatesMutation.isPending}
              className="min-w-[150px]"
            >
              {updateTemplatesMutation.isPending ? (
                <>
                  <Save className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Templates
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
