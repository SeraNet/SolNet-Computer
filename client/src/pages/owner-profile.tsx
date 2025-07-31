import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  Calendar, 
  Badge as BadgeIcon,
  FileText,
  Settings,
  Upload,
  Camera,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type InsertBusinessProfile, type BusinessProfile } from "@shared/schema";

export default function OwnerProfile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading } = useQuery<BusinessProfile>({
    queryKey: ["/api/business-profile"],
  });

  const [formData, setFormData] = useState<InsertBusinessProfile>({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "USA",
    website: "",
    logo: "",
    taxId: "",
    licenseNumber: "",
    businessType: "Computer Repair Shop",
    description: "",
  });

  // Update form data when profile loads
  useEffect(() => {
    if (profile && !formData.businessName) {
      setFormData({
        businessName: profile.businessName || "",
        ownerName: profile.ownerName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
        city: profile.city || "",
        state: profile.state || "",
        zipCode: profile.zipCode || "",
        country: profile.country || "USA",
        website: profile.website || "",
        logo: profile.logo || "",
        taxId: profile.taxId || "",
        licenseNumber: profile.licenseNumber || "",
        businessType: profile.businessType || "Computer Repair Shop",
        description: profile.description || "",
        workingHours: profile.workingHours as any,
        socialLinks: profile.socialLinks as any,
        bankingInfo: profile.bankingInfo as any,
        insuranceInfo: profile.insuranceInfo as any,
        certifications: profile.certifications as any,
      });
    }
  }, [profile, formData.businessName]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: InsertBusinessProfile) => {
      const response = await apiRequest("PUT", "/api/business-profile", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Business profile updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/business-profile"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof InsertBusinessProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFormData(prev => ({ ...prev, logo: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Building2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Business Profile</h1>
            <p className="text-muted-foreground">Loading profile information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Building2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Business Profile</h1>
            <p className="text-muted-foreground">Manage your business information and settings</p>
          </div>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          Professional Edition
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Profile Photo & Quick Stats */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Owner Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profile Photo */}
            <div className="flex flex-col items-center space-y-3">
              <div className="relative group">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={formData.logo || "/placeholder-avatar.jpg"} alt="Profile" />
                  <AvatarFallback className="text-lg">
                    {formData.ownerName ? formData.ownerName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 group-hover:bg-primary group-hover:text-primary-foreground"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
              <div className="text-center">
                <p className="font-medium">{formData.ownerName || "Owner Name"}</p>
                <p className="text-sm text-muted-foreground">{formData.businessName || "Business Name"}</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-medium">Established</p>
                  <p className="text-muted-foreground">2020</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-medium">Locations</p>
                  <p className="text-muted-foreground">3 Active</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-medium">Employees</p>
                  <p className="text-muted-foreground">12 Active</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Profile Form */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>
              Update your business details and professional information
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="legal">Legal</TabsTrigger>
                  <TabsTrigger value="business">Business</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="businessName">Business Name *</Label>
                      <Input
                        id="businessName"
                        placeholder="LeulNet Computer Services"
                        value={formData.businessName}
                        onChange={(e) => handleInputChange("businessName", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="ownerName">Owner Name *</Label>
                      <Input
                        id="ownerName"
                        placeholder="John Doe"
                        value={formData.ownerName}
                        onChange={(e) => handleInputChange("ownerName", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="businessType">Business Type</Label>
                      <Input
                        id="businessType"
                        placeholder="Computer Repair Shop"
                        value={formData.businessType || ""}
                        onChange={(e) => handleInputChange("businessType", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        placeholder="https://leulnet.com"
                        value={formData.website || ""}
                        onChange={(e) => handleInputChange("website", e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Business Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Professional computer repair and IT services..."
                      value={formData.description || ""}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      rows={4}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="contact" className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="contact@leulnet.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      placeholder="123 Main Street"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        placeholder="New York"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        placeholder="NY"
                        value={formData.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        placeholder="10001"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange("zipCode", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      placeholder="USA"
                      value={formData.country || "USA"}
                      onChange={(e) => handleInputChange("country", e.target.value)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="legal" className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="taxId">Tax ID / EIN</Label>
                      <Input
                        id="taxId"
                        placeholder="12-3456789"
                        value={formData.taxId || ""}
                        onChange={(e) => handleInputChange("taxId", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="licenseNumber">Business License</Label>
                      <Input
                        id="licenseNumber"
                        placeholder="BL-123456"
                        value={formData.licenseNumber || ""}
                        onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Legal Compliance</h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Ensure your business has all required licenses and permits for computer repair services in your jurisdiction.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="business" className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Business Operations</h4>
                    <p className="text-sm text-muted-foreground">
                      Additional business settings and operational preferences will be available in future updates.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline" className="h-20 flex-col space-y-2">
                        <FileText className="h-6 w-6" />
                        <span>Generate Business Report</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex-col space-y-2">
                        <Settings className="h-6 w-6" />
                        <span>Advanced Settings</span>
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <div className="flex justify-end space-x-2 pt-6 border-t">
                  <Button type="submit" disabled={updateProfileMutation.isPending}>
                    {updateProfileMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </Tabs>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}