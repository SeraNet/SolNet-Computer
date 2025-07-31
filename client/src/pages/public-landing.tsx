import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Star, 
  Shield, 
  CheckCircle, 
  Smartphone, 
  Laptop, 
  Monitor, 
  HardDrive,
  LogIn
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function PublicLanding() {
  const [trackingCode, setTrackingCode] = useState("");
  const [trackingResult, setTrackingResult] = useState(null);

  // Fetch business profile for public display
  const { data: businessProfile } = useQuery({
    queryKey: ["/api/public/business-info"],
  });

  // Fetch public service types
  const { data: services = [] } = useQuery({
    queryKey: ["/api/public/services"],
  });

  // Device tracking function
  const handleDeviceTracking = async () => {
    if (!trackingCode.trim()) return;
    
    try {
      const response = await fetch(`/api/public/track-device/${trackingCode}`);
      if (response.ok) {
        const device = await response.json();
        setTrackingResult(device);
      } else {
        setTrackingResult({ error: "Device not found. Please check your tracking code." });
      }
    } catch (error) {
      setTrackingResult({ error: "Unable to track device. Please try again later." });
    }
  };

  const serviceIcons = {
    "Laptop Repair": Laptop,
    "Phone Repair": Smartphone,
    "Desktop Repair": Monitor,
    "Data Recovery": HardDrive,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Monitor className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {businessProfile?.businessName || "LeulNet Computer Services"}
                </h1>
                <p className="text-sm text-gray-600">Professional Computer Repair Services</p>
              </div>
            </div>
            <Link href="/login">
              <Button variant="outline" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Employee Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-6">
            Expert Computer Repair Services
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Professional repair services for laptops, desktops, phones, and more. 
            Fast, reliable, and affordable solutions for all your technology needs.
          </p>
          
          {/* Device Tracking */}
          <Card className="max-w-md mx-auto mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Track Your Device
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter tracking code"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleDeviceTracking()}
                />
                <Button onClick={handleDeviceTracking}>Track</Button>
              </div>
              
              {trackingResult && (
                <div className="mt-4 p-3 rounded-lg bg-gray-50">
                  {trackingResult.error ? (
                    <p className="text-red-600 text-sm">{trackingResult.error}</p>
                  ) : (
                    <div className="text-left">
                      <p className="font-medium">{trackingResult.customerName}</p>
                      <p className="text-sm text-gray-600">{trackingResult.deviceDescription}</p>
                      <Badge variant={
                        trackingResult.status === 'completed' ? 'default' :
                        trackingResult.status === 'in_progress' ? 'secondary' : 'outline'
                      }>
                        {trackingResult.status?.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        Last updated: {new Date(trackingResult.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h3>
            <p className="text-lg text-gray-600">
              Comprehensive repair services for all your technology needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => {
              const IconComponent = serviceIcons[service.name] || Monitor;
              return (
                <Card key={service.id} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mx-auto h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <IconComponent className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {service.description && (
                      <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                    )}
                    {service.basePrice && (
                      <p className="text-lg font-semibold text-blue-600">
                        Starting at ${service.basePrice}
                      </p>
                    )}
                    {service.estimatedDuration && (
                      <p className="text-xs text-gray-500 mt-2">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {Math.round(service.estimatedDuration / 60)} hours
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Certified Technicians</h4>
              <p className="text-gray-600">
                Our team consists of certified professionals with years of experience 
                in computer repair and maintenance.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Fast Turnaround</h4>
              <p className="text-gray-600">
                Most repairs completed within 24-48 hours. We understand your time is valuable 
                and work efficiently to get your devices back to you quickly.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Quality Guarantee</h4>
              <p className="text-gray-600">
                All repairs come with a comprehensive warranty. If you're not satisfied, 
                we'll make it right at no additional cost.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Get In Touch</h3>
            <p className="text-lg text-gray-600">
              Ready to get your device repaired? Contact us today!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="mx-auto h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2">Call Us</h4>
              <p className="text-gray-600">{businessProfile?.phone || "(555) 123-4567"}</p>
            </div>
            
            <div>
              <div className="mx-auto h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold mb-2">Email Us</h4>
              <p className="text-gray-600">{businessProfile?.email || "info@leulnet.com"}</p>
            </div>
            
            <div>
              <div className="mx-auto h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold mb-2">Visit Us</h4>
              <p className="text-gray-600">
                {businessProfile?.address || "123 Main St, Tech City, TC 12345"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2025 {businessProfile?.businessName || "LeulNet Computer Services"}. 
            All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}