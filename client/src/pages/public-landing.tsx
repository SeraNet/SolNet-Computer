import { useState, startTransition } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { createPortal } from "react-dom";
import {
  Search,
  Phone,
  Mail,
  MapPin,
  Clock,
  Shield,
  CheckCircle,
  Smartphone,
  Laptop,
  Monitor,
  HardDrive,
  LogIn,
  Award,
  Star,
  User,
  Linkedin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Package,
  MessageSquare,
  Send,
  ThumbsUp,
  TrendingUp,
  Users,
  Zap,
  Heart,
  Target,
  Globe,
  Crown,
  Wrench,
  Headphones,
  MessageCircle,
  Eye,
  Loader2,
  ArrowRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { formatCurrency } from "@/lib/currency";
import PrimaryLogoDisplay from "@/components/primary-logo-display";
import EnhancedFooter from "@/components/EnhancedFooter";
import LandingHero from "@/components/landing/LandingHero";
import { ServiceGrid, AccessoryGrid } from "@/components/landing/ServiceGrid";
import CustomModal from "@/components/landing/CustomModal";
import { getIconComponent, getColorClasses } from "@/components/landing/utils";
import type { 
  BusinessProfile, 
  Service, 
  InventoryItem, 
  TrackingResult, 
  CustomerMessage, 
  CustomerFeedback 
} from "@/pages/landing/types";

// Import types for inline use
type Testimonial = any;

export default function PublicLanding() {
  // Wrap the component in a try-catch to handle any unexpected errors
  try {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [trackingCode, setTrackingCode] = useState<string>("");
    const [trackingResult, setTrackingResult] = useState<TrackingResult | null>(
      null
    );
    const [isTracking, setIsTracking] = useState<boolean>(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [showAppointmentModal, setShowAppointmentModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showTrackingModal, setShowTrackingModal] = useState(false);
    const [activeTab, setActiveTab] = useState("message");
    const [messageForm, setMessageForm] = useState<CustomerMessage>({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      serviceType: "",
      urgency: "medium",
    });
    const [feedbackForm, setFeedbackForm] = useState<CustomerFeedback>({
      name: "",
      email: "",
      phone: "",
      serviceType: "",
      overallSatisfaction: 5,
      serviceQuality: 5,
      communication: 5,
      timeliness: 5,
      valueForMoney: 5,
      comments: "",
      wouldRecommend: true,
    });

    // Fetch business profile for public display
    const {
      data: businessProfile = null,
      isLoading: isLoadingProfile,
      isError: isProfileError,
    } = useQuery<BusinessProfile>({
      queryKey: ["business-profile"],
      queryFn: () => apiRequest("/api/business-profile", "GET"),
      retry: 1,
      retryDelay: 1000,
    });

    // Fetch business statistics
    const { data: businessStats } = useQuery<BusinessProfile>({
      queryKey: ["public-business-statistics"],
      queryFn: () => apiRequest("/api/public/business-statistics", "GET"),
    });

    // Fetch public service types
    const { data: services = [] } = useQuery<Service[]>({
      queryKey: ["public", "services"],
      queryFn: () => apiRequest("/api/public/services", "GET"),
    });

    // Fetch public inventory items (replaces accessories)
    const { data: accessories = [] } = useQuery<InventoryItem[]>({
      queryKey: ["inventory", "public"],
      queryFn: () => apiRequest("/api/inventory/public", "GET"),
    });

    // Fetch service types for feedback form
    const { data: serviceTypes = [] } = useQuery<Service[]>({
      queryKey: ["service-types"],
      queryFn: () => apiRequest("/api/service-types", "GET"),
    });

    // Device tracking function
    const handleDeviceTracking = async () => {
      if (!trackingCode.trim() || isTracking) return;

      setIsTracking(true);
      try {
        const response = await fetch(
          `/api/public/track-device/${trackingCode}`
        );
        if (response.ok) {
          const device: TrackingResult = await response.json();
          setTrackingResult(device);
          toast({
            title: "🔍 Device Found!",
            description: "Your device tracking information has been loaded.",
            variant: "default",
            duration: 4000,
          });
        } else {
          setTrackingResult({
            error: "Device not found. Please check your tracking code.",
          });
          toast({
            title: "❌ Device Not Found",
            description: "Please check your tracking code and try again.",
            variant: "destructive",
            duration: 5000,
          });
        }
      } catch (error) {
        setTrackingResult({
          error: "Unable to track device. Please try again later.",
        });
        toast({
          title: "❌ Tracking Error",
          description:
            "Unable to track device. Please check your connection and try again.",
          variant: "destructive",
          duration: 5000,
        });
      } finally {
        setIsTracking(false);
      }
    };

    // Send message mutation
    const sendMessageMutation = useMutation({
      mutationFn: async (data: CustomerMessage) => {
        return await apiRequest("/api/customer-messages", "POST", data);
      },
      onSuccess: () => {
        toast({
          title: "✅ Message Sent Successfully!",
          description:
            "Thank you for contacting us. We'll respond within 24 hours.",
          variant: "default",
          duration: 5000,
        });
        setMessageForm({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          serviceType: "",
          urgency: "medium",
        });
        setShowContactModal(false);
      },
      onError: (error) => {
        toast({
          title: "❌ Message Failed",
          description:
            "Unable to send message. Please check your connection and try again.",
          variant: "destructive",
          duration: 6000,
        });
      },
    });

    // Submit feedback mutation
    const submitFeedbackMutation = useMutation({
      mutationFn: async (data: CustomerFeedback) => {
        return await apiRequest("/api/customer-feedback", "POST", data);
      },
      onSuccess: () => {
        toast({
          title: "⭐ Feedback Submitted Successfully!",
          description:
            "Thank you for your valuable feedback. We appreciate your input!",
          variant: "default",
          duration: 5000,
        });
        setFeedbackForm({
          name: "",
          email: "",
          phone: "",
          serviceType: "",
          overallSatisfaction: 5,
          serviceQuality: 5,
          communication: 5,
          timeliness: 5,
          valueForMoney: 5,
          comments: "",
          wouldRecommend: true,
        });
        setShowFeedbackModal(false);
      },
      onError: (error) => {
        toast({
          title: "❌ Feedback Submission Failed",
          description:
            "Unable to submit feedback. Please check your connection and try again.",
          variant: "destructive",
          duration: 6000,
        });
      },
    });

    // Contact and appointment handlers
    const handleContactUs = () => {
      setShowContactModal(true);
    };

    const handleBookAppointment = () => {
      setShowAppointmentModal(true);
    };

    const handleFeedback = () => {
      setShowFeedbackModal(true);
    };

    const scrollToContact = () => {
      const contactSection = document.getElementById("contact-section");
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: "smooth" });
      }
    };

    const scrollToTracking = () => {
      setShowTrackingModal(true);
    };

    const handleMessageSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      sendMessageMutation.mutate(messageForm);
    };

    const handleFeedbackSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      submitFeedbackMutation.mutate(feedbackForm);
    };

    const renderStars = (
      rating: number,
      onChange: (rating: number) => void
    ) => {
      return (
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="text-2xl hover:scale-110 transition-transform"
            >
              <Star
                className={`h-6 w-6 ${
                  star <= rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
      );
    };

    // Service icons are now handled dynamically through the service data

    // Show loading state while data is being fetched
    if (isLoadingProfile) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading business profile...</p>
          </div>
        </div>
      );
    }

    // Show error state if data failed to load
    if (isProfileError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 text-lg mb-4">
              Failed to load business profile
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Enhanced Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-lg transition-all duration-300">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-white/95 to-indigo-50/50 opacity-80"></div>
          <div className="relative container-fluid">
            <div className="flex justify-between items-center py-4">
              {/* Logo and Brand Section */}
              <div className="flex items-center space-x-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-400 to-slate-600 rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <PrimaryLogoDisplay
                    width={56}
                    height={56}
                    className="relative rounded-xl shadow-lg ring-2 ring-slate-200 bg-white p-1 group-hover:scale-105 transition-transform duration-300"
                    showFallback={true}
                    fallbackText=""
                  />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-lg"></div>
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-slate-400 rounded-full animate-ping"></div>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent hover:from-slate-800 hover:via-slate-900 hover:to-black transition-all duration-300">
                    {businessProfile?.businessName || "Loading..."}
                  </h1>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-3 w-3 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 font-medium">
                      Professional Computer Services
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation and Actions */}
              <div className="flex items-center space-x-2">
                {/* Contact Us Button */}
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-0 relative overflow-hidden group"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleContactUs();
                  }}
                >
                  <Phone className="h-3 w-3 mr-1 relative z-10" />
                  <span className="relative z-10 text-xs font-medium hidden sm:inline">
                    Contact
                  </span>
                </Button>

                {/* Leave Feedback Button */}
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-0 relative overflow-hidden group"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleFeedback();
                  }}
                >
                  <Star className="h-3 w-3 mr-1 relative z-10" />
                  <span className="relative z-10 text-xs font-medium hidden sm:inline">
                    Feedback
                  </span>
                </Button>

                {/* Login Button */}
                <Link href="/login">
                  <Button className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 hover:from-slate-800 hover:via-slate-900 hover:to-black text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <LogIn className="h-4 w-4 mr-2 relative z-10" />
                    <span className="hidden sm:inline relative z-10 font-semibold">
                      Employee Login
                    </span>
                    <span className="sm:hidden relative z-10 font-semibold">
                      Login
                    </span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        {businessProfile && (
          <LandingHero
            businessProfile={businessProfile}
            trackingCode={trackingCode}
            setTrackingCode={setTrackingCode}
            trackingResult={trackingResult}
            isTracking={isTracking}
            onTrack={handleDeviceTracking}
            showTrackingModal={showTrackingModal}
          />
        )}

        {/* Services Section */}
        <ServiceGrid services={services} />

        {/* Accessories Section */}
        <AccessoryGrid accessories={accessories} />

        {/* Features Section */}
        {businessProfile?.publicInfo?.showFeatures &&
          businessProfile?.features &&
          businessProfile.features.length > 0 && (
            <section className="py-8 md:py-10 bg-white">
              <div className="container-fluid">
                <div className="text-center mb-8 md:mb-10">
                  <Badge
                    variant="secondary"
                    className="mb-4 bg-blue-100 text-blue-800"
                  >
                    Why Choose Us
                  </Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                    Advanced Features & Benefits
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 max-w-xl mx-auto">
                    Experience the difference with our cutting-edge technology
                    and exceptional service quality.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {businessProfile?.features
                    .filter((feature) => feature.isActive !== false)
                    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                    .map((feature: any, index: number) => {
                      const IconComponent = getIconComponent(feature.icon);
                      const colorClasses = getColorClasses(feature.color);

                      return (
                        <Card
                          key={index}
                          className={`group transition-colors duration-200 border border-gray-100 shadow-sm ${colorClasses.bg}`}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-3 mb-2">
                              <div
                                className={`h-10 w-10 ${colorClasses.icon} rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform`}
                              >
                                <IconComponent className="h-5 w-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-base font-semibold text-gray-900">
                                  {feature.title}
                                </CardTitle>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {feature.description}
                            </p>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </div>
            </section>
          )}

        {/* Why Choose Us Section */}
        {businessProfile?.publicInfo?.showWhyChooseUs &&
          businessProfile?.whyChooseUs &&
          businessProfile.whyChooseUs.length > 0 && (
            <section className="py-8 md:py-10 bg-gradient-to-br from-indigo-50 to-purple-50">
              <div className="container-fluid">
                <div className="text-center mb-8 md:mb-10">
                  <Badge
                    variant="secondary"
                    className="mb-4 bg-indigo-100 text-indigo-800"
                  >
                    Why Choose Us
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                    Trusted by Thousands
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 max-w-xl mx-auto">
                    We provide exceptional service with a commitment to quality,
                    reliability, and customer satisfaction.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                  {businessProfile.whyChooseUs
                    .filter((item) => item.isActive !== false)
                    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                    .map((item: any, index: number) => {
                      const IconComponent = getIconComponent(item.icon);
                      const colorClasses = getColorClasses(item.color);

                      return (
                        <div key={index} className="text-center group">
                          <div
                            className={`mx-auto h-12 w-12 ${colorClasses.icon} rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}
                          >
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <h4 className="text-lg font-bold mb-2 text-gray-900">
                            {item.title}
                          </h4>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      );
                    })}
                </div>
              </div>
            </section>
          )}

        {/* Enhanced Meet Our Team Section */}
        {businessProfile?.publicInfo?.showTeam && (
          <section className="py-8 md:py-10 bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8 md:mb-10">
                <Badge
                  variant="secondary"
                  className="mb-4 bg-blue-100 text-blue-800"
                >
                  Our Team
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  Meet Our Expert Team
                </h2>
                <p className="text-sm md:text-base text-gray-600 max-w-xl mx-auto">
                  Dedicated professionals committed to providing exceptional
                  service and technical expertise
                </p>
              </div>

              {/* Team Members Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Owner/Founder Card */}
                {businessProfile?.publicInfo?.showOwnerName ? (
                  <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 card-fluid">
                    <CardHeader className="text-center pb-4">
                      <div className="relative mx-auto mb-4">
                        {businessProfile?.publicInfo?.showOwnerPhoto ? (
                          <Avatar className="h-24 w-24 mx-auto">
                            <AvatarImage
                              src={
                                businessProfile?.ownerPhoto
                                  ? `/uploads/${businessProfile.ownerPhoto}`
                                  : undefined
                              }
                              alt={businessProfile?.ownerName || "Owner"}
                            />
                            <AvatarFallback className="text-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                              {businessProfile.ownerName
                                ? businessProfile.ownerName
                                    .split(" ")
                                    .map((n: any) => n[0])
                                    .join("")
                                    .toUpperCase()
                                : "O"}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="h-24 w-24 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <User className="h-12 w-12 text-white" />
                          </div>
                        )}
                        <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-2">
                          <Crown className="h-4 w-4" />
                        </div>
                      </div>
                      <CardTitle className="text-xl text-gray-900">
                        {businessProfile?.ownerName || "Founder & CEO"}
                      </CardTitle>
                      <p className="text-blue-600 font-medium flex items-center justify-center gap-2">
                        <Award className="h-4 w-4" />
                        Founder & Lead Technician
                      </p>
                    </CardHeader>
                    <CardContent className="text-center">
                      {businessProfile?.ownerBio ? (
                        <p className="text-gray-600 leading-relaxed mb-4">
                          {businessProfile.ownerBio}
                        </p>
                      ) : (
                        <p className="text-gray-600 leading-relaxed mb-4">
                          Passionate about technology with years of experience
                          in computer repair and customer service.
                        </p>
                      )}

                      {businessProfile?.publicInfo?.showExperience &&
                        businessProfile?.yearsOfExperience && (
                          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
                            <Clock className="h-4 w-4" />
                            <span>
                              {businessProfile.yearsOfExperience} Years
                              Experience
                            </span>
                          </div>
                        )}

                      {/* Certifications */}
                      {businessProfile?.publicInfo?.showCertifications &&
                        businessProfile?.certifications &&
                        businessProfile.certifications.length > 0 && (
                          <div className="mb-4">
                            <h6 className="font-medium text-gray-900 mb-2 text-sm">
                              Certifications
                            </h6>
                            <div className="flex flex-wrap gap-1 justify-center">
                              {businessProfile.certifications
                                .slice(0, 3)
                                .map((cert: any, index: number) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {cert}
                                  </Badge>
                                ))}
                              {businessProfile.certifications.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{businessProfile.certifications.length - 3}{" "}
                                  more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                      {/* Social Links */}
                      {businessProfile?.socialLinks &&
                        Object.values(businessProfile.socialLinks).some(
                          (link) => link
                        ) && (
                          <div className="flex gap-3 justify-center">
                            {businessProfile.socialLinks.linkedin && (
                              <a
                                href={businessProfile.socialLinks.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                <Linkedin className="h-5 w-5" />
                              </a>
                            )}
                            {businessProfile.socialLinks.twitter && (
                              <a
                                href={businessProfile.socialLinks.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                <Twitter className="h-5 w-5" />
                              </a>
                            )}
                          </div>
                        )}
                    </CardContent>
                  </Card>
                ) : (
                  /* Default Founder Card when owner info is not shown */
                  <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 card-fluid">
                    <CardHeader className="text-center pb-4">
                      <div className="relative mx-auto mb-4">
                        <div className="h-24 w-24 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <User className="h-12 w-12 text-white" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-2">
                          <Crown className="h-4 w-4" />
                        </div>
                      </div>
                      <CardTitle className="text-xl text-gray-900">
                        Founder & CEO
                      </CardTitle>
                      <p className="text-blue-600 font-medium flex items-center justify-center gap-2">
                        <Award className="h-4 w-4" />
                        Lead Technician
                      </p>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-gray-600 leading-relaxed mb-4">
                        Passionate about technology with years of experience in
                        computer repair and customer service.
                      </p>
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
                        <Clock className="h-4 w-4" />
                        <span>10 Years Experience</span>
                      </div>
                      <div className="mb-4">
                        <h6 className="font-medium text-gray-900 mb-2 text-sm">
                          Expertise
                        </h6>
                        <div className="flex flex-wrap gap-1 justify-center">
                          <Badge variant="secondary" className="text-xs">
                            Computer Repair
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            Data Recovery
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            System Optimization
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Dynamic Team Members */}
                {businessProfile.teamMembers?.map(
                  (member: any, index: number) => {
                    if (member.isActive === false) return null;

                    const IconComponent = getIconComponent(member.icon);
                    const colorClasses = getColorClasses(member.color);

                    return (
                      <Card
                        key={index}
                        className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg ${colorClasses.bg}`}
                      >
                        <CardHeader className="text-center pb-4">
                          <div className="relative mx-auto mb-4">
                            <div
                              className={`h-24 w-24 mx-auto ${colorClasses.icon} rounded-full flex items-center justify-center`}
                            >
                              <IconComponent className="h-12 w-12 text-white" />
                            </div>
                          </div>
                          <CardTitle className="text-xl text-gray-900">
                            {member.name}
                          </CardTitle>
                          <p
                            className={`text-${member.color}-600 font-medium flex items-center justify-center gap-2`}
                          >
                            <IconComponent className="h-4 w-4" />
                            {member.title}
                          </p>
                        </CardHeader>
                        <CardContent className="text-center">
                          <p className="text-gray-600 leading-relaxed mb-4">
                            {member.description}
                          </p>
                          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
                            <Clock className="h-4 w-4" />
                            <span>{member.experience}</span>
                          </div>
                          {member.specializations &&
                            member.specializations.length > 0 && (
                              <div className="mb-4">
                                <h6 className="font-medium text-gray-900 mb-2 text-sm">
                                  Specializations
                                </h6>
                                <div className="flex flex-wrap gap-1 justify-center">
                                  {member.specializations
                                    .slice(0, 3)
                                    .map((spec: any, specIndex: number) => (
                                      <Badge
                                        key={specIndex}
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {spec}
                                      </Badge>
                                    ))}
                                  {member.specializations.length > 3 && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      +{member.specializations.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                        </CardContent>
                      </Card>
                    );
                  }
                )}
              </div>
            </div>
          </section>
        )}

        {/* Mission, Vision & Values Section - Independent Section */}
        {businessProfile?.publicInfo?.showMissionVision &&
          (businessProfile?.mission ||
            businessProfile?.vision ||
            (businessProfile?.values && businessProfile.values.length > 0)) && (
            <section className="py-8 md:py-10 bg-gradient-to-br from-slate-50 to-gray-100">
              <div className="container-fluid">
                <div className="text-center mb-8 md:mb-10">
                  <Badge
                    variant="secondary"
                    className="mb-4 bg-purple-100 text-purple-800"
                  >
                    Our Foundation
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                    Mission, Vision & Values
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 max-w-xl mx-auto">
                    The principles and values that guide our business and drive
                    our commitment to excellence
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                  {/* Mission */}
                  {businessProfile?.mission && (
                    <div className="text-center">
                      <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                        <Target className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        Our Mission
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                        {businessProfile.mission}
                      </p>
                    </div>
                  )}

                  {/* Vision */}
                  {businessProfile?.vision && (
                    <div className="text-center">
                      <div className="mx-auto h-16 w-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                        <Eye className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        Our Vision
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                        {businessProfile.vision}
                      </p>
                    </div>
                  )}

                  {/* Core Values */}
                  {businessProfile?.values &&
                    businessProfile.values.length > 0 && (
                      <div className="text-center lg:col-span-1">
                        <div className="mx-auto h-16 w-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4">
                          <Heart className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                          Our Values
                        </h3>
                        <div className="space-y-4">
                          {businessProfile.values
                            .filter((value) => value.isActive !== false)
                            .sort(
                              (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
                            )
                            .map((value: any, index: number) => {
                              const IconComponent = getIconComponent(
                                value.icon
                              );
                              const colorClasses = getColorClasses(value.color);

                              return (
                                <div
                                  key={index}
                                  className="flex items-start gap-3 text-left max-w-md mx-auto"
                                >
                                  <div
                                    className={`h-10 w-10 ${colorClasses.icon} rounded-lg flex items-center justify-center flex-shrink-0`}
                                  >
                                    <IconComponent className="h-5 w-5 text-white" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900 text-base mb-1">
                                      {value.title}
                                    </h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                      {value.description}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </section>
          )}

        {/* Testimonials Section */}
        {businessProfile?.publicInfo?.showTestimonials &&
          businessProfile?.testimonials &&
          businessProfile.testimonials.length > 0 && (
            <section className="py-6 md:py-8 bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
              <div className="container-fluid">
                <div className="text-center mb-6 md:mb-8">
                  <Badge
                    variant="secondary"
                    className="mb-3 bg-amber-50 text-amber-800 border-amber-200"
                  >
                    Customer Reviews
                  </Badge>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                    What Our Customers Say
                  </h2>
                  <p className="text-xs md:text-sm text-gray-600 max-w-lg mx-auto">
                    Don't just take our word for it. Here's what our satisfied
                    customers have to say about our services.
                  </p>
                </div>

                <div className="relative">
                  {/* Horizontal scrolling container */}
                  <div className="flex gap-3 md:gap-4 overflow-x-auto pb-3 scrollbar-hide">
                    {businessProfile.testimonials.map(
                      (testimonial: any, index: number) => {
                        // Handle both old string format and new structured format
                        const testimonialData: Testimonial =
                          typeof testimonial === "string"
                            ? {
                                testimonial,
                                customerName: "Satisfied Customer",
                                rating: 5,
                                customerPhoto: undefined,
                                service: undefined,
                              }
                            : testimonial;

                        return (
                          <Card
                            key={index}
                            className="group transition-all duration-300 border border-gray-100 shadow-lg hover:shadow-md bg-white flex-shrink-0 w-64 md:w-72 rounded-xl hover:-translate-y-0.5"
                          >
                            <CardContent className="p-4 md:p-5">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < testimonialData.rating
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                {testimonialData.isVerified && (
                                  <Badge variant="outline" className="text-[10px] border-green-200 text-green-700 bg-green-50">
                                    Verified
                                  </Badge>
                                )}
                              </div>
                              <blockquote className="text-gray-700 text-sm md:text-sm leading-relaxed mb-3 italic font-normal relative pl-3 border-l-2 border-amber-200">
                                "{testimonialData.testimonial}"
                              </blockquote>
                              <div className="flex items-center">
                                <Avatar className="h-8 w-8 mr-2.5 ring-1 ring-gray-100">
                                  {testimonialData.customerPhoto ? (
                                    <AvatarImage
                                      src={testimonialData.customerPhoto}
                                      alt={testimonialData.customerName}
                                    />
                                  ) : (
                                    <AvatarFallback className="bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 text-xs font-semibold">
                                      {testimonialData.customerName
                                        ?.charAt(0)
                                        .toUpperCase() || "C"}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <div>
                                  <p className="text-sm font-semibold text-gray-900 leading-tight">
                                    {testimonialData.customerName}
                                  </p>
                                  <p className="text-[11px] text-gray-500 mt-0.5">
                                    {testimonialData.service
                                      ? testimonialData.service
                                      : "Verified Client"}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      }
                    )}
                  </div>

                </div>
              </div>
            </section>
          )}

        {/* Contact Section */}
        <section id="contact-section" className="py-8 md:py-10 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 md:mb-10">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                Get In Touch
              </h3>
              <p className="text-sm md:text-base text-gray-600">
                Ready to get your device repaired? Contact us today!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-center">
              <div>
                <div className="mx-auto h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold mb-2">Call Us</h4>
                <p className="text-gray-600">
                  {businessProfile?.phone || "Not available"}
                </p>
              </div>

              <div>
                <div className="mx-auto h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold mb-2">Email Us</h4>
                <p className="text-gray-600">
                  {businessProfile?.email || "Not available"}
                </p>
              </div>

              <div>
                <div className="mx-auto h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-semibold mb-2">Visit Us</h4>
                <p className="text-gray-600">
                  {businessProfile?.address || "Not available"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Footer */}
        <EnhancedFooter
          businessProfile={businessProfile as any}
          onContactUs={handleContactUs}
          onBookAppointment={handleBookAppointment}
          onDeviceTracking={scrollToTracking}
          onFeedback={handleFeedback}
          scrollToContact={scrollToContact}
        />

        {/* Contact Modal */}
        <CustomModal 
          isOpen={showContactModal} 
          onClose={() => setShowContactModal(false)}
          title="Get In Touch"
        >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="[&_input]:!bg-white [&_input]:!border-gray-300 [&_input]:focus-visible:!ring-0 [&_input]:focus-visible:!ring-offset-0 [&_input]:focus-visible:!outline-none [&_textarea]:!bg-white [&_textarea]:!border-gray-300 [&_textarea]:focus-visible:!ring-0 [&_textarea]:focus-visible:!ring-offset-0 [&_textarea]:focus-visible:!outline-none [&_select]:!bg-white [&_select]:!border-gray-300 [&_select]:focus-visible:!ring-0 [&_select]:focus-visible:!ring-offset-0 [&_select]:focus-visible:!outline-none [&_select]:!text-gray-900 [&_option]:!text-gray-900">
                <TabsList className="grid w-full grid-cols-2 h-9">
                  <TabsTrigger
                    value="message"
                    className="flex items-center space-x-1.5 text-xs"
                  >
                    <MessageSquare className="h-3 w-3" />
                    <span>Send Message</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="contact"
                    className="flex items-center space-x-1.5 text-xs"
                  >
                    <Phone className="h-3 w-3" />
                    <span>Contact Info</span>
                  </TabsTrigger>
                </TabsList>

              <TabsContent value="message" className="mt-2">
                <form onSubmit={handleMessageSubmit} className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="name" className="text-gray-700 text-sm">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={messageForm.name}
                        onChange={(e) =>
                          setMessageForm({
                            ...messageForm,
                            name: e.target.value,
                          })
                        }
                        required
                        autoComplete="name"
                        className="mt-1 h-9"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-gray-700 text-sm">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={messageForm.email}
                        onChange={(e) =>
                          setMessageForm({
                            ...messageForm,
                            email: e.target.value,
                          })
                        }
                        required
                        autoComplete="email"
                        className="mt-1 h-9 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="phone" className="text-gray-700 text-sm">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={messageForm.phone}
                        onChange={(e) =>
                          setMessageForm({
                            ...messageForm,
                            phone: e.target.value,
                          })
                        }
                        autoComplete="tel"
                        className="mt-1 h-9 bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="serviceType" className="text-gray-700 text-sm">Service Type</Label>
                      <select
                        id="serviceType"
                        value={messageForm.serviceType}
                        onChange={(e) =>
                          setMessageForm({
                            ...messageForm,
                            serviceType: e.target.value,
                          })
                        }
                        className="w-full mt-1 px-3 py-1.5 h-9 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-gray-300 text-sm text-gray-900"
                      >
                        <option value="">Select a service</option>
                        {serviceTypes.map((service: Service) => (
                          <option key={service.id} value={service.name}>
                            {service.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject" className="text-gray-700 text-sm">Subject *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={messageForm.subject}
                      onChange={(e) =>
                        setMessageForm({
                          ...messageForm,
                          subject: e.target.value,
                        })
                      }
                      required
                      autoComplete="off"
                      className="mt-1 h-9 bg-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="urgency" className="text-gray-700 text-sm">Urgency</Label>
                    <select
                      id="urgency"
                      value={messageForm.urgency}
                      onChange={(e) =>
                        setMessageForm({
                          ...messageForm,
                          urgency: e.target.value as "low" | "medium" | "high",
                        })
                      }
                      className="w-full mt-1 px-3 py-1.5 h-9 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-gray-300 text-sm text-gray-900"
                    >
                      <option value="low">Low - Can wait a few days</option>
                      <option value="medium">Medium - Within 1-2 days</option>
                      <option value="high">
                        High - Need immediate attention
                      </option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-gray-700 text-sm">Message *</Label>
                    <Textarea
                      id="message"
                      rows={2}
                      value={messageForm.message}
                      onChange={(e) =>
                        setMessageForm({
                          ...messageForm,
                          message: e.target.value,
                        })
                      }
                      required
                      placeholder="Describe your issue or inquiry..."
                      className="mt-1 bg-white"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-9"
                    size="sm"
                    disabled={sendMessageMutation.isPending}
                  >
                    {sendMessageMutation.isPending ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="h-3 w-3 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="contact" className="mt-2">
                <div className="space-y-2">
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                      <Phone className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">Call Us</p>
                        <p className="text-xs text-gray-600">
                          {businessProfile?.phone || "Not available"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                      <Mail className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="font-medium text-sm">Email Us</p>
                        <p className="text-xs text-gray-600">
                          {businessProfile?.email || "Not available"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                      <MapPin className="h-4 w-4 text-purple-600" />
                      <div>
                        <p className="font-medium text-sm">Visit Us</p>
                        <p className="text-xs text-gray-600">
                          {businessProfile?.address ||
                            "Edget Primary School, Halaba Kulito, Ethiopia"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => setShowContactModal(false)} size="sm">
                      Close
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
        </CustomModal>

        {/* Feedback Modal */}
        <CustomModal 
          isOpen={showFeedbackModal} 
          onClose={() => setShowFeedbackModal(false)}
          title="Share Your Experience"
        >
            <form onSubmit={handleFeedbackSubmit} className="space-y-2 [&_input]:!bg-white [&_input]:!border-gray-300 [&_input]:focus-visible:!ring-0 [&_input]:focus-visible:!ring-offset-0 [&_input]:focus-visible:!outline-none [&_textarea]:!bg-white [&_textarea]:!border-gray-300 [&_textarea]:focus-visible:!ring-0 [&_textarea]:focus-visible:!ring-offset-0 [&_textarea]:focus-visible:!outline-none [&_select]:!bg-white [&_select]:!border-gray-300 [&_select]:focus-visible:!ring-0 [&_select]:focus-visible:!ring-offset-0 [&_select]:focus-visible:!outline-none [&_select]:!text-gray-900 [&_option]:!text-gray-900">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="feedbackName" className="text-gray-700 text-sm">Name *</Label>
                  <Input
                    id="feedbackName"
                    name="feedbackName"
                    value={feedbackForm.name}
                    onChange={(e) =>
                      setFeedbackForm({ ...feedbackForm, name: e.target.value })
                    }
                    required
                    autoComplete="name"
                    className="mt-1 h-9 bg-white"
                  />
                </div>
                <div>
                  <Label htmlFor="feedbackEmail" className="text-gray-700 text-sm">Email</Label>
                  <Input
                    id="feedbackEmail"
                    name="feedbackEmail"
                    type="email"
                    value={feedbackForm.email}
                    onChange={(e) =>
                      setFeedbackForm({
                        ...feedbackForm,
                        email: e.target.value,
                      })
                    }
                    autoComplete="email"
                    className="mt-1 h-9 bg-white"
                  />
                </div>

                <div>
                  <Label htmlFor="feedbackPhone" className="text-gray-700 text-sm">Phone Number *</Label>
                  <Input
                    id="feedbackPhone"
                    name="feedbackPhone"
                    type="tel"
                    value={feedbackForm.phone}
                    onChange={(e) =>
                      setFeedbackForm({
                        ...feedbackForm,
                        phone: e.target.value,
                      })
                    }
                    placeholder="Enter phone number"
                    required
                    autoComplete="tel"
                    className="mt-1 h-9 bg-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="feedbackServiceType" className="text-gray-700 text-sm">Service Type *</Label>
                <select
                  id="feedbackServiceType"
                  value={feedbackForm.serviceType}
                  onChange={(e) =>
                    setFeedbackForm({
                      ...feedbackForm,
                      serviceType: e.target.value,
                    })
                  }
                  className="w-full mt-1 px-3 py-1.5 h-9 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-gray-300 text-sm text-gray-900"
                  required
                >
                  <option value="">Select a service</option>
                  {serviceTypes.map((service: Service) => (
                    <option key={service.id} value={service.name}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <div>
                  <Label className="text-gray-700 text-sm">Overall Satisfaction *</Label>
                  <div className="mt-1">
                    {renderStars(feedbackForm.overallSatisfaction, (rating) =>
                      setFeedbackForm({
                        ...feedbackForm,
                        overallSatisfaction: rating,
                      })
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-700 text-sm">Service Quality *</Label>
                  <div className="mt-1">
                    {renderStars(feedbackForm.serviceQuality, (rating) =>
                      setFeedbackForm({
                        ...feedbackForm,
                        serviceQuality: rating,
                      })
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-700 text-sm">Communication *</Label>
                  <div className="mt-1">
                    {renderStars(feedbackForm.communication, (rating) =>
                      setFeedbackForm({
                        ...feedbackForm,
                        communication: rating,
                      })
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-700 text-sm">Timeliness *</Label>
                  <div className="mt-1">
                    {renderStars(feedbackForm.timeliness, (rating) =>
                      setFeedbackForm({ ...feedbackForm, timeliness: rating })
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-700 text-sm">Value for Money *</Label>
                  <div className="mt-1">
                    {renderStars(feedbackForm.valueForMoney, (rating) =>
                      setFeedbackForm({
                        ...feedbackForm,
                        valueForMoney: rating,
                      })
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="comments" className="text-gray-700 text-sm">Additional Comments</Label>
                <Textarea
                  id="comments"
                  rows={2}
                  value={feedbackForm.comments}
                  onChange={(e) =>
                    setFeedbackForm({
                      ...feedbackForm,
                      comments: e.target.value,
                    })
                  }
                  placeholder="Share your experience with us..."
                  className="mt-1 bg-white"
                />
              </div>

              <div className="flex items-center space-x-2 py-1">
                <input
                  type="checkbox"
                  id="wouldRecommend"
                  checked={feedbackForm.wouldRecommend}
                  onChange={(e) =>
                    setFeedbackForm({
                      ...feedbackForm,
                      wouldRecommend: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <Label htmlFor="wouldRecommend" className="text-gray-700">
                  I would recommend this service to others
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full h-9"
                size="sm"
                disabled={submitFeedbackMutation.isPending}
              >
                {submitFeedbackMutation.isPending ? (
                  "Submitting..."
                ) : (
                  <>
                    <Star className="h-3 w-3 mr-2" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </form>
        </CustomModal>

        {/* Appointment Modal */}
        <CustomModal 
          isOpen={showAppointmentModal} 
          onClose={() => setShowAppointmentModal(false)}
          title="Book an Appointment"
        >
            <div className="space-y-3">
              <p className="text-gray-600 text-sm">
                To book an appointment, please contact us using one of the
                following methods:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium text-sm">Call to Book</p>
                    <p className="text-xs text-gray-600">
                      {businessProfile?.phone || "Not available"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                  <Mail className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium text-sm">Email to Book</p>
                    <p className="text-xs text-gray-600">
                      {businessProfile?.email || "Not available"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 p-2 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> Please provide your device details and
                  preferred appointment time when contacting us.
                </p>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setShowAppointmentModal(false)} size="sm">
                  Close
                </Button>
              </div>
            </div>
        </CustomModal>

        {/* Tracking Modal */}
        <CustomModal 
          isOpen={showTrackingModal} 
          onClose={() => setShowTrackingModal(false)}
          title="Track Your Device"
        >
            <div className="space-y-4">
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                    <Search className="h-4 w-4" />
                  </span>
                  <Input
                    id="modal-tracking-code"
                    name="trackingCode"
                    placeholder="Enter tracking code"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleDeviceTracking()
                    }
                    className="pl-9"
                    disabled={isTracking}
                  />
                </div>
                <Button
                  onClick={handleDeviceTracking}
                  className="bg-blue-600 hover:bg-blue-700 text-white min-w-[88px]"
                  disabled={isTracking}
                >
                  {isTracking ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Tracking
                    </>
                  ) : (
                    "Track"
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Enter the receipt or tracking code from your repair ticket.
              </p>

              {trackingResult && (
                <div className="mt-4 p-4 rounded-lg bg-gray-50 border">
                  {trackingResult?.error ? (
                    <p className="text-red-600 text-sm">
                      {trackingResult?.error}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <p className="font-medium text-gray-900">
                        {trackingResult?.customerName}
                      </p>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium">Device:</span>{" "}
                          {trackingResult?.deviceType} - {trackingResult?.brand}{" "}
                          {trackingResult?.model}
                        </p>
                        <p>
                          <span className="font-medium">Service:</span>{" "}
                          {trackingResult?.serviceType}
                        </p>
                        <p>
                          <span className="font-medium">Receipt:</span>{" "}
                          {trackingResult?.trackingCode}
                        </p>
                      </div>
                      <div>
                        {trackingResult?.status && (
                          <Badge
                            className={
                              trackingResult?.status === "completed"
                                ? "bg-emerald-100 text-emerald-800"
                                : trackingResult?.status === "in_progress"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {trackingResult?.status
                              .replace("_", " ")
                              .toUpperCase()}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Last updated:{" "}
                        {trackingResult?.updatedAt
                          ? new Date(
                              trackingResult?.updatedAt
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
        </CustomModal>

        <Toaster />
      </div>
    );
  } catch (error) {
    console.error("Error in PublicLanding component:", error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">Something went wrong</p>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      </div>
    );
  }
}
