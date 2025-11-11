import React from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Linkedin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  MessageSquare,
  Shield,
  Award,
  Users,
  Zap,
  Star,
  ArrowRight,
  ExternalLink,
  Wrench,
  Monitor,
  HardDrive,
  Shield as ShieldIcon,
  Wifi,
  Smartphone,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PrimaryLogoDisplay from "@/components/primary-logo-display";

interface BusinessProfile {
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
  socialLinks?: {
    linkedin?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  happyCustomers?: number;
  totalDevicesRepaired?: string;
}

interface EnhancedFooterProps {
  businessProfile?: BusinessProfile | null;
  onContactUs: () => void;
  onBookAppointment: () => void;
  onDeviceTracking: () => void;
  onFeedback: () => void;
  scrollToContact: () => void;
}

const EnhancedFooter: React.FC<EnhancedFooterProps> = ({
  businessProfile,
  onContactUs,
  onBookAppointment,
  onDeviceTracking,
  onFeedback,
  scrollToContact,
}) => {
  const currentYear = new Date().getFullYear();

  const services = [
    {
      name: "Hardware Repair",
      icon: Wrench,
      description: "Laptop & Desktop Repair",
    },
    {
      name: "Software Issues",
      icon: Monitor,
      description: "OS & Application Fixes",
    },
    {
      name: "Data Recovery",
      icon: HardDrive,
      description: "Lost Data Retrieval",
    },
    // {
    //   name: "Virus Removal",
    //   icon: ShieldIcon,
    //   description: "Malware & Security",
    // },
    {
      name: "Network Setup",
      icon: Wifi,
      description: "WiFi & Network Solutions",
    },
    // {
    //   name: "Phone Repair",
    //   icon: Smartphone,
    //   description: "Mobile Device Services",
    // },
  ];

  const quickLinks = [
    { name: "Contact Us", action: onContactUs, icon: MessageSquare },
    { name: "Book Appointment", action: onBookAppointment, icon: Clock },
    { name: "Leave Feedback", action: onFeedback, icon: Star },
    { name: "Track Device", action: onDeviceTracking, icon: Search },
    { name: "Contact Info", action: scrollToContact, icon: MapPin },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 to-slate-900/20 opacity-50"></div>

      {/* Subtle Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Company Info Section */}
            <div className="lg:col-span-4">
              <div className="flex items-center space-x-6 mb-8">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-emerald-500 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-all duration-300"></div>
                  <PrimaryLogoDisplay
                    width={48}
                    height={48}
                    className="relative rounded-xl shadow-lg ring-2 ring-white/10 bg-white p-1 group-hover:scale-105 transition-all duration-300"
                    showFallback={true}
                    fallbackText="SN"
                  />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full shadow-lg ring-1 ring-white"></div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {businessProfile?.businessName ||
                      "SolNet Computer Services ሶልኔት ኮምፒዩተር"}
                  </h3>
                  <div className="flex items-center space-x-3 mt-2">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-3 w-3 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-emerald-500/20 text-emerald-200 border-emerald-400/50 px-2 py-1 text-xs font-medium"
                    >
                      Professional
                    </Badge>
                  </div>
                </div>
              </div>

              <p className="text-gray-300 mb-8 leading-relaxed text-base">
                Professional computer repair services for laptops, desktops,
                and more. Fast, reliable, and affordable solutions for
                all your technology needs.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                {businessProfile?.phone && (
                  <div className="flex items-start space-x-3 text-gray-300 hover:text-white transition-all duration-300 group cursor-pointer p-3 rounded-xl bg-slate-800/30 hover:bg-slate-700/50 border border-slate-700/30 hover:border-slate-600/50">
                    <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-300 flex-shrink-0 mt-0.5">
                      <Phone className="h-4 w-4 text-blue-400 group-hover:text-blue-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-400 group-hover:text-gray-300">
                        Phone
                      </div>
                      <div className="text-sm font-semibold">
                        {businessProfile.phone
                          ?.split("||")
                          .filter((phone) => phone.trim() !== "")
                          .map((phone, index, array) => (
                            <div
                              key={index}
                              className="text-gray-300 group-hover:text-white"
                            >
                              {phone.trim()}
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}

                {businessProfile?.email && (
                  <div className="flex items-start space-x-3 text-gray-300 hover:text-white transition-all duration-300 group cursor-pointer p-3 rounded-xl bg-slate-800/30 hover:bg-slate-700/50 border border-slate-700/30 hover:border-slate-600/50">
                    <div className="p-2 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-lg group-hover:from-emerald-500/30 group-hover:to-blue-500/30 transition-all duration-300 flex-shrink-0 mt-0.5">
                      <Mail className="h-4 w-4 text-emerald-400 group-hover:text-emerald-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-400 group-hover:text-gray-300">
                        Email
                      </div>
                      <div className="text-sm font-semibold text-gray-300 group-hover:text-white truncate">
                        {businessProfile.email}
                      </div>
                    </div>
                  </div>
                )}

                {businessProfile?.address && (
                  <div className="flex items-start space-x-3 text-gray-300 hover:text-white transition-all duration-300 group cursor-pointer p-3 rounded-xl bg-slate-800/30 hover:bg-slate-700/50 border border-slate-700/30 hover:border-slate-600/50">
                    <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all duration-300 flex-shrink-0 mt-0.5">
                      <MapPin className="h-4 w-4 text-purple-400 group-hover:text-purple-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-400 group-hover:text-gray-300">
                        Address
                      </div>
                      <div className="text-sm font-semibold text-gray-300 group-hover:text-white">
                        {businessProfile.address}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Links Section */}
            <div className="lg:col-span-2">
              <h4 className="text-xl font-bold mb-6 text-white">Quick Links</h4>
              <ul className="space-y-4">
                {quickLinks.map((link, index) => {
                  const IconComponent = link.icon;
                  return (
                    <li key={index}>
                      <button
                        onClick={link.action}
                        className="flex items-center space-x-3 text-gray-300 hover:text-white transition-all duration-300 group w-full text-left p-3 rounded-lg bg-slate-800/30 hover:bg-slate-700/50 border border-slate-700/30 hover:border-slate-600/50"
                      >
                        <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-md group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-300 flex-shrink-0">
                          <IconComponent className="h-4 w-4 text-blue-400 group-hover:text-blue-300" />
                        </div>
                        <span className="font-medium text-sm group-hover:translate-x-1 transition-transform duration-300">
                          {link.name}
                        </span>
                        <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1 flex-shrink-0 ml-auto" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Services Section */}
            <div className="lg:col-span-3">
              <h4 className="text-xl font-bold mb-6 text-white">
                Our Services
              </h4>
              <div className="grid grid-cols-1 gap-4">
                {services.map((service, index) => {
                  const IconComponent = service.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-gradient-to-r from-slate-800/30 to-slate-700/30 rounded-lg border border-slate-700/30 hover:border-emerald-500/30 hover:bg-gradient-to-r hover:from-emerald-500/10 hover:to-blue-500/10 transition-all duration-300 group cursor-pointer"
                    >
                      <div className="p-2 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-md group-hover:from-emerald-500/30 group-hover:to-blue-500/30 transition-all duration-300 flex-shrink-0">
                        <IconComponent className="h-4 w-4 text-emerald-400 group-hover:text-emerald-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-white group-hover:text-emerald-300 transition-colors">
                          {service.name}
                        </p>
                        <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                          {service.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Business Hours & Awards */}
            <div className="lg:col-span-3">
              <h4 className="text-xl font-bold mb-6 text-white">
                Business Info
              </h4>

              {/* Business Hours */}
              <div className="mb-8 p-6 bg-gradient-to-br from-slate-800/30 to-slate-700/30 rounded-2xl border border-slate-700/30">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg">
                    <Clock className="h-4 w-4 text-purple-400" />
                  </div>
                  <h5 className="font-bold text-xl text-white">
                    Business Hours
                  </h5>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-slate-700/20 rounded-lg hover:bg-slate-600/30 hover:border-slate-500/30 border border-transparent transition-all duration-300 group cursor-pointer">
                    <span className="font-medium text-gray-300 group-hover:text-gray-200 transition-colors">
                      Monday - Friday
                    </span>
                    <span className="text-emerald-300 font-semibold group-hover:text-emerald-200 transition-colors">
                      8:00 - 21:00
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-700/20 rounded-lg hover:bg-slate-600/30 hover:border-slate-500/30 border border-transparent transition-all duration-300 group cursor-pointer">
                    <span className="font-medium text-gray-300 group-hover:text-gray-200 transition-colors">
                      Saturday
                    </span>
                    <span className="text-emerald-300 font-semibold group-hover:text-emerald-200 transition-colors">
                      9:00 - 20:00
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-700/20 rounded-lg hover:bg-slate-600/30 hover:border-slate-500/30 border border-transparent transition-all duration-300 group cursor-pointer">
                    <span className="font-medium text-gray-300 group-hover:text-gray-200 transition-colors">
                      Sunday
                    </span>
                    <span className="text-red-400 font-semibold group-hover:text-red-300 transition-colors">
                      Closed
                    </span>
                  </div>
                </div>
              </div>

              {/* Certifications & Awards */}
              {((businessProfile?.certifications?.length ?? 0) > 0 ||
                (businessProfile?.awards?.length ?? 0) > 0) && (
                <div className="p-6 bg-gradient-to-br from-slate-800/30 to-slate-700/30 rounded-2xl border border-slate-700/30">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="p-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg">
                      <Award className="h-4 w-4 text-yellow-400" />
                    </div>
                    <h5 className="font-bold text-xl text-white">
                      Certifications & Awards
                    </h5>
                  </div>
                  <div className="space-y-3">
                    {businessProfile?.certifications?.map((cert, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-emerald-500/20 text-emerald-200 border-emerald-400/50 px-3 py-1 text-xs font-medium mr-2 mb-2"
                      >
                        {cert}
                      </Badge>
                    ))}
                    {businessProfile?.awards?.map((award, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-yellow-500/20 text-yellow-200 border-yellow-400/50 px-3 py-1 text-xs font-medium mr-2 mb-2"
                      >
                        {award}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Social Links & Copyright */}
        <div className="border-t border-slate-700/50">
          {/* Social Links */}
          {businessProfile?.socialLinks &&
            Object.values(businessProfile.socialLinks).some((link) => link) && (
              <div className="py-12">
                <div className="flex flex-col items-center space-y-6">
                  <h5 className="text-lg font-semibold text-white">
                    Follow Us
                  </h5>
                  <div className="flex space-x-6">
                    {businessProfile.socialLinks.linkedin && (
                      <a
                        href={businessProfile.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-2xl hover:from-blue-500/40 hover:to-blue-600/40 transition-all duration-500 group hover:scale-110 border border-blue-500/30 hover:border-blue-400/50"
                      >
                        <Linkedin className="h-5 w-5 text-blue-400 group-hover:text-blue-300" />
                      </a>
                    )}
                    {businessProfile.socialLinks.facebook && (
                      <a
                        href={businessProfile.socialLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-2xl hover:from-blue-500/40 hover:to-blue-600/40 transition-all duration-500 group hover:scale-110 border border-blue-500/30 hover:border-blue-400/50"
                      >
                        <Facebook className="h-5 w-5 text-blue-400 group-hover:text-blue-300" />
                      </a>
                    )}
                    {businessProfile.socialLinks.twitter && (
                      <a
                        href={businessProfile.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 bg-gradient-to-r from-blue-400/20 to-cyan-500/20 rounded-2xl hover:from-blue-400/40 hover:to-cyan-500/40 transition-all duration-500 group hover:scale-110 border border-blue-400/30 hover:border-blue-300/50"
                      >
                        <Twitter className="h-5 w-5 text-blue-400 group-hover:text-blue-300" />
                      </a>
                    )}
                    {businessProfile.socialLinks.instagram && (
                      <a
                        href={businessProfile.socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-2xl hover:from-pink-500/40 hover:to-purple-500/40 transition-all duration-500 group hover:scale-110 border border-pink-500/30 hover:border-pink-400/50"
                      >
                        <Instagram className="h-5 w-5 text-pink-400 group-hover:text-pink-300" />
                      </a>
                    )}
                    {businessProfile.socialLinks.youtube && (
                      <a
                        href={businessProfile.socialLinks.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-2xl hover:from-red-500/40 hover:to-red-600/40 transition-all duration-500 group hover:scale-110 border border-red-500/30 hover:border-red-400/50"
                      >
                        <Youtube className="h-5 w-5 text-red-400 group-hover:text-red-300" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

          {/* Copyright */}
          <div className="py-8 text-center border-t border-slate-700/50">
            <p className="text-gray-400 text-sm">
              © {currentYear}{" "}
              <span className="font-semibold text-white">
                {businessProfile?.businessName || "SolNet Computer Services"}
              </span>
              . All rights reserved. | Professional Computer Services
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default EnhancedFooter;
