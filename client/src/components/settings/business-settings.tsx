import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  Save,
  Upload,
  Trash2,
  Image,
  Globe,
  FileText,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

const businessInfoSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Valid email is required"),
  website: z.string().optional(),
  taxId: z.string().optional(),
  licenseNumber: z.string().optional(),
});

type BusinessInfoForm = z.infer<typeof businessInfoSchema>;

export function BusinessSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [primaryLogoFile, setPrimaryLogoFile] = useState<File | null>(null);
  const [primaryLogoPreview, setPrimaryLogoPreview] = useState<string | null>(
    null
  );
  const [iconLogoFile, setIconLogoFile] = useState<File | null>(null);
  const [iconLogoPreview, setIconLogoPreview] = useState<string | null>(null);

  // Load existing business profile data
  const { data: businessProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["business-profile"],
    queryFn: () => apiRequest("/api/business-profile"),
  });

  // Primary Logo management (for website, login, sidebar)
  const { data: currentPrimaryLogo } = useQuery({
    queryKey: ["primary-logo"],
    queryFn: () => apiRequest("/api/logo/primary"),
  });

  const uploadPrimaryLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("logo", file);
      return apiRequest("/api/logo/primary/upload", "POST", formData);
    },
    onSuccess: () => {
      toast({
        title: "Primary Logo Updated",
        description: "Your primary logo has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["primary-logo"] });
      setPrimaryLogoFile(null);
      setPrimaryLogoPreview(null);
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: `Failed to upload primary logo: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deletePrimaryLogoMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/logo/primary", "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Primary Logo Removed",
        description: "Your primary logo has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["primary-logo"] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: `Failed to remove primary logo: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Icon Logo management (for receipts, reports, small spaces)
  const { data: currentIconLogo } = useQuery({
    queryKey: ["icon-logo"],
    queryFn: () => apiRequest("/api/logo/icon"),
  });

  const uploadIconLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("logo", file);
      return apiRequest("/api/logo/icon/upload", "POST", formData);
    },
    onSuccess: () => {
      toast({
        title: "Icon Logo Updated",
        description: "Your icon logo has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["icon-logo"] });
      setIconLogoFile(null);
      setIconLogoPreview(null);
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: `Failed to upload icon logo: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteIconLogoMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/logo/icon", "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Icon Logo Removed",
        description: "Your icon logo has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["icon-logo"] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: `Failed to remove icon logo: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handlePrimaryLogoSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid File",
          description: "Please select an image file (PNG, JPG, JPEG, GIF).",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      setPrimaryLogoFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPrimaryLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrimaryLogoUpload = () => {
    if (primaryLogoFile) {
      uploadPrimaryLogoMutation.mutate(primaryLogoFile);
    }
  };

  const handlePrimaryLogoDelete = () => {
    if (confirm("Are you sure you want to remove the current primary logo?")) {
      deletePrimaryLogoMutation.mutate();
    }
  };

  const handleIconLogoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid File",
          description: "Please select an image file (PNG, JPG, JPEG, GIF).",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      setIconLogoFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setIconLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIconLogoUpload = () => {
    if (iconLogoFile) {
      uploadIconLogoMutation.mutate(iconLogoFile);
    }
  };

  const handleIconLogoDelete = () => {
    if (confirm("Are you sure you want to remove the current icon logo?")) {
      deleteIconLogoMutation.mutate();
    }
  };

  const form = useForm<BusinessInfoForm>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: {
      businessName: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      email: "",
      website: "",
      taxId: "",
      licenseNumber: "",
    },
  });

  // Update form values when business profile data is loaded
  useEffect(() => {
    if (businessProfile) {
      form.reset({
        businessName: businessProfile.businessName || "",
        address: businessProfile.address || "",
        city: businessProfile.city || "",
        state: businessProfile.state || "",
        zipCode: businessProfile.zipCode || "",
        phone: businessProfile.phone || "",
        email: businessProfile.email || "",
        website: businessProfile.website || "",
        taxId: businessProfile.taxId || "",
        licenseNumber: businessProfile.licenseNumber || "",
      });
    }
  }, [businessProfile, form]);

  const mutation = useMutation({
    mutationFn: async (data: BusinessInfoForm) => {
      return apiRequest("/api/settings/business", "PUT", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Business information updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["business-profile"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update business information",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BusinessInfoForm) => {
    mutation.mutate(data);
  };

  const watched = form.watch();

  return (
    <Card className="card-elevated">
      <CardHeader>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 text-white flex items-center justify-center">
              <Building2 className="h-5 w-5" />
            </div>
            <CardTitle className="text-xl text-slate-900 dark:text-slate-100">Business Settings</CardTitle>
          </div>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Maintain a consistent corporate identity across receipts, invoices,
            and communications
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {/* Overview */}
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-800">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-lg border border-slate-300 dark:border-slate-600 flex items-center justify-center bg-slate-50 dark:bg-slate-700">
                {currentPrimaryLogo?.logo?.data ? (
                  <img
                    src={currentPrimaryLogo.logo.data}
                    alt="Primary Logo"
                    className="h-14 w-14 object-contain"
                  />
                ) : (
                  <span className="text-sm text-slate-400 dark:text-slate-500">No logo</span>
                )}
              </div>
              <div className="text-sm">
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {watched.businessName || "Your Business"}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-slate-600 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {watched.city || "City"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {watched.phone || "Phone"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    {watched.email || "Email"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-800">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-lg border border-slate-300 dark:border-slate-600 flex items-center justify-center bg-slate-50 dark:bg-slate-700">
                {currentIconLogo?.logo?.data ? (
                  <img
                    src={currentIconLogo.logo.data}
                    alt="Icon Logo"
                    className="h-14 w-14 object-contain"
                  />
                ) : (
                  <Image className="h-6 w-6 text-slate-300 dark:text-slate-600" />
                )}
              </div>
              <div className="text-sm">
                <p className="font-medium text-slate-900 dark:text-slate-100">Icon Logo</p>
                <p className="text-slate-600 dark:text-slate-400">
                  Optimized for receipts and compact spaces
                </p>
              </div>
            </div>
          </div>
        </div>
        <Separator className="mb-6 dark:bg-slate-700" />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {isLoadingProfile && (
              <div className="text-center py-4">
                <div className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  Loading business information...
                </div>
              </div>
            )}
            {/* Hybrid Logo System */}
            <div className="space-y-8">
              {/* Primary Logo Section */}
              <div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Primary Logo
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Your main logo for website, login screen, and sidebar
                  navigation. This should be your complete logo with company
                  name and design.
                </p>
                <div className="flex items-center space-x-6">
                  {/* Current Primary Logo Display */}
                  <div className="flex-shrink-0">
                    {currentPrimaryLogo?.logo?.data ? (
                      <img
                        src={currentPrimaryLogo.logo.data}
                        alt="Current Primary Logo"
                        className="w-20 h-20 object-contain border border-slate-200 dark:border-slate-700 rounded-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">SN</span>
                      </div>
                    )}
                  </div>

                  {/* Primary Logo Upload Controls */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePrimaryLogoSelect}
                        className="hidden"
                        id="primary-logo-upload"
                      />
                      <label
                        htmlFor="primary-logo-upload"
                        className="cursor-pointer inline-flex items-center px-3 py-2 border border-slate-300 dark:border-slate-600 shadow-sm text-sm leading-4 font-medium rounded-md text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Primary Logo
                      </label>
                      {primaryLogoFile && (
                        <Button
                          type="button"
                          onClick={handlePrimaryLogoUpload}
                          disabled={uploadPrimaryLogoMutation.isPending}
                          size="sm"
                        >
                          {uploadPrimaryLogoMutation.isPending
                            ? "Uploading..."
                            : "Upload"}
                        </Button>
                      )}
                      {currentPrimaryLogo?.logo?.data && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrimaryLogoDelete}
                          disabled={deletePrimaryLogoMutation.isPending}
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      )}
                    </div>

                    {/* Primary Logo Preview */}
                    {primaryLogoPreview && (
                      <div className="mt-3">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Preview:</p>
                        <img
                          src={primaryLogoPreview}
                          alt="Primary Logo Preview"
                          className="w-16 h-16 object-contain border border-slate-200 dark:border-slate-700 rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Icon Logo Section */}
              <div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <Image className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  Icon Logo
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  A simplified icon version for receipts, reports, and small
                  spaces. This should be a clean, recognizable icon that works
                  well at small sizes.
                </p>
                <div className="flex items-center space-x-6">
                  {/* Current Icon Logo Display */}
                  <div className="flex-shrink-0">
                    {currentIconLogo?.logo?.data ? (
                      <img
                        src={currentIconLogo.logo.data}
                        alt="Current Icon Logo"
                        className="w-20 h-20 object-contain border border-slate-200 dark:border-slate-700 rounded-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center">
                        <Image className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                      </div>
                    )}
                  </div>

                  {/* Icon Logo Upload Controls */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleIconLogoSelect}
                        className="hidden"
                        id="icon-logo-upload"
                      />
                      <label
                        htmlFor="icon-logo-upload"
                        className="cursor-pointer inline-flex items-center px-3 py-2 border border-slate-300 dark:border-slate-600 shadow-sm text-sm leading-4 font-medium rounded-md text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Icon Logo
                      </label>
                      {iconLogoFile && (
                        <Button
                          type="button"
                          onClick={handleIconLogoUpload}
                          disabled={uploadIconLogoMutation.isPending}
                          size="sm"
                        >
                          {uploadIconLogoMutation.isPending
                            ? "Uploading..."
                            : "Upload"}
                        </Button>
                      )}
                      {currentIconLogo?.logo?.data && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleIconLogoDelete}
                          disabled={deleteIconLogoMutation.isPending}
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      )}
                    </div>

                    {/* Icon Logo Preview */}
                    {iconLogoPreview && (
                      <div className="mt-3">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Preview:</p>
                        <img
                          src={iconLogoPreview}
                          alt="Icon Logo Preview"
                          className="w-16 h-16 object-contain border border-slate-200 dark:border-slate-700 rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Recommended: Square image, 200x200px or larger. Max file size:
                5MB.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter business name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="business@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="091 334 1664" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Business St" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP Code</FormLabel>
                    <FormControl>
                      <Input placeholder="12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taxId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax ID</FormLabel>
                    <FormControl>
                      <Input placeholder="12-3456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="licenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Number</FormLabel>
                    <FormControl>
                      <Input placeholder="LIC-2024-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              disabled={mutation.isPending || isLoadingProfile}
            >
              <Save className="mr-2 h-4 w-4" />
              {mutation.isPending
                ? "Saving..."
                : isLoadingProfile
                ? "Loading..."
                : "Save Changes"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
