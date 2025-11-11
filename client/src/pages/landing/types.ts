// Shared types for the public landing page

export interface Testimonial {
  id?: string;
  customerName: string;
  customerPhoto?: string;
  testimonial: string;
  rating: number;
  service?: string;
  date?: Date;
  isVerified?: boolean;
}

export interface Feature {
  title: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  sortOrder: number;
}

export interface TeamMember {
  name: string;
  title: string;
  description: string;
  experience: string;
  specializations: string[];
  icon: string;
  color: string;
  isActive: boolean;
  sortOrder: number;
}

export interface SocialLinks {
  linkedin?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
}

export interface PublicInfo {
  showOwnerName?: boolean;
  showOwnerPhoto?: boolean;
  showExperience?: boolean;
  showCertifications?: boolean;
  showAwards?: boolean;
  showTestimonials?: boolean;
  showFeatures?: boolean;
  showTeam?: boolean;
  showStats?: boolean;
  showWhyChooseUs?: boolean;
  showMissionVision?: boolean;
}

export interface Value {
  title: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  sortOrder: number;
}

export interface BusinessProfile {
  businessName?: string;
  phone?: string;
  email?: string;
  address?: string;
  ownerName?: string;
  ownerBio?: string;
  ownerPhoto?: string;
  yearsOfExperience?: string;
  certifications?: string[];
  awards?: string[];
  testimonials?: (string | Testimonial)[];
  features?: Feature[];
  teamMembers?: TeamMember[];
  socialLinks?: SocialLinks;
  publicInfo?: PublicInfo;
  whyChooseUs?: Feature[];
  mission?: string;
  vision?: string;
  values?: Value[];
  happyCustomers?: number;
  totalDevicesRepaired?: number;
  averageRepairTime?: string;
  averageRating?: number;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  category?: string;
  basePrice?: number;
  estimatedDuration?: number;
  features?: string[];
  requirements?: string[];
  warranty?: string;
  imageUrl?: string;
  isPublic?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  category?: string;
  salePrice?: number;
  quantity?: number;
  minStockLevel?: number;
  brand?: string;
  warranty?: string;
  imageUrl?: string;
  isPublic?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export interface TrackingResult {
  error?: string;
  customerName?: string;
  deviceType?: string;
  brand?: string;
  model?: string;
  serviceType?: string;
  deviceDescription?: string;
  status?: "completed" | "in_progress" | "pending";
  updatedAt?: string;
  trackingCode?: string;
}

export interface CustomerMessage {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  serviceType?: string;
  urgency: "low" | "medium" | "high";
}

export interface CustomerFeedback {
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  overallSatisfaction: number;
  serviceQuality: number;
  communication: number;
  timeliness: number;
  valueForMoney: number;
  comments: string;
  wouldRecommend: boolean;
}






