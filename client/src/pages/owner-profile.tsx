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
  Save,
  Award,
  Star,
  Clock,
  Globe,
  Linkedin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Shield,
  CheckCircle,
  Edit3,
  Eye,
  EyeOff,
  Plus,
  Edit,
  Trash2,
  Zap,
  Target,
  Wrench,
  Headphones,
  MessageCircle,
  Heart,
  Crown,
  X,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageLayout } from "@/components/layout/page-layout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/currency";
import { BusinessReportTemplate } from "@/components/business-report-template";
import { AdvancedSettingsModal } from "@/components/advanced-settings-modal";
import { TestimonialForm } from "@/components/testimonial-form";
import { RevenueTargetsSettings } from "@/components/revenue-targets-settings";
// Removed react-to-print dependency - using native print instead
import {
  type InsertBusinessProfile,
  type BusinessProfile,
} from "@shared/schema";
// Define proper types for the form data
interface FormData
  extends Omit<
    InsertBusinessProfile,
    | "certifications"
    | "awards"
    | "testimonials"
    | "socialLinks"
    | "workingHours"
    | "publicInfo"
    | "monthlyRevenueTarget"
    | "annualRevenueTarget"
    | "growthTargetPercentage"
  > {
  // Landing page statistics
  totalCustomers?: string;
  totalDevicesRepaired?: string;
  monthlyAverageRepairs?: string;
  customerRetentionRate?: string;
  averageRepairTime?: string;
  warrantyRate?: string;
  happyCustomers?: string;
  averageRating?: string;
  customerSatisfactionRate?: string;
  certifications: string[];
  awards: string[];
  testimonials: any[];
  socialLinks: {
    linkedin: string;
    facebook: string;
    twitter: string;
    instagram: string;
    youtube: string;
  };
  workingHours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  publicInfo: {
    showOwnerName: boolean;
    showOwnerPhoto: boolean;
    showExperience: boolean;
    showCertifications: boolean;
    showAwards: boolean;
    showTestimonials: boolean;
    showFeatures: boolean;
    showTeam: boolean;
    showStats: boolean;
    showWhyChooseUs: boolean;
    showMissionVision: boolean;
  };
  // Landing page content management
  features: Array<{
    title: string;
    description: string;
    icon: string;
    color: string;
    isActive: boolean;
    sortOrder: number;
  }>;
  teamMembers: Array<{
    name: string;
    title: string;
    description: string;
    experience: string;
    specializations: string[];
    icon: string;
    color: string;
    isActive: boolean;
    sortOrder: number;
  }>;
  whyChooseUs: Array<{
    title: string;
    description: string;
    icon: string;
    color: string;
    isActive: boolean;
    sortOrder: number;
  }>;
  // Mission, Vision & Values
  mission: string;
  vision: string;
  values: Array<{
    title: string;
    description: string;
    icon: string;
    color: string;
    isActive: boolean;
    sortOrder: number;
  }>;
}
export default function OwnerProfile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");
  const [showReport, setShowReport] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPublicPreview, setShowPublicPreview] = useState(false);
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  // Dialog state management
  const [showFeatureDialog, setShowFeatureDialog] = useState(false);
  const [showTeamMemberDialog, setShowTeamMemberDialog] = useState(false);
  const [showWhyChooseUsDialog, setShowWhyChooseUsDialog] = useState(false);
  const [showValueDialog, setShowValueDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingType, setEditingType] = useState<
    "feature" | "teamMember" | "whyChooseUs" | "value" | null
  >(null);
  // Form data for dialogs
  const [dialogFormData, setDialogFormData] = useState({
    title: "",
    description: "",
    icon: "Zap",
    color: "blue",
    isActive: true,
    sortOrder: 0,
    // Team member specific fields
    name: "",
    experience: "",
    specializations: [] as string[],
  });
  const { data: profile, isLoading } = useQuery<BusinessProfile>({
    queryKey: ["business-profile"],
    queryFn: () => apiRequest("/api/business-profile", "GET"),
  });
  // Fetch business statistics
  const { data: businessStats } = useQuery<any>({
    queryKey: ["business-statistics"],
    queryFn: () => apiRequest("/api/business-statistics", "GET"),
    staleTime: 0, // Force fresh data
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  const [formData, setFormData] = useState<FormData>({
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
    establishedDate: "",
    // Additional owner information
    ownerBio: "",
    ownerPhoto: "",
    yearsOfExperience: "",
    // Landing page statistics
    totalCustomers: "",
    totalDevicesRepaired: "",
    monthlyAverageRepairs: "",
    customerRetentionRate: "",
    averageRepairTime: "",
    warrantyRate: "",
    certifications: [],
    specializations: [],
    awards: [],
    testimonials: [],
    socialLinks: {
      linkedin: "",
      facebook: "",
      twitter: "",
      instagram: "",
      youtube: "",
    },
    workingHours: {
      monday: { open: "09:00", close: "18:00", closed: false },
      tuesday: { open: "09:00", close: "18:00", closed: false },
      wednesday: { open: "09:00", close: "18:00", closed: false },
      thursday: { open: "09:00", close: "18:00", closed: false },
      friday: { open: "09:00", close: "18:00", closed: false },
      saturday: { open: "10:00", close: "16:00", closed: false },
      sunday: { open: "00:00", close: "00:00", closed: true },
    },
    publicInfo: {
      showOwnerName: true,
      showOwnerPhoto: true,
      showExperience: true,
      showCertifications: true,
      showAwards: true,
      showTestimonials: true,
      showFeatures: true,
      showTeam: true,
      showStats: true,
      showWhyChooseUs: true,
      showMissionVision: true,
    },
    features: [],
    teamMembers: [],
    whyChooseUs: [],
    // Mission, Vision & Values
    mission: "",
    vision: "",
    values: [],
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
        establishedDate: profile.establishedDate || "",
        // Additional owner information
        ownerBio: profile.ownerBio || "",
        ownerPhoto: profile.ownerPhoto || "",
        yearsOfExperience: profile.yearsOfExperience || "",
        // Landing page statistics
        totalCustomers: profile.totalCustomers || "",
        totalDevicesRepaired: profile.totalDevicesRepaired || "",
        monthlyAverageRepairs: profile.monthlyAverageRepairs || "",
        customerRetentionRate: profile.customerRetentionRate || "",
        averageRepairTime: profile.averageRepairTime || "",
        warrantyRate: profile.warrantyRate || "",
        happyCustomers: profile.happyCustomers || "",
        averageRating: profile.averageRating || "",
        customerSatisfactionRate: profile.customerSatisfactionRate || "",
        certifications: (profile.certifications as any) || [],
        specializations: (profile.specializations as any) || [],
        awards: (profile.awards as any) || [],
        testimonials: (profile.testimonials as any) || [],
        workingHours: (profile.workingHours as any) || {
          monday: { open: "09:00", close: "18:00", closed: false },
          tuesday: { open: "09:00", close: "18:00", closed: false },
          wednesday: { open: "09:00", close: "18:00", closed: false },
          thursday: { open: "09:00", close: "18:00", closed: false },
          friday: { open: "09:00", close: "18:00", closed: false },
          saturday: { open: "10:00", close: "16:00", closed: false },
          sunday: { open: "00:00", close: "00:00", closed: true },
        },
        socialLinks: (profile.socialLinks as any) || {
          linkedin: "",
          facebook: "",
          twitter: "",
          instagram: "",
          youtube: "",
        },
        bankingInfo: profile.bankingInfo as any,
        insuranceInfo: profile.insuranceInfo as any,
        publicInfo: (profile.publicInfo as any) || {
          showOwnerName: true,
          showOwnerPhoto: true,
          showExperience: true,
          showCertifications: true,
          showAwards: true,
          showTestimonials: true,
          showFeatures: true,
          showTeam: true,
          showStats: true,
          showWhyChooseUs: true,
          showMissionVision: true,
        },
        features: (profile.features as any) || [
          {
            title: "Fast Diagnostics",
            description:
              "Advanced diagnostic tools provide quick and accurate problem identification, saving you time and money.",
            icon: "Zap",
            color: "blue",
            isActive: true,
            sortOrder: 0,
          },
          {
            title: "Data Protection",
            description:
              "Your data is safe with us. We use industry-standard security measures to protect your valuable information.",
            icon: "Shield",
            color: "green",
            isActive: true,
            sortOrder: 1,
          },
          {
            title: "Precision Repair",
            description:
              "Expert technicians with specialized tools ensure precise repairs that last longer and perform better.",
            icon: "Target",
            color: "purple",
            isActive: true,
            sortOrder: 2,
          },
          {
            title: "Remote Support",
            description:
              "Get instant support from anywhere with our remote assistance services for quick software issues.",
            icon: "Globe",
            color: "yellow",
            isActive: true,
            sortOrder: 3,
          },
        ],
        teamMembers: (profile.teamMembers as any) || [
          {
            name: "Founder & CEO",
            title: "Founder & Lead Technician",
            description:
              "Passionate about technology with years of experience in computer repair and customer service.",
            experience: "10 Years Experience",
            specializations: [
              "Computer Repair",
              "Data Recovery",
              "System Optimization",
            ],
            icon: "Crown",
            color: "blue",
            isActive: true,
            sortOrder: 0,
          },
          {
            name: "Senior Technician",
            title: "Hardware Specialist",
            description:
              "Expert in laptop and desktop repairs with specialized knowledge in data recovery and system optimization.",
            experience: "8+ Years Experience",
            specializations: [
              "Laptop Repair",
              "Data Recovery",
              "System Optimization",
            ],
            icon: "Wrench",
            color: "green",
            isActive: true,
            sortOrder: 1,
          },
          {
            name: "Customer Support",
            title: "Support Specialist",
            description:
              "Dedicated to providing exceptional customer service and ensuring your satisfaction with every interaction.",
            experience: "5+ Years Experience",
            specializations: [
              "Customer Service",
              "Technical Support",
              "Problem Resolution",
            ],
            icon: "Headphones",
            color: "purple",
            isActive: true,
            sortOrder: 2,
          },
        ],
        whyChooseUs: (profile.whyChooseUs as any) || [
          {
            title: "Certified Technicians",
            description:
              "Our team consists of certified professionals with years of experience in computer repair and maintenance. Every technician is trained and certified in the latest repair techniques.",
            icon: "Shield",
            color: "green",
            isActive: true,
            sortOrder: 0,
          },
          {
            title: "Fast Turnaround",
            description:
              "Most repairs completed within 24-48 hours. We understand your time is valuable and work efficiently to get your devices back to you quickly with same-day service available for urgent repairs.",
            icon: "Clock",
            color: "blue",
            isActive: true,
            sortOrder: 1,
          },
          {
            title: "Quality Guarantee",
            description:
              "All repairs come with a comprehensive warranty. If you're not satisfied, we'll make it right at no additional cost. We stand behind our work with industry-leading guarantees.",
            icon: "CheckCircle",
            color: "purple",
            isActive: true,
            sortOrder: 2,
          },
        ],
        // Mission, Vision & Values
        mission: (profile as any).mission || "",
        vision: (profile as any).vision || "",
        values: (profile as any).values || [
          {
            title: "Excellence",
            description:
              "We strive for excellence in every repair and service we provide, ensuring the highest quality standards.",
            icon: "Star",
            color: "yellow",
            isActive: true,
            sortOrder: 0,
          },
          {
            title: "Integrity",
            description:
              "Honest, transparent, and ethical business practices that build trust with our customers.",
            icon: "Shield",
            color: "blue",
            isActive: true,
            sortOrder: 1,
          },
          {
            title: "Innovation",
            description:
              "Continuously improving our skills and adopting the latest technologies to provide better service.",
            icon: "Zap",
            color: "purple",
            isActive: true,
            sortOrder: 2,
          },
        ],
      });
    }
  }, [profile, formData.businessName]);
  const updateProfileMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("/api/business-profile", "PUT", data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Business profile updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["business-profile"] });
      queryClient.invalidateQueries({ queryKey: ["business-statistics"] });
      queryClient.invalidateQueries({
        queryKey: ["public-business-statistics"],
      });
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
    // Note: Revenue targets are handled separately by RevenueTargetsSettings component
    // Only submit the main form data, not revenue targets
    updateProfileMutation.mutate(formData);
  };
  const handleInputChange = (
    field: keyof InsertBusinessProfile,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const handleArrayInputChange = (
    field: keyof InsertBusinessProfile,
    value: string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value },
    }));
  };
  const handlePublicInfoChange = (field: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      publicInfo: { ...prev.publicInfo, [field]: value },
    }));
  };
  const addCertification = () => {
    const cert = prompt("Enter certification name:");
    if (cert) {
      setFormData((prev) => ({
        ...prev,
        certifications: [...prev.certifications, cert],
      }));
    }
  };
  const removeCertification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter(
        (_: string, i: number) => i !== index
      ),
    }));
  };
  const addAward = () => {
    const award = prompt("Enter award name:");
    if (award) {
      setFormData((prev) => ({
        ...prev,
        awards: [...prev.awards, award],
      }));
    }
  };
  const removeAward = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      awards: prev.awards.filter((_: string, i: number) => i !== index),
    }));
  };
  const addTestimonial = () => {
    setShowTestimonialForm(true);
  };
  const handleTestimonialSubmit = (data: {
    customerName: string;
    testimonial: string;
    service?: string;
    rating: number;
    customerPhoto?: string;
  }) => {
    const newTestimonial = {
      id: crypto.randomUUID(),
      customerName: data.customerName,
      testimonial: data.testimonial,
      service: data.service,
      rating: data.rating,
      customerPhoto: data.customerPhoto,
      date: new Date(),
      isVerified: true,
    };
    setFormData((prev) => ({
      ...prev,
      testimonials: [...(prev.testimonials || []), newTestimonial],
    }));
    toast({
      title: "Success",
      description: "Testimonial added successfully!",
    });
  };
  const removeTestimonial = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      testimonials: prev.testimonials?.filter((_, i) => i !== index) || [],
    }));
  };
  // Enhanced dialog management functions
  const openFeatureDialog = (index?: number) => {
    setEditingType("feature");
    setEditingIndex(index ?? null);
    if (index !== undefined) {
      const feature = formData.features?.[index];
      if (feature) {
        setDialogFormData({
          title: feature.title,
          description: feature.description,
          icon: feature.icon,
          color: feature.color,
          isActive: feature.isActive,
          sortOrder: feature.sortOrder,
          name: "",
          experience: "",
          specializations: [],
        });
      }
    } else {
      setDialogFormData({
        title: "",
        description: "",
        icon: "Zap",
        color: "blue",
        isActive: true,
        sortOrder: formData.features?.length || 0,
        name: "",
        experience: "",
        specializations: [],
      });
    }
    setShowFeatureDialog(true);
  };
  const openTeamMemberDialog = (index?: number) => {
    setEditingType("teamMember");
    setEditingIndex(index ?? null);
    if (index !== undefined) {
      const member = formData.teamMembers?.[index];
      if (member) {
        setDialogFormData({
          title: member.title,
          description: member.description,
          icon: member.icon,
          color: member.color,
          isActive: member.isActive,
          sortOrder: member.sortOrder,
          name: member.name,
          experience: member.experience,
          specializations: member.specializations || [],
        });
      }
    } else {
      setDialogFormData({
        title: "",
        description: "",
        icon: "User",
        color: "blue",
        isActive: true,
        sortOrder: formData.teamMembers?.length || 0,
        name: "",
        experience: "",
        specializations: [],
      });
    }
    setShowTeamMemberDialog(true);
  };
  const openWhyChooseUsDialog = (index?: number) => {
    setEditingType("whyChooseUs");
    setEditingIndex(index ?? null);
    if (index !== undefined) {
      const item = formData.whyChooseUs?.[index];
      if (item) {
        setDialogFormData({
          title: item.title,
          description: item.description,
          icon: item.icon,
          color: item.color,
          isActive: item.isActive,
          sortOrder: item.sortOrder,
          name: "",
          experience: "",
          specializations: [],
        });
      }
    } else {
      setDialogFormData({
        title: "",
        description: "",
        icon: "Shield",
        color: "green",
        isActive: true,
        sortOrder: formData.whyChooseUs?.length || 0,
        name: "",
        experience: "",
        specializations: [],
      });
    }
    setShowWhyChooseUsDialog(true);
  };
  const openValueDialog = (index?: number) => {
    setEditingType("value");
    setEditingIndex(index ?? null);
    if (index !== undefined) {
      const value = formData.values?.[index];
      if (value) {
        setDialogFormData({
          title: value.title,
          description: value.description,
          icon: value.icon,
          color: value.color,
          isActive: value.isActive,
          sortOrder: value.sortOrder,
          name: "",
          experience: "",
          specializations: [],
        });
      }
    } else {
      setDialogFormData({
        title: "",
        description: "",
        icon: "Star",
        color: "yellow",
        isActive: true,
        sortOrder: formData.values?.length || 0,
        name: "",
        experience: "",
        specializations: [],
      });
    }
    setShowValueDialog(true);
  };
  const saveFeature = () => {
    if (!dialogFormData.title.trim() || !dialogFormData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and description are required.",
        variant: "destructive",
      });
      return;
    }
    const newFeature = {
      title: dialogFormData.title,
      description: dialogFormData.description,
      icon: dialogFormData.icon,
      color: dialogFormData.color,
      isActive: dialogFormData.isActive,
      sortOrder: dialogFormData.sortOrder,
    };
    if (editingIndex !== null) {
      // Editing existing feature
      const updatedFeatures = [...(formData.features || [])];
      updatedFeatures[editingIndex] = newFeature;
      setFormData((prev) => ({
        ...prev,
        features: updatedFeatures,
      }));
    } else {
      // Adding new feature
      setFormData((prev) => ({
        ...prev,
        features: [...(prev.features || []), newFeature],
      }));
    }
    setShowFeatureDialog(false);
    setEditingIndex(null);
    setEditingType(null);
  };
  const saveTeamMember = () => {
    if (
      !dialogFormData.name.trim() ||
      !dialogFormData.title.trim() ||
      !dialogFormData.description.trim()
    ) {
      toast({
        title: "Validation Error",
        description: "Name, title, and description are required.",
        variant: "destructive",
      });
      return;
    }
    const newMember = {
      name: dialogFormData.name,
      title: dialogFormData.title,
      description: dialogFormData.description,
      experience: dialogFormData.experience,
      specializations: dialogFormData.specializations,
      icon: dialogFormData.icon,
      color: dialogFormData.color,
      isActive: dialogFormData.isActive,
      sortOrder: dialogFormData.sortOrder,
    };
    if (editingIndex !== null) {
      // Editing existing member
      const updatedMembers = [...(formData.teamMembers || [])];
      updatedMembers[editingIndex] = newMember;
      setFormData((prev) => ({
        ...prev,
        teamMembers: updatedMembers,
      }));
    } else {
      // Adding new member
      setFormData((prev) => ({
        ...prev,
        teamMembers: [...(prev.teamMembers || []), newMember],
      }));
    }
    setShowTeamMemberDialog(false);
    setEditingIndex(null);
    setEditingType(null);
  };
  const saveWhyChooseUs = () => {
    if (!dialogFormData.title.trim() || !dialogFormData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and description are required.",
        variant: "destructive",
      });
      return;
    }
    const newItem = {
      title: dialogFormData.title,
      description: dialogFormData.description,
      icon: dialogFormData.icon,
      color: dialogFormData.color,
      isActive: dialogFormData.isActive,
      sortOrder: dialogFormData.sortOrder,
    };
    if (editingIndex !== null) {
      // Editing existing item
      const updatedItems = [...(formData.whyChooseUs || [])];
      updatedItems[editingIndex] = newItem;
      setFormData((prev) => ({
        ...prev,
        whyChooseUs: updatedItems,
      }));
    } else {
      // Adding new item
      setFormData((prev) => ({
        ...prev,
        whyChooseUs: [...(prev.whyChooseUs || []), newItem],
      }));
    }
    setShowWhyChooseUsDialog(false);
    setEditingIndex(null);
    setEditingType(null);
  };
  const saveValue = () => {
    if (!dialogFormData.title.trim() || !dialogFormData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and description are required.",
        variant: "destructive",
      });
      return;
    }
    const newValue = {
      title: dialogFormData.title,
      description: dialogFormData.description,
      icon: dialogFormData.icon,
      color: dialogFormData.color,
      isActive: dialogFormData.isActive,
      sortOrder: dialogFormData.sortOrder,
    };
    if (editingIndex !== null) {
      // Editing existing value
      const updatedValues = [...(formData.values || [])];
      updatedValues[editingIndex] = newValue;
      setFormData((prev) => ({
        ...prev,
        values: updatedValues,
      }));
    } else {
      // Adding new value
      setFormData((prev) => ({
        ...prev,
        values: [...(prev.values || []), newValue],
      }));
    }
    setShowValueDialog(false);
    setEditingIndex(null);
    setEditingType(null);
  };
  // Legacy handlers for backward compatibility
  const handleAddFeature = () => openFeatureDialog();
  const handleEditFeature = (index: number) => openFeatureDialog(index);
  // Legacy handlers for backward compatibility
  const handleAddTeamMember = () => openTeamMemberDialog();
  const handleEditTeamMember = (index: number) => openTeamMemberDialog(index);
  const handleAddWhyChooseUs = () => openWhyChooseUsDialog();
  const handleEditWhyChooseUs = (index: number) => openWhyChooseUsDialog(index);
  const handleAddValue = () => openValueDialog();
  const handleEditValue = (index: number) => openValueDialog(index);
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append("photo", file);
        const response = await fetch("/api/business-profile/photo/upload", {
          method: "POST",
          body: formData,
        });
        if (response.ok) {
          const result = await response.json();
          setFormData((prev) => ({ ...prev, ownerPhoto: result.ownerPhoto }));
          toast({
            title: "✅ Owner Photo Updated",
            description: "Your owner photo has been uploaded successfully.",
            variant: "default",
          });
        } else {
          const error = await response.json();
          toast({
            title: "❌ Upload Failed",
            description: error.message || "Failed to upload owner photo.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "❌ Upload Failed",
          description: "Failed to upload owner photo. Please try again.",
          variant: "destructive",
        });
      }
    }
  };
  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) {
      toast({
        title: "Error",
        description:
          "Unable to open print window. Please check your popup blocker.",
        variant: "destructive",
      });
      return;
    }
    // Get the report content
    const reportContent = reportRef.current?.innerHTML || "";
    // Create the full HTML document for printing
    const printDocument = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Business Report - ${profile?.businessName || "SolNet"}</title>
          <style>
            @page {
              size: A4;
              margin: 1in;
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              color: black;
              background: white;
            }
            .no-print, .modal-overlay {
              display: none !important;
            }
            .business-report-print {
              width: 100%;
              background: white !important;
            }
            /* Print-specific styles */
            h1, h2, h3 { color: black !important; }
            .text-gray-900 { color: black !important; }
            .text-gray-600 { color: #666 !important; }
            .text-gray-700 { color: #333 !important; }
            .border-gray-200 { border-color: #ddd !important; }
            .bg-gray-50 { background-color: #f9f9f9 !important; }
            img { max-width: 100px; max-height: 100px; }
          </style>
        </head>
        <body>
          ${reportContent}
        </body>
      </html>
    `;
    // Write the document and print
    printWindow.document.write(printDocument);
    printWindow.document.close();
    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    };
  };
  if (isLoading) {
    return (
      <PageLayout
        title="Business Profile"
        subtitle="Loading profile information..."
        icon={Building2}
      >
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
      </PageLayout>
    );
  }
  return (
    <PageLayout
      title="Business Profile"
      subtitle="Manage your business information and settings"
      icon={Building2}
      actions={
        <Badge variant="secondary" className="px-3 py-1">
          Professional Edition
        </Badge>
      }
    >
      <div className="grid gap-6 md:grid-cols-4">
        {/* Profile Photo & Quick Stats */}
        <Card className="card-elevated md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">Owner Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profile Photo */}
            <div className="flex flex-col items-center space-y-3">
              <div className="relative group">
                <Avatar className="h-24 w-24 ring-2 ring-slate-200 dark:ring-slate-700">
                  <AvatarImage
                    src={
                      formData.ownerPhoto
                        ? `/uploads/${formData.ownerPhoto}`
                        : formData.logo
                        ? `/uploads/${formData.logo}`
                        : "/placeholder-avatar.jpg"
                    }
                    alt="Profile"
                  />
                  <AvatarFallback className="text-lg bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
                    {formData.ownerName
                      ? formData.ownerName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                      : "U"}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-white dark:bg-slate-800 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <input
                  id="owner-photo-upload"
                  name="ownerPhoto"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
              <div className="text-center">
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {formData.ownerName || "Owner Name"}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {formData.businessName || "Business Name"}
                </p>
              </div>
            </div>
            {/* Quick Stats */}
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <div className="text-sm">
                  <p className="font-medium text-slate-900 dark:text-slate-100">Established</p>
                  <p className="text-slate-600 dark:text-slate-400">
                    {formData.establishedDate
                      ? new Date(formData.establishedDate).getFullYear()
                      : "Not set"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Main Profile Form */}
        <Card className="card-elevated md:col-span-3">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100">Business Information</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Update your business details and professional information
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit}>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-8 h-auto p-1 bg-slate-100 dark:bg-slate-800 rounded-lg mb-6">
                  <TabsTrigger value="general" className="data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm py-2 px-2 rounded-md text-xs">General</TabsTrigger>
                  <TabsTrigger value="contact" className="data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm py-2 px-2 rounded-md text-xs">Contact</TabsTrigger>
                  <TabsTrigger value="legal" className="data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm py-2 px-2 rounded-md text-xs">Legal</TabsTrigger>
                  <TabsTrigger value="owner" className="data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm py-2 px-2 rounded-md text-xs">Owner</TabsTrigger>
                  <TabsTrigger value="social" className="data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm py-2 px-2 rounded-md text-xs">Social</TabsTrigger>
                  <TabsTrigger value="public" className="data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm py-2 px-2 rounded-md text-xs">Public</TabsTrigger>
                  <TabsTrigger value="business" className="data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm py-2 px-2 rounded-md text-xs">Business</TabsTrigger>
                  <TabsTrigger value="landing" className="data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm py-2 px-2 rounded-md text-xs">Landing</TabsTrigger>
                </TabsList>
                <TabsContent value="general" className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="businessName">Business Name *</Label>
                      <Input
                        id="businessName"
                        placeholder="SolNet Computer Services"
                        value={formData.businessName}
                        onChange={(e) =>
                          handleInputChange("businessName", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="ownerName">Owner Name *</Label>
                      <Input
                        id="ownerName"
                        placeholder="Solomon"
                        value={formData.ownerName}
                        onChange={(e) =>
                          handleInputChange("ownerName", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="businessType">Business Type</Label>
                      <Input
                        id="businessType"
                        placeholder="Computer Repair Shop"
                        value={formData.businessType || ""}
                        onChange={(e) =>
                          handleInputChange("businessType", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="establishedDate">Established Date</Label>
                      <Input
                        id="establishedDate"
                        type="date"
                        value={formData.establishedDate || ""}
                        onChange={(e) =>
                          handleInputChange("establishedDate", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        placeholder="https://solnetcomputer.com"
                        value={formData.website || ""}
                        onChange={(e) =>
                          handleInputChange("website", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Business Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Professional computer repair and IT services..."
                      value={formData.description || ""}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
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
                        placeholder="contact@solnetcomputer.com"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        placeholder="+251 091 334 1664"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      placeholder="Edget Primary School"
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
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
                        onChange={(e) =>
                          handleInputChange("city", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        placeholder="NY"
                        value={formData.state}
                        onChange={(e) =>
                          handleInputChange("state", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        placeholder="10001"
                        value={formData.zipCode}
                        onChange={(e) =>
                          handleInputChange("zipCode", e.target.value)
                        }
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
                      onChange={(e) =>
                        handleInputChange("country", e.target.value)
                      }
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
                        onChange={(e) =>
                          handleInputChange("taxId", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="licenseNumber">Business License</Label>
                      <Input
                        id="licenseNumber"
                        placeholder="BL-123456"
                        value={formData.licenseNumber || ""}
                        onChange={(e) =>
                          handleInputChange("licenseNumber", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Legal Compliance
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Ensure your business has all required licenses and permits
                      for computer repair services in your jurisdiction.
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="owner" className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ownerBio">Owner Bio</Label>
                      <Textarea
                        id="ownerBio"
                        placeholder="Tell customers about your experience and expertise..."
                        value={formData.ownerBio || ""}
                        onChange={(e) =>
                          handleInputChange("ownerBio", e.target.value)
                        }
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="yearsOfExperience">
                        Years of Experience
                      </Label>
                      <Input
                        id="yearsOfExperience"
                        placeholder="e.g., 10 years"
                        value={formData.yearsOfExperience || ""}
                        onChange={(e) =>
                          handleInputChange("yearsOfExperience", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  {/* Business Statistics */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="card-elevated">
                      <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Locations</p>
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                          <MapPin className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {businessStats?.activeLocations || 0}
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Operating branches
                      </p>
                      </CardContent>
                    </Card>
                    <Card className="card-elevated">
                      <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Employees</p>
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {businessStats?.activeEmployees || 0}
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Workers & Admins</p>
                      </CardContent>
                    </Card>
                  </div>
                  {/* Certifications */}
                  <Card className="card-elevated">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                      <CardTitle className="text-slate-900 dark:text-slate-100">Certifications</CardTitle>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addCertification}
                      >
                        <Award className="h-4 w-4 mr-1" />
                        Add Certification
                      </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                    <div className="space-y-2">
                      {formData.certifications?.map((cert, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg"
                        >
                          <Award className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span className="flex-1 text-slate-900 dark:text-slate-100">{cert}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCertification(index)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {(!formData.certifications ||
                        formData.certifications.length === 0) && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                          No certifications added yet.
                        </p>
                      )}
                    </div>
                    </CardContent>
                  </Card>
                  {/* Awards */}
                  <Card className="card-elevated">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                      <CardTitle className="text-slate-900 dark:text-slate-100">Awards & Recognition</CardTitle>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addAward}
                      >
                        <Star className="h-4 w-4 mr-1" />
                        Add Award
                      </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                    <div className="space-y-2">
                      {formData.awards?.map((award, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg"
                        >
                          <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                          <span className="flex-1 text-slate-900 dark:text-slate-100">{award}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAward(index)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {(!formData.awards || formData.awards.length === 0) && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                          No awards added yet.
                        </p>
                      )}
                    </div>
                    </CardContent>
                  </Card>
                  {/* Testimonials */}
                  <Card className="card-elevated">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                      <CardTitle className="text-slate-900 dark:text-slate-100">Customer Testimonials</CardTitle>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addTestimonial}
                      >
                        <Star className="h-4 w-4 mr-1" />
                        Add Testimonial
                      </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                    <div className="space-y-3">
                      {formData.testimonials?.map((testimonial, index) => (
                        <div
                          key={index}
                          className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8 ring-1 ring-slate-200 dark:ring-slate-700">
                                {typeof testimonial !== "string" &&
                                testimonial.customerPhoto ? (
                                  <AvatarImage
                                    src={testimonial.customerPhoto}
                                    alt={testimonial.customerName}
                                  />
                                ) : (
                                  <AvatarFallback className="text-xs bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
                                    {typeof testimonial === "string"
                                      ? testimonial.charAt(0).toUpperCase()
                                      : testimonial.customerName
                                          ?.charAt(0)
                                          .toUpperCase() || "C"}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm text-slate-900 dark:text-slate-100">
                                  {typeof testimonial === "string"
                                    ? "Customer"
                                    : testimonial.customerName}
                                </p>
                                {typeof testimonial !== "string" &&
                                  testimonial.service && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      {testimonial.service}
                                    </p>
                                  )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {typeof testimonial !== "string" &&
                                testimonial.rating && (
                                  <div className="flex text-yellow-400 dark:text-yellow-500">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-3 w-3 ${
                                          i < testimonial.rating
                                            ? "fill-current"
                                            : ""
                                        }`}
                                      />
                                    ))}
                                  </div>
                                )}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTestimonial(index)}
                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm italic text-slate-700 dark:text-slate-300">
                            "
                            {typeof testimonial === "string"
                              ? testimonial
                              : testimonial.testimonial}
                            "
                          </p>
                        </div>
                      ))}
                      {(!formData.testimonials ||
                        formData.testimonials.length === 0) && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                          No testimonials added yet.
                        </p>
                      )}
                    </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="social" className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="linkedin">LinkedIn Profile</Label>
                      <Input
                        id="linkedin"
                        placeholder="https://linkedin.com/in/yourprofile"
                        value={formData.socialLinks?.linkedin || ""}
                        onChange={(e) =>
                          handleSocialLinkChange("linkedin", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="facebook">Facebook Page</Label>
                      <Input
                        id="facebook"
                        placeholder="https://facebook.com/yourbusiness"
                        value={formData.socialLinks?.facebook || ""}
                        onChange={(e) =>
                          handleSocialLinkChange("facebook", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="twitter">Twitter/X Profile</Label>
                      <Input
                        id="twitter"
                        placeholder="https://twitter.com/yourhandle"
                        value={formData.socialLinks?.twitter || ""}
                        onChange={(e) =>
                          handleSocialLinkChange("twitter", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="instagram">Instagram Profile</Label>
                      <Input
                        id="instagram"
                        placeholder="https://instagram.com/yourprofile"
                        value={formData.socialLinks?.instagram || ""}
                        onChange={(e) =>
                          handleSocialLinkChange("instagram", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="youtube">YouTube Channel</Label>
                    <Input
                      id="youtube"
                      placeholder="https://youtube.com/@yourchannel"
                      value={formData.socialLinks?.youtube || ""}
                      onChange={(e) =>
                        handleSocialLinkChange("youtube", e.target.value)
                      }
                    />
                  </div>
                </TabsContent>
                <TabsContent value="public" className="space-y-6">
                  <Card className="card-elevated bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-4">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Public Display Settings
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      Control what's visible on your public landing page.
                    </p>
                    </CardContent>
                  </Card>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <div>
                        <Label className="font-medium text-slate-900 dark:text-slate-100">Show Owner Name</Label>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Show owner name publicly
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.publicInfo?.showOwnerName || false}
                        onChange={(e) =>
                          handlePublicInfoChange(
                            "showOwnerName",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <div>
                        <Label className="font-medium text-slate-900 dark:text-slate-100">Show Owner Photo</Label>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Show owner photo publicly
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.publicInfo?.showOwnerPhoto || false}
                        onChange={(e) =>
                          handlePublicInfoChange(
                            "showOwnerPhoto",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <div>
                        <Label className="font-medium text-slate-900 dark:text-slate-100">Show Experience</Label>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Show experience years
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.publicInfo?.showExperience || false}
                        onChange={(e) =>
                          handlePublicInfoChange(
                            "showExperience",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <div>
                        <Label className="font-medium">
                          Show Certifications
                        </Label>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Show certifications
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={
                          formData.publicInfo?.showCertifications || false
                        }
                        onChange={(e) =>
                          handlePublicInfoChange(
                            "showCertifications",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <div>
                        <Label className="font-medium text-slate-900 dark:text-slate-100">Show Awards</Label>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Show awards</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.publicInfo?.showAwards || false}
                        onChange={(e) =>
                          handlePublicInfoChange("showAwards", e.target.checked)
                        }
                        className="h-4 w-4"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <div>
                        <Label className="font-medium text-slate-900 dark:text-slate-100">Show Testimonials</Label>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Show testimonials
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.publicInfo?.showTestimonials || false}
                        onChange={(e) =>
                          handlePublicInfoChange(
                            "showTestimonials",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPublicPreview(true)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview Public Page
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="business" className="space-y-6">
                  {/* Revenue Targets Settings */}
                  <RevenueTargetsSettings />
                  <Card className="card-elevated">
                    <CardHeader>
                      <CardTitle className="text-slate-900 dark:text-slate-100">Quick Actions</CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-400">
                        Access business reports and advanced settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        className="h-24 flex-col space-y-2 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-700"
                        onClick={() => setShowReport(true)}
                      >
                        <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        <span className="text-slate-900 dark:text-slate-100">Business Report</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-24 flex-col space-y-2 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:border-purple-300 dark:hover:border-purple-700"
                        onClick={() => setShowAdvancedSettings(true)}
                      >
                        <Settings className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        <span className="text-slate-900 dark:text-slate-100">Advanced Settings</span>
                      </Button>
                    </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="landing" className="space-y-6">
                  {/* Landing Page Content Management */}
                  <div className="space-y-6">
                    {/* Landing Page Summary */}
                    <Card className="card-elevated bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 border-green-200 dark:border-green-800">
                      <CardContent className="p-6">
                      <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
                        Landing Page Overview
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-blue-600 dark:text-blue-400">
                            {formData.features?.filter(
                              (f) => f.isActive !== false
                            ).length || 0}
                          </div>
                          <div className="text-slate-600 dark:text-slate-400">Active Features</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-green-600 dark:text-green-400">
                            {formData.teamMembers?.filter(
                              (m) => m.isActive !== false
                            ).length || 0}
                          </div>
                          <div className="text-slate-600 dark:text-slate-400">Team Members</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-purple-600 dark:text-purple-400">
                            {formData.whyChooseUs?.filter(
                              (w) => w.isActive !== false
                            ).length || 0}
                          </div>
                          <div className="text-slate-600 dark:text-slate-400">Why Choose Us</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-orange-600 dark:text-orange-400">
                            {
                              Object.values(formData.publicInfo || {}).filter(
                                Boolean
                              ).length
                            }
                          </div>
                          <div className="text-slate-600 dark:text-slate-400">Sections Enabled</div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                        Your landing page is fully customizable. Manage
                        statistics, features, team members, and display settings
                        below.
                      </p>
                      </CardContent>
                    </Card>
                    <Card className="card-elevated">
                      <CardHeader>
                      <CardTitle className="text-slate-900 dark:text-slate-100">
                        Landing Page Statistics
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-400">
                        Manage the statistics displayed on your public landing
                        page. These can be auto-calculated from your system data
                        or manually set.
                      </CardDescription>
                      </CardHeader>
                      <CardContent>
                    {/* Smart Statistics Display */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Years of Experience</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              value={
                                formData.yearsOfExperience ||
                                businessStats?.yearsOfExperience ||
                                "15+"
                              }
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  yearsOfExperience: e.target.value,
                                })
                              }
                              placeholder="e.g., 15+"
                            />
                            {formData.yearsOfExperience ? (
                              <Badge variant="secondary" className="text-xs">
                                Manual
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                Auto
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formData.yearsOfExperience
                              ? "Manual override"
                              : `Auto: ${
                                  businessStats?.rawYearsOfExperience || 15
                                }+ years`}
                          </p>
                        </div>
                        <div>
                          <Label>Total Customers</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              value={
                                formData.totalCustomers ||
                                businessStats?.totalCustomers ||
                                "1000+"
                              }
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  totalCustomers: e.target.value,
                                })
                              }
                              placeholder="e.g., 5000+"
                            />
                            {formData.totalCustomers ? (
                              <div className="flex items-center gap-1">
                                <Badge variant="secondary" className="text-xs">
                                  Manual
                                </Badge>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      totalCustomers: "",
                                    }))
                                  }
                                  title="Reset to auto-calculated"
                                >
                                  ×
                                </Button>
                              </div>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                Auto
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formData.totalCustomers
                              ? "Manual override"
                              : `Auto: ${
                                  businessStats?.rawTotalCustomers || 1000
                                }+ customers`}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Devices Repaired</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              value={
                                formData.totalDevicesRepaired ||
                                businessStats?.totalDevicesRepaired ||
                                "5000+"
                              }
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  totalDevicesRepaired: e.target.value,
                                })
                              }
                              placeholder="e.g., 15000+"
                            />
                            {formData.totalDevicesRepaired ? (
                              <div className="flex items-center gap-1">
                                <Badge variant="secondary" className="text-xs">
                                  Manual
                                </Badge>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      totalDevicesRepaired: "",
                                    }))
                                  }
                                  title="Reset to auto-calculated"
                                >
                                  ×
                                </Button>
                              </div>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                Auto
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formData.totalDevicesRepaired
                              ? "Manual override"
                              : `Auto: ${
                                  businessStats?.rawTotalDevicesRepaired || 5000
                                }+ repairs`}
                          </p>
                        </div>
                        <div>
                          <Label>Happy Customers</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              value={
                                formData.happyCustomers ||
                                businessStats?.happyCustomers ||
                                "450"
                              }
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  happyCustomers: e.target.value,
                                })
                              }
                              placeholder="e.g., 450"
                            />
                            {formData.happyCustomers ? (
                              <div className="flex items-center gap-1">
                                <Badge variant="secondary" className="text-xs">
                                  Manual
                                </Badge>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      happyCustomers: "",
                                    }))
                                  }
                                  title="Reset to auto-calculated"
                                >
                                  ×
                                </Button>
                              </div>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                Auto
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formData.happyCustomers
                              ? "Manual override"
                              : "Auto-calculated from feedback"}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Average Rating</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              value={
                                formData.averageRating ||
                                businessStats?.averageRating ||
                                "4.9"
                              }
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  averageRating: e.target.value,
                                })
                              }
                              placeholder="e.g., 4.9"
                            />
                            {formData.averageRating ? (
                              <div className="flex items-center gap-1">
                                <Badge variant="secondary" className="text-xs">
                                  Manual
                                </Badge>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      averageRating: "",
                                    }))
                                  }
                                  title="Reset to auto-calculated"
                                >
                                  ×
                                </Button>
                              </div>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                Auto
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formData.averageRating
                              ? "Manually set value"
                              : "Auto-calculated from customer feedback"}
                          </p>
                        </div>
                        <div>
                          <Label>Customer Satisfaction Rate</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              value={
                                formData.customerSatisfactionRate ||
                                businessStats?.customerSatisfactionRate ||
                                "95"
                              }
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  customerSatisfactionRate: e.target.value,
                                })
                              }
                              placeholder="e.g., 98"
                            />
                            {formData.customerSatisfactionRate ? (
                              <div className="flex items-center gap-1">
                                <Badge variant="secondary" className="text-xs">
                                  Manual
                                </Badge>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      customerSatisfactionRate: "",
                                    }))
                                  }
                                  title="Reset to auto-calculated"
                                >
                                  ×
                                </Button>
                              </div>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                Auto
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formData.customerSatisfactionRate
                              ? "Manually set value"
                              : "Auto-calculated from customer feedback"}
                          </p>
                        </div>
                      </div>
                      {/* Additional Business Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Monthly Average Repairs</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              value={
                                formData.monthlyAverageRepairs ||
                                `${businessStats?.monthlyAverageRepairs || 30}+`
                              }
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  monthlyAverageRepairs: e.target.value,
                                })
                              }
                              placeholder="e.g., 50+"
                            />
                            {formData.monthlyAverageRepairs ? (
                              <div className="flex items-center gap-1">
                                <Badge variant="secondary" className="text-xs">
                                  Manual
                                </Badge>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      monthlyAverageRepairs: "",
                                    }))
                                  }
                                  title="Reset to auto-calculated"
                                >
                                  ×
                                </Button>
                              </div>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                Auto
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formData.monthlyAverageRepairs
                              ? "Manually set value"
                              : "Auto-calculated average"}
                          </p>
                        </div>
                        <div>
                          <Label>Customer Retention Rate</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              value={
                                formData.customerRetentionRate ||
                                businessStats?.customerRetentionRate ||
                                "95"
                              }
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  customerRetentionRate: e.target.value,
                                })
                              }
                              placeholder="e.g., 98"
                            />
                            {formData.customerRetentionRate ? (
                              <div className="flex items-center gap-1">
                                <Badge variant="secondary" className="text-xs">
                                  Manual
                                </Badge>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      customerRetentionRate: "",
                                    }))
                                  }
                                  title="Reset to auto-calculated"
                                >
                                  ×
                                </Button>
                              </div>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                Auto
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formData.customerRetentionRate
                              ? "Manually set value"
                              : "Auto-calculated rate"}
                          </p>
                        </div>
                        <div>
                          <Label>Average Repair Time</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              value={
                                formData.averageRepairTime ||
                                businessStats?.averageRepairTime ||
                                "24-48 hours"
                              }
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  averageRepairTime: e.target.value,
                                })
                              }
                              placeholder="e.g., Same Day"
                            />
                            {formData.averageRepairTime ? (
                              <div className="flex items-center gap-1">
                                <Badge variant="secondary" className="text-xs">
                                  Manual
                                </Badge>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      averageRepairTime: "",
                                    }))
                                  }
                                  title="Reset to auto-calculated"
                                >
                                  ×
                                </Button>
                              </div>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                Auto
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formData.averageRepairTime
                              ? "Manually set value"
                              : "Industry standard"}
                          </p>
                        </div>
                      </div>
                      {/* Warranty Rate */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Warranty Rate</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              value={
                                formData.warrantyRate ||
                                businessStats?.warrantyRate ||
                                "98%"
                              }
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  warrantyRate: e.target.value,
                                })
                              }
                              placeholder="e.g., 99%"
                            />
                            {formData.warrantyRate ? (
                              <div className="flex items-center gap-1">
                                <Badge variant="secondary" className="text-xs">
                                  Manual
                                </Badge>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      warrantyRate: "",
                                    }))
                                  }
                                  title="Reset to auto-calculated"
                                >
                                  ×
                                </Button>
                              </div>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                Auto
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formData.warrantyRate
                              ? "Manually set value"
                              : "Industry standard warranty rate"}
                          </p>
                        </div>
                      </div>
                    </div>
                      </CardContent>
                    </Card>
                    {/* Information about the smart system */}
                    <Card className="card-elevated bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800">
                      <CardContent className="p-4">
                      <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                        Smart Statistics System
                      </h5>
                      <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
                        For established businesses (15+ years), the system
                        automatically provides realistic statistics even when
                        historical data is limited. Values are calculated from
                        your actual system data when available, or use
                        industry-standard defaults for established businesses.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            Manual
                          </Badge>
                          <span className="text-sm text-blue-800 dark:text-blue-300">
                            You've set a custom value
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Auto
                          </Badge>
                          <span className="text-sm text-blue-800 dark:text-blue-300">
                            System calculated from your data
                          </span>
                        </div>
                      </div>
                      </CardContent>
                    </Card>
                    {/* Quick Actions */}
                    <Card className="card-elevated bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                      <CardContent className="p-4">
                      <h5 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                        Quick Actions
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Clear all manual values to use auto-calculated
                            setFormData((prev) => ({
                              ...prev,
                              yearsOfExperience: "",
                              totalCustomers: "",
                              totalDevicesRepaired: "",
                              monthlyAverageRepairs: "",
                              customerRetentionRate: "",
                              averageRepairTime: "",
                              warrantyRate: "",
                              happyCustomers: "",
                              averageRating: "",
                              customerSatisfactionRate: "",
                            }));
                            toast({
                              title: "Auto-calculated values enabled",
                              description:
                                "All fields will now use system-calculated values",
                            });
                          }}
                        >
                          Use Auto-Calculated Values
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Set realistic manual values for established business
                            setFormData((prev) => ({
                              ...prev,
                              yearsOfExperience: "15+",
                              totalCustomers: "5000+",
                              totalDevicesRepaired: "15000+",
                              monthlyAverageRepairs: "50+",
                              customerRetentionRate: "98",
                              averageRepairTime: "24-48 hours",
                              warrantyRate: "99%",
                              happyCustomers: "4800",
                              averageRating: "4.9",
                              customerSatisfactionRate: "96",
                            }));
                            toast({
                              title: "Realistic values set",
                              description:
                                "Applied industry-standard values for established business",
                            });
                          }}
                        >
                          Set Realistic Values
                        </Button>
                      </div>
                      </CardContent>
                    </Card>
                    {/* Landing page preview and actions */}
                    <Card className="card-elevated bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-800">
                      <CardContent className="p-6">
                      <h5 className="font-medium text-slate-900 dark:text-slate-100 mb-4">
                        Landing Page Preview & Actions
                      </h5>
                      <div className="flex flex-wrap gap-3">
                        <Button
                          type="button"
                          variant="default"
                          onClick={() => window.open("/", "_blank")}
                          className="flex items-center gap-2"
                        >
                          <Globe className="h-4 w-4" />
                          View Public Landing Page
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowPublicPreview(true)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Preview Changes
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            // Reset all landing page content to defaults
                            setFormData((prev) => ({
                              ...prev,
                              features: [
                                {
                                  title: "Fast & Reliable Service",
                                  description:
                                    "Quick turnaround times with guaranteed quality work",
                                  icon: "Zap",
                                  color: "blue",
                                  sortOrder: 1,
                                  isActive: true,
                                },
                                {
                                  title: "Expert Technicians",
                                  description:
                                    "Certified professionals with years of experience",
                                  icon: "Shield",
                                  color: "green",
                                  sortOrder: 2,
                                  isActive: true,
                                },
                                {
                                  title: "Warranty Guaranteed",
                                  description:
                                    "All repairs come with comprehensive warranty coverage",
                                  icon: "CheckCircle",
                                  color: "purple",
                                  sortOrder: 3,
                                  isActive: true,
                                },
                              ],
                              teamMembers: [
                                {
                                  name: "John Smith",
                                  title: "Senior Technician",
                                  experience: "8+ Years Experience",
                                  description:
                                    "Specialized in hardware repairs and system optimization",
                                  icon: "User",
                                  color: "blue",
                                  specializations: [
                                    "Hardware Repair",
                                    "System Optimization",
                                    "Data Recovery",
                                  ],
                                  sortOrder: 1,
                                  isActive: true,
                                },
                                {
                                  name: "Sarah Johnson",
                                  title: "Software Specialist",
                                  experience: "5+ Years Experience",
                                  description:
                                    "Expert in software troubleshooting and virus removal",
                                  icon: "Wrench",
                                  color: "green",
                                  specializations: [
                                    "Software Troubleshooting",
                                    "Virus Removal",
                                    "OS Installation",
                                  ],
                                  sortOrder: 2,
                                  isActive: true,
                                },
                              ],
                              whyChooseUs: [
                                {
                                  title: "Trusted by Thousands",
                                  description:
                                    "Serving the community with reliable computer repair services",
                                  icon: "Shield",
                                  color: "blue",
                                  sortOrder: 1,
                                  isActive: true,
                                },
                                {
                                  title: "Same Day Service",
                                  description:
                                    "Quick repairs when you need them most",
                                  icon: "Clock",
                                  color: "green",
                                  sortOrder: 2,
                                  isActive: true,
                                },
                                {
                                  title: "100% Satisfaction",
                                  description:
                                    "We're not done until you're completely satisfied",
                                  icon: "Heart",
                                  color: "purple",
                                  sortOrder: 3,
                                  isActive: true,
                                },
                              ],
                            }));
                            toast({
                              title: "Default content loaded",
                              description:
                                "Landing page content has been reset to professional defaults",
                            });
                          }}
                          className="flex items-center gap-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Load Defaults
                        </Button>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                        Preview your changes before publishing, or load
                        professional default content to get started quickly.
                      </p>
                      </CardContent>
                    </Card>
                    {/* Features & Benefits Management */}
                    <Card className="card-elevated">
                      <CardHeader>
                        <CardTitle className="text-slate-900 dark:text-slate-100">
                          Features & Benefits
                        </CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-400">
                          Manage the features and benefits displayed on your
                          landing page
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                      <div className="space-y-4">
                        {formData.features?.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={feature.isActive !== false}
                                  onChange={(e) => {
                                    const updatedFeatures = [
                                      ...(formData.features || []),
                                    ];
                                    updatedFeatures[index] = {
                                      ...feature,
                                      isActive: e.target.checked,
                                    };
                                    setFormData({
                                      ...formData,
                                      features: updatedFeatures,
                                    });
                                  }}
                                  className="h-4 w-4"
                                />
                                <span className="text-sm font-medium">
                                  {feature.title}
                                </span>
                              </div>
                              <Badge variant="secondary">{feature.icon}</Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditFeature(index)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const updatedFeatures =
                                    formData.features?.filter(
                                      (_, i) => i !== index
                                    ) || [];
                                  setFormData({
                                    ...formData,
                                    features: updatedFeatures,
                                  });
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddFeature}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Feature
                        </Button>
                      </div>
                      </CardContent>
                    </Card>
                    {/* Team Members Management */}
                    <Card className="card-elevated">
                      <CardHeader>
                        <CardTitle className="text-slate-900 dark:text-slate-100">Team Members</CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-400">
                          Manage your team members displayed on the landing page
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                      <div className="space-y-4">
                        {formData.teamMembers?.map((member, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={member.isActive !== false}
                                  onChange={(e) => {
                                    const updatedMembers = [
                                      ...(formData.teamMembers || []),
                                    ];
                                    updatedMembers[index] = {
                                      ...member,
                                      isActive: e.target.checked,
                                    };
                                    setFormData({
                                      ...formData,
                                      teamMembers: updatedMembers,
                                    });
                                  }}
                                  className="h-4 w-4"
                                />
                                <span className="text-sm font-medium">
                                  {member.name}
                                </span>
                              </div>
                              <Badge variant="secondary">{member.title}</Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditTeamMember(index)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const updatedMembers =
                                    formData.teamMembers?.filter(
                                      (_, i) => i !== index
                                    ) || [];
                                  setFormData({
                                    ...formData,
                                    teamMembers: updatedMembers,
                                  });
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddTeamMember}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Team Member
                        </Button>
                      </div>
                      </CardContent>
                    </Card>
                    {/* Why Choose Us Management */}
                    <Card className="card-elevated">
                      <CardHeader>
                        <CardTitle className="text-slate-900 dark:text-slate-100">Why Choose Us</CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-400">
                          Manage the "Trusted by Thousands" section displayed on
                          your landing page
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                      <div className="space-y-4">
                        {formData.whyChooseUs?.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={item.isActive !== false}
                                  onChange={(e) => {
                                    const updatedItems = [
                                      ...(formData.whyChooseUs || []),
                                    ];
                                    updatedItems[index] = {
                                      ...item,
                                      isActive: e.target.checked,
                                    };
                                    setFormData({
                                      ...formData,
                                      whyChooseUs: updatedItems,
                                    });
                                  }}
                                  className="h-4 w-4"
                                />
                                <span className="text-sm font-medium">
                                  {item.title}
                                </span>
                              </div>
                              <Badge variant="secondary">{item.icon}</Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditWhyChooseUs(index)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const updatedItems =
                                    formData.whyChooseUs?.filter(
                                      (_, i) => i !== index
                                    ) || [];
                                  setFormData({
                                    ...formData,
                                    whyChooseUs: updatedItems,
                                  });
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddWhyChooseUs}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Why Choose Us Item
                        </Button>
                      </div>
                      </CardContent>
                    </Card>
                    {/* Mission, Vision & Values Management */}
                    <Card className="card-elevated">
                      <CardHeader>
                        <CardTitle className="text-slate-900 dark:text-slate-100">
                          Mission, Vision & Values
                        </CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-400">
                          Define your business mission, vision, and core values
                          to build trust and connect with customers
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                      {/* Mission & Vision */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="mission">Mission Statement</Label>
                          <Textarea
                            id="mission"
                            placeholder="e.g., To provide reliable, affordable computer repair services that help our customers stay connected and productive."
                            value={formData.mission}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                mission: e.target.value,
                              })
                            }
                            rows={4}
                            className="mt-2"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Your mission describes what you do and why you do it
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="vision">Vision Statement</Label>
                          <Textarea
                            id="vision"
                            placeholder="e.g., To be the most trusted computer repair service in our community, known for quality, reliability, and exceptional customer care."
                            value={formData.vision}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                vision: e.target.value,
                              })
                            }
                            rows={4}
                            className="mt-2"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Your vision describes your long-term goals and
                            aspirations
                          </p>
                        </div>
                      </div>
                      {/* Core Values */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <Label>Core Values</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddValue}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Value
                          </Button>
                        </div>
                        <div className="space-y-4">
                          {formData.values?.map((value, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                            >
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={value.isActive !== false}
                                    onChange={(e) => {
                                      const updatedValues = [
                                        ...(formData.values || []),
                                      ];
                                      updatedValues[index] = {
                                        ...value,
                                        isActive: e.target.checked,
                                      };
                                      setFormData({
                                        ...formData,
                                        values: updatedValues,
                                      });
                                    }}
                                    className="h-4 w-4"
                                  />
                                  <span className="text-sm font-medium">
                                    {value.title}
                                  </span>
                                </div>
                                <Badge variant="secondary">{value.icon}</Badge>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditValue(index)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const updatedValues =
                                      formData.values?.filter(
                                        (_, i) => i !== index
                                      ) || [];
                                    setFormData({
                                      ...formData,
                                      values: updatedValues,
                                    });
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      </CardContent>
                    </Card>
                    {/* Display Settings */}
                    <Card className="card-elevated">
                      <CardHeader>
                        <CardTitle className="text-slate-900 dark:text-slate-100">Display Settings</CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-400">
                          Control which sections are displayed on your landing
                          page
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                          <div className="flex items-center gap-3">
                            <div>
                              <Label className="font-medium text-slate-900 dark:text-slate-100">
                                Show Features Section
                              </Label>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                Display the features and benefits section
                              </p>
                            </div>
                            <Badge
                              variant={
                                formData.features?.filter(
                                  (f) => f.isActive !== false
                                ).length > 0
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {formData.features?.filter(
                                (f) => f.isActive !== false
                              ).length || 0}{" "}
                              items
                            </Badge>
                          </div>
                          <input
                            type="checkbox"
                            checked={
                              formData.publicInfo?.showFeatures !== false
                            }
                            onChange={(e) =>
                              handlePublicInfoChange(
                                "showFeatures",
                                e.target.checked
                              )
                            }
                            className="h-4 w-4"
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                          <div className="flex items-center gap-3">
                            <div>
                              <Label className="font-medium text-slate-900 dark:text-slate-100">
                                Show Team Section
                              </Label>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                Display the team members section
                              </p>
                            </div>
                            <Badge
                              variant={
                                formData.teamMembers?.filter(
                                  (m) => m.isActive !== false
                                ).length > 0
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {formData.teamMembers?.filter(
                                (m) => m.isActive !== false
                              ).length || 0}{" "}
                              members
                            </Badge>
                          </div>
                          <input
                            type="checkbox"
                            checked={formData.publicInfo?.showTeam !== false}
                            onChange={(e) =>
                              handlePublicInfoChange(
                                "showTeam",
                                e.target.checked
                              )
                            }
                            className="h-4 w-4"
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                          <div>
                            <Label className="font-medium">
                              Show Business Stats
                            </Label>
                            <p className="text-sm text-gray-500">
                              Display business statistics in the team section
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={formData.publicInfo?.showStats !== false}
                            onChange={(e) =>
                              handlePublicInfoChange(
                                "showStats",
                                e.target.checked
                              )
                            }
                            className="h-4 w-4"
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                          <div className="flex items-center gap-3">
                            <div>
                              <Label className="font-medium text-slate-900 dark:text-slate-100">
                                Show Why Choose Us Section
                              </Label>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                Display the "Trusted by Thousands" section
                              </p>
                            </div>
                            <Badge
                              variant={
                                formData.whyChooseUs?.filter(
                                  (w) => w.isActive !== false
                                ).length > 0
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {formData.whyChooseUs?.filter(
                                (w) => w.isActive !== false
                              ).length || 0}{" "}
                              items
                            </Badge>
                          </div>
                          <input
                            type="checkbox"
                            checked={
                              formData.publicInfo?.showWhyChooseUs !== false
                            }
                            onChange={(e) =>
                              handlePublicInfoChange(
                                "showWhyChooseUs",
                                e.target.checked
                              )
                            }
                            className="h-4 w-4"
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                          <div className="flex items-center gap-3">
                            <div>
                              <Label className="font-medium text-slate-900 dark:text-slate-100">
                                Show Mission, Vision & Values
                              </Label>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                Display your business mission, vision, and core
                                values
                              </p>
                            </div>
                            <Badge
                              variant={
                                formData.values?.filter(
                                  (v) => v.isActive !== false
                                ).length > 0
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {formData.values?.filter(
                                (v) => v.isActive !== false
                              ).length || 0}{" "}
                              values
                            </Badge>
                          </div>
                          <input
                            type="checkbox"
                            checked={
                              formData.publicInfo?.showMissionVision !== false
                            }
                            onChange={(e) =>
                              handlePublicInfoChange(
                                "showMissionVision",
                                e.target.checked
                              )
                            }
                            className="h-4 w-4"
                          />
                        </div>
                      </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <div className="flex justify-end space-x-2 pt-6 border-t">
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                  >
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
      {/* Business Report Modal */}
      {showReport && profile && (
        <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 no-print">
          <div className="bg-white rounded-lg p-6 max-w-6xl max-h-[90vh] overflow-auto no-print">
            <div className="flex justify-between items-center mb-4 no-print">
              <h2 className="text-2xl font-bold">Business Report</h2>
              <div className="space-x-2">
                <Button onClick={handlePrint} variant="default">
                  Print Report
                </Button>
                <Button onClick={() => setShowReport(false)} variant="outline">
                  Close
                </Button>
              </div>
            </div>
            <div ref={reportRef} className="print:p-0">
              <BusinessReportTemplate profile={profile} />
            </div>
          </div>
        </div>
      )}
      {/* Advanced Settings Modal */}
      <AdvancedSettingsModal
        isOpen={showAdvancedSettings}
        onClose={() => setShowAdvancedSettings(false)}
      />
      {/* Public Preview Modal */}
      {showPublicPreview && (
        <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Public Page Preview</h2>
              <div className="space-x-2">
                <Button
                  onClick={() => setShowPublicPreview(false)}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Meet Our Team
                </h3>
                <p className="text-gray-600">
                  Professional expertise you can trust
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center space-x-6">
                  {formData.publicInfo?.showOwnerPhoto && (
                    <div className="flex-shrink-0">
                      <Avatar className="h-24 w-24">
                        <AvatarImage
                          src={
                            formData.ownerPhoto
                              ? `/uploads/${formData.ownerPhoto}`
                              : formData.logo
                              ? `/uploads/${formData.logo}`
                              : undefined
                          }
                          alt="Owner"
                        />
                        <AvatarFallback className="text-lg">
                          {formData.ownerName
                            ? formData.ownerName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                            : "O"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                  <div className="flex-1">
                    {formData.publicInfo?.showOwnerName && (
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">
                        {formData.ownerName || "Owner Name"}
                      </h4>
                    )}
                    {formData.publicInfo?.showExperience &&
                      formData.yearsOfExperience && (
                        <p className="text-blue-600 font-medium mb-2">
                          <Clock className="h-4 w-4 inline mr-1" />
                          {formData.yearsOfExperience} of Experience
                        </p>
                      )}
                    {formData.ownerBio && (
                      <p className="text-gray-600 mb-4">{formData.ownerBio}</p>
                    )}
                    {formData.publicInfo?.showCertifications &&
                      formData.certifications &&
                      formData.certifications.length > 0 && (
                        <div className="mb-4">
                          <h5 className="font-medium text-gray-900 mb-2">
                            Certifications
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {formData.certifications.map((cert, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                <Award className="h-3 w-3" />
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    {formData.publicInfo?.showAwards &&
                      formData.awards &&
                      formData.awards.length > 0 && (
                        <div className="mb-4">
                          <h5 className="font-medium text-gray-900 mb-2">
                            Awards & Recognition
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {formData.awards.map((award, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="flex items-center gap-1"
                              >
                                <Star className="h-3 w-3 text-yellow-600" />
                                {award}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    {formData.publicInfo?.showTestimonials &&
                      formData.testimonials &&
                      formData.testimonials.length > 0 && (
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">
                            What Our Customers Say
                          </h5>
                          <div className="space-y-2">
                            {formData.testimonials
                              .slice(0, 2)
                              .map((testimonial, index) => (
                                <div
                                  key={index}
                                  className="bg-gray-50 p-3 rounded"
                                >
                                  <p className="text-sm italic text-gray-700">
                                    "{testimonial}"
                                  </p>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Testimonial Form */}
      <TestimonialForm
        open={showTestimonialForm}
        onOpenChange={setShowTestimonialForm}
        onSubmit={handleTestimonialSubmit}
      />
      {/* Enhanced Feature Dialog */}
      <Dialog open={showFeatureDialog} onOpenChange={setShowFeatureDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? "Edit Feature" : "Add New Feature"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="feature-title">Title</Label>
                <Input
                  id="feature-title"
                  value={dialogFormData.title}
                  onChange={(e) =>
                    setDialogFormData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Feature title"
                />
              </div>
              <div>
                <Label htmlFor="feature-icon">Icon</Label>
                <Select
                  value={dialogFormData.icon}
                  onValueChange={(value) =>
                    setDialogFormData((prev) => ({ ...prev, icon: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent side="bottom" sideOffset={4}>
                    <SelectItem value="Zap">⚡ Zap</SelectItem>
                    <SelectItem value="Shield">🛡️ Shield</SelectItem>
                    <SelectItem value="Target">🎯 Target</SelectItem>
                    <SelectItem value="Globe">🌐 Globe</SelectItem>
                    <SelectItem value="Clock">⏰ Clock</SelectItem>
                    <SelectItem value="CheckCircle">✅ Check Circle</SelectItem>
                    <SelectItem value="Star">⭐ Star</SelectItem>
                    <SelectItem value="Heart">❤️ Heart</SelectItem>
                    <SelectItem value="Crown">👑 Crown</SelectItem>
                    <SelectItem value="Wrench">🔧 Wrench</SelectItem>
                    <SelectItem value="Headphones">🎧 Headphones</SelectItem>
                    <SelectItem value="MessageCircle">
                      💬 Message Circle
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="feature-color">Color</Label>
                <Select
                  value={dialogFormData.color}
                  onValueChange={(value) =>
                    setDialogFormData((prev) => ({ ...prev, color: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent side="bottom" sideOffset={4}>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="yellow">Yellow</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                    <SelectItem value="indigo">Indigo</SelectItem>
                    <SelectItem value="pink">Pink</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="feature-sort">Sort Order</Label>
                <Input
                  id="feature-sort"
                  type="number"
                  value={dialogFormData.sortOrder}
                  onChange={(e) =>
                    setDialogFormData((prev) => ({
                      ...prev,
                      sortOrder: parseInt(e.target.value) || 0,
                    }))
                  }
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="feature-description">Description</Label>
              <Textarea
                id="feature-description"
                value={dialogFormData.description}
                onChange={(e) =>
                  setDialogFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe your feature or benefit"
                rows={4}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="feature-active"
                checked={dialogFormData.isActive}
                onCheckedChange={(checked) =>
                  setDialogFormData((prev) => ({ ...prev, isActive: checked }))
                }
              />
              <Label htmlFor="feature-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowFeatureDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveFeature}>Save Feature</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Enhanced Team Member Dialog */}
      <Dialog
        open={showTeamMemberDialog}
        onOpenChange={setShowTeamMemberDialog}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null
                ? "Edit Team Member"
                : "Add New Team Member"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="member-name">Name</Label>
                <Input
                  id="member-name"
                  value={dialogFormData.name}
                  onChange={(e) =>
                    setDialogFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Team member name"
                />
              </div>
              <div>
                <Label htmlFor="member-title">Title</Label>
                <Input
                  id="member-title"
                  value={dialogFormData.title}
                  onChange={(e) =>
                    setDialogFormData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Job title"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="member-icon">Icon</Label>
                <Select
                  value={dialogFormData.icon}
                  onValueChange={(value) =>
                    setDialogFormData((prev) => ({ ...prev, icon: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent side="bottom" sideOffset={4}>
                    <SelectItem value="User">👤 User</SelectItem>
                    <SelectItem value="Crown">👑 Crown</SelectItem>
                    <SelectItem value="Wrench">🔧 Wrench</SelectItem>
                    <SelectItem value="Headphones">🎧 Headphones</SelectItem>
                    <SelectItem value="Shield">🛡️ Shield</SelectItem>
                    <SelectItem value="Target">🎯 Target</SelectItem>
                    <SelectItem value="Zap">⚡ Zap</SelectItem>
                    <SelectItem value="Star">⭐ Star</SelectItem>
                    <SelectItem value="Heart">❤️ Heart</SelectItem>
                    <SelectItem value="MessageCircle">
                      💬 Message Circle
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="member-color">Color</Label>
                <Select
                  value={dialogFormData.color}
                  onValueChange={(value) =>
                    setDialogFormData((prev) => ({ ...prev, color: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent side="bottom" sideOffset={4}>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="yellow">Yellow</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                    <SelectItem value="indigo">Indigo</SelectItem>
                    <SelectItem value="pink">Pink</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="member-experience">Experience</Label>
              <Input
                id="member-experience"
                value={dialogFormData.experience}
                onChange={(e) =>
                  setDialogFormData((prev) => ({
                    ...prev,
                    experience: e.target.value,
                  }))
                }
                placeholder="e.g., 5+ Years Experience"
              />
            </div>
            <div>
              <Label htmlFor="member-description">Description</Label>
              <Textarea
                id="member-description"
                value={dialogFormData.description}
                onChange={(e) =>
                  setDialogFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe the team member's expertise and experience"
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="member-specializations">
                Specializations (comma-separated)
              </Label>
              <Input
                id="member-specializations"
                value={dialogFormData.specializations.join(", ")}
                onChange={(e) =>
                  setDialogFormData((prev) => ({
                    ...prev,
                    specializations: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter((s) => s.length > 0),
                  }))
                }
                placeholder="Computer Repair, Data Recovery, System Optimization"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="member-sort">Sort Order</Label>
                <Input
                  id="member-sort"
                  type="number"
                  value={dialogFormData.sortOrder}
                  onChange={(e) =>
                    setDialogFormData((prev) => ({
                      ...prev,
                      sortOrder: parseInt(e.target.value) || 0,
                    }))
                  }
                  placeholder="0"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="member-active"
                  checked={dialogFormData.isActive}
                  onCheckedChange={(checked) =>
                    setDialogFormData((prev) => ({
                      ...prev,
                      isActive: checked,
                    }))
                  }
                />
                <Label htmlFor="member-active">Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTeamMemberDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveTeamMember}>Save Team Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Enhanced Why Choose Us Dialog */}
      <Dialog
        open={showWhyChooseUsDialog}
        onOpenChange={setShowWhyChooseUsDialog}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null
                ? "Edit Why Choose Us Item"
                : "Add New Why Choose Us Item"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="why-title">Title</Label>
                <Input
                  id="why-title"
                  value={dialogFormData.title}
                  onChange={(e) =>
                    setDialogFormData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Why choose us title"
                />
              </div>
              <div>
                <Label htmlFor="why-icon">Icon</Label>
                <Select
                  value={dialogFormData.icon}
                  onValueChange={(value) =>
                    setDialogFormData((prev) => ({ ...prev, icon: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent side="bottom" sideOffset={4}>
                    <SelectItem value="Shield">🛡️ Shield</SelectItem>
                    <SelectItem value="Clock">⏰ Clock</SelectItem>
                    <SelectItem value="CheckCircle">✅ Check Circle</SelectItem>
                    <SelectItem value="Star">⭐ Star</SelectItem>
                    <SelectItem value="Heart">❤️ Heart</SelectItem>
                    <SelectItem value="Crown">👑 Crown</SelectItem>
                    <SelectItem value="Zap">⚡ Zap</SelectItem>
                    <SelectItem value="Target">🎯 Target</SelectItem>
                    <SelectItem value="Wrench">🔧 Wrench</SelectItem>
                    <SelectItem value="Headphones">🎧 Headphones</SelectItem>
                    <SelectItem value="MessageCircle">
                      💬 Message Circle
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="why-color">Color</Label>
                <Select
                  value={dialogFormData.color}
                  onValueChange={(value) =>
                    setDialogFormData((prev) => ({ ...prev, color: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent side="bottom" sideOffset={4}>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="yellow">Yellow</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                    <SelectItem value="indigo">Indigo</SelectItem>
                    <SelectItem value="pink">Pink</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="why-sort">Sort Order</Label>
                <Input
                  id="why-sort"
                  type="number"
                  value={dialogFormData.sortOrder}
                  onChange={(e) =>
                    setDialogFormData((prev) => ({
                      ...prev,
                      sortOrder: parseInt(e.target.value) || 0,
                    }))
                  }
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="why-description">Description</Label>
              <Textarea
                id="why-description"
                value={dialogFormData.description}
                onChange={(e) =>
                  setDialogFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe why customers should choose your business"
                rows={4}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="why-active"
                checked={dialogFormData.isActive}
                onCheckedChange={(checked) =>
                  setDialogFormData((prev) => ({ ...prev, isActive: checked }))
                }
              />
              <Label htmlFor="why-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowWhyChooseUsDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveWhyChooseUs}>Save Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Enhanced Value Dialog */}
      <Dialog open={showValueDialog} onOpenChange={setShowValueDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? "Edit Value" : "Add New Value"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="value-title">Title</Label>
                <Input
                  id="value-title"
                  value={dialogFormData.title}
                  onChange={(e) =>
                    setDialogFormData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Value title"
                />
              </div>
              <div>
                <Label htmlFor="value-icon">Icon</Label>
                <Select
                  value={dialogFormData.icon}
                  onValueChange={(value) =>
                    setDialogFormData((prev) => ({ ...prev, icon: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent side="bottom" sideOffset={4}>
                    <SelectItem value="Star">⭐ Star</SelectItem>
                    <SelectItem value="Shield">🛡️ Shield</SelectItem>
                    <SelectItem value="Heart">❤️ Heart</SelectItem>
                    <SelectItem value="Target">🎯 Target</SelectItem>
                    <SelectItem value="CheckCircle">✅ Check Circle</SelectItem>
                    <SelectItem value="Crown">👑 Crown</SelectItem>
                    <SelectItem value="Zap">⚡ Zap</SelectItem>
                    <SelectItem value="Globe">🌐 Globe</SelectItem>
                    <SelectItem value="Clock">⏰ Clock</SelectItem>
                    <SelectItem value="Wrench">🔧 Wrench</SelectItem>
                    <SelectItem value="Headphones">🎧 Headphones</SelectItem>
                    <SelectItem value="MessageCircle">
                      💬 Message Circle
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="value-color">Color</Label>
                <Select
                  value={dialogFormData.color}
                  onValueChange={(value) =>
                    setDialogFormData((prev) => ({ ...prev, color: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent side="bottom" sideOffset={4}>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="yellow">Yellow</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                    <SelectItem value="indigo">Indigo</SelectItem>
                    <SelectItem value="pink">Pink</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="value-sort">Sort Order</Label>
                <Input
                  id="value-sort"
                  type="number"
                  value={dialogFormData.sortOrder}
                  onChange={(e) =>
                    setDialogFormData((prev) => ({
                      ...prev,
                      sortOrder: parseInt(e.target.value) || 0,
                    }))
                  }
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="value-description">Description</Label>
              <Textarea
                id="value-description"
                value={dialogFormData.description}
                onChange={(e) =>
                  setDialogFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe this core value and its importance to your business"
                rows={4}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="value-active"
                checked={dialogFormData.isActive}
                onCheckedChange={(checked) =>
                  setDialogFormData((prev) => ({ ...prev, isActive: checked }))
                }
              />
              <Label htmlFor="value-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowValueDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveValue}>Save Value</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
