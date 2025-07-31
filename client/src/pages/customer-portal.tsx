import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Search, Phone, Mail, MapPin, Calendar, DollarSign, Clock, CheckCircle } from "lucide-react";

interface CustomerDevice {
  id: string;
  deviceType: string;
  brand: string;
  model: string;
  problemDescription: string;
  status: string;
  priority: string;
  estimatedCompletionDate: string | null;
  totalCost: number | null;
  paymentStatus: string;
  createdAt: string;
  technicianNotes: string | null;
}

interface CustomerInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  devices: CustomerDevice[];
}

export default function CustomerPortal() {
  const [searchQuery, setSearchQuery] = useState("");
  const [customerData, setCustomerData] = useState<CustomerInfo | null>(null);
  const { toast } = useToast();

  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await fetch(`/api/customer-portal/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }
      return response.json();
    },
    onSuccess: (data: CustomerInfo) => {
      setCustomerData(data);
      if (!data || data.devices.length === 0) {
        toast({
          title: "No Results",
          description: "No devices found for this customer information.",
          variant: "destructive"
        });
      }
    },
    onError: () => {
      toast({
        title: "Search Failed",
        description: "Unable to find customer information. Please check your details.",
        variant: "destructive"
      });
    }
  });

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter your phone number, email, or device ID.",
        variant: "destructive"
      });
      return;
    }
    searchMutation.mutate(searchQuery);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'waiting-parts': return 'bg-yellow-500';
      case 'ready-pickup': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Portal</h1>
        <p className="text-gray-600">Track your device repairs and view service history</p>
      </div>

      {/* Search Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find Your Devices
          </CardTitle>
          <CardDescription>
            Enter your phone number, email address, or device ID to view your repair status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Phone number, email, or device ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button 
              onClick={handleSearch} 
              disabled={searchMutation.isPending}
              className="px-6"
            >
              {searchMutation.isPending ? "Searching..." : "Search"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information */}
      {customerData && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  {customerData.firstName?.charAt(0)}{customerData.lastName?.charAt(0)}
                </div>
                {customerData.firstName} {customerData.lastName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{customerData.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{customerData.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{customerData.address}, {customerData.city}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Devices */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Your Devices</h2>
            {customerData.devices.map((device) => (
              <Card key={device.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {device.brand} {device.model}
                      </CardTitle>
                      <CardDescription>{device.deviceType}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={`${getStatusColor(device.status)} text-white`}>
                        {device.status.replace('-', ' ').toUpperCase()}
                      </Badge>
                      <Badge className={`${getPriorityColor(device.priority)} text-white`}>
                        {device.priority.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="status">Status</TabsTrigger>
                      <TabsTrigger value="payment">Payment</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="details" className="mt-4">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-gray-900">Problem Description</h4>
                          <p className="text-gray-600">{device.problemDescription}</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Received: {new Date(device.createdAt).toLocaleDateString()}
                          </div>
                          {device.estimatedCompletionDate && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Est. Completion: {new Date(device.estimatedCompletionDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="status" className="mt-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${getStatusColor(device.status)}`}></div>
                          <span className="font-medium">Current Status: {device.status.replace('-', ' ')}</span>
                        </div>
                        {device.technicianNotes && (
                          <div>
                            <h4 className="font-medium text-gray-900">Technician Notes</h4>
                            <p className="text-gray-600">{device.technicianNotes}</p>
                          </div>
                        )}
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600">
                            We'll notify you when your device status changes. 
                            If you have questions, please call us at (555) 123-4567.
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="payment" className="mt-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Total Cost</span>
                          <span className="text-lg font-bold">
                            {device.totalCost ? `$${device.totalCost.toFixed(2)}` : 'Estimate Pending'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Payment Status</span>
                          <Badge className={device.paymentStatus === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}>
                            {device.paymentStatus.toUpperCase()}
                          </Badge>
                        </div>
                        {device.paymentStatus === 'pending' && device.totalCost && (
                          <Button className="w-full mt-4">
                            <DollarSign className="h-4 w-4 mr-2" />
                            Pay Online - ${device.totalCost.toFixed(2)}
                          </Button>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!customerData && !searchMutation.isPending && (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Find Your Repairs</h3>
            <p className="text-gray-600">
              Enter your contact information above to view your device repair status and history.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}