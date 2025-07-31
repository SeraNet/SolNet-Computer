import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
// Using custom tab implementation since Tabs component not available
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
// No longer using react-hook-form, using simple state management instead
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Calendar,
  FileText,
  Settings,
  CreditCard,
  Shield,
  Award,
  Clock,
  DollarSign
} from "lucide-react";
import { type InsertBusinessProfile, type BusinessProfile } from "@shared/schema";

export default function OwnerProfile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");

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
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>
              Update your business details and professional information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex space-x-2 border-b">
                <button
                  onClick={() => setActiveTab("general")}
                  className={`px-4 py-2 border-b-2 font-medium transition-colors ${
                    activeTab === "general" 
                      ? "border-blue-600 text-blue-600" 
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Building2 className="w-4 h-4 inline mr-2" />
                  General Info
                </button>
                <button
                  onClick={() => setActiveTab("contact")}
                  className={`px-4 py-2 border-b-2 font-medium transition-colors ${
                    activeTab === "contact" 
                      ? "border-blue-600 text-blue-600" 
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Mail className="w-4 h-4 inline mr-2" />
                  Contact Details
                </button>
                <button
                  onClick={() => setActiveTab("legal")}
                  className={`px-4 py-2 border-b-2 font-medium transition-colors ${
                    activeTab === "legal" 
                      ? "border-blue-600 text-blue-600" 
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <FileText className="w-4 h-4 inline mr-2" />
                  Legal & Licensing
                </button>
                <button
                  onClick={() => setActiveTab("operational")}
                  className={`px-4 py-2 border-b-2 font-medium transition-colors ${
                    activeTab === "operational" 
                      ? "border-blue-600 text-blue-600" 
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Settings className="w-4 h-4 inline mr-2" />
                  Operations
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                  {activeTab === "general" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="businessName">Business Name</Label>
                          <Input
                            id="businessName"
                            placeholder="LeulNet Computer Services"
                            value={formData.businessName}
                            onChange={(e) => handleInputChange("businessName", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="ownerName">Owner Name</Label>
                          <Input
                            id="ownerName"
                            placeholder="John Doe"
                            value={formData.ownerName}
                            onChange={(e) => handleInputChange("ownerName", e.target.value)}
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
                          placeholder="Professional computer repair and technology services..."
                          className="min-h-[100px]"
                          value={formData.description || ""}
                          onChange={(e) => handleInputChange("description", e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === "contact" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email">Business Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="info@leulnet.com"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Business Phone</Label>
                          <Input
                            id="phone"
                            placeholder="+1 (555) 123-4567"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="address">Street Address</Label>
                        <Input
                          id="address"
                          placeholder="123 Technology Blvd"
                          value={formData.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            placeholder="New York"
                            value={formData.city}
                            onChange={(e) => handleInputChange("city", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            placeholder="NY"
                            value={formData.state}
                            onChange={(e) => handleInputChange("state", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="zipCode">ZIP Code</Label>
                          <Input
                            id="zipCode"
                            placeholder="10001"
                            value={formData.zipCode}
                            onChange={(e) => handleInputChange("zipCode", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "legal" && (
                    <div className="space-y-4">
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
                            placeholder="BL-2024-001234"
                            value={formData.licenseNumber || ""}
                            onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center">
                          <Award className="w-4 h-4 mr-2" />
                          Business Certifications
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          <Badge variant="outline">CompTIA A+ Certified</Badge>
                          <Badge variant="outline">Apple Authorized Service</Badge>
                          <Badge variant="outline">Microsoft Partner</Badge>
                          <Badge variant="outline">BBB Accredited</Badge>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center">
                          <Shield className="w-4 h-4 mr-2" />
                          Insurance Coverage
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="p-3 border rounded-lg">
                            <p className="font-medium">General Liability</p>
                            <p className="text-muted-foreground">$2M Coverage</p>
                          </div>
                          <div className="p-3 border rounded-lg">
                            <p className="font-medium">Professional Liability</p>
                            <p className="text-muted-foreground">$1M Coverage</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "operational" && (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          Business Hours
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <div className="flex justify-between p-2 border rounded">
                              <span>Monday - Friday</span>
                              <span className="font-medium">9:00 AM - 6:00 PM</span>
                            </div>
                            <div className="flex justify-between p-2 border rounded">
                              <span>Saturday</span>
                              <span className="font-medium">10:00 AM - 4:00 PM</span>
                            </div>
                            <div className="flex justify-between p-2 border rounded">
                              <span>Sunday</span>
                              <span className="font-medium text-muted-foreground">Closed</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="p-3 border rounded-lg">
                              <p className="font-medium">Emergency Services</p>
                              <p className="text-muted-foreground">24/7 Available</p>
                              <p className="text-xs text-muted-foreground">Additional charges apply</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center">
                          <DollarSign className="w-4 h-4 mr-2" />
                          Payment & Banking
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="p-3 border rounded-lg">
                            <p className="font-medium">Accepted Payments</p>
                            <div className="mt-2 space-x-2">
                              <Badge variant="outline">Cash</Badge>
                              <Badge variant="outline">Card</Badge>
                              <Badge variant="outline">Digital</Badge>
                            </div>
                          </div>
                          <div className="p-3 border rounded-lg">
                            <p className="font-medium">Banking Partner</p>
                            <p className="text-muted-foreground">Chase Business Banking</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator />
                  
                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending}
                      className="px-6"
                    >
                      {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}