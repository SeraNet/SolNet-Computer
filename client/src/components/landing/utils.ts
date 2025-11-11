import { 
  User, Zap, Shield, Target, Globe, Clock, Award, Star, Crown, 
  Wrench, Headphones, MessageCircle, Heart 
} from "lucide-react";

// Helper function to get icon component
export const getIconComponent = (iconName: string) => {
  const iconMap: { [key: string]: any } = {
    Zap,
    Shield,
    Target,
    Globe,
    Clock,
    Award,
    Star,
    User,
    Crown,
    Wrench,
    Headphones,
    MessageCircle,
    Heart,
  };
  return iconMap[iconName] || User;
};

// Helper function to get color classes
export const getColorClasses = (color: string) => {
  const colorMap: { [key: string]: { bg: string; icon: string } } = {
    blue: {
      bg: "bg-gradient-to-br from-blue-50 to-indigo-50",
      icon: "bg-gradient-to-br from-blue-500 to-indigo-600",
    },
    green: {
      bg: "bg-gradient-to-br from-green-50 to-emerald-50",
      icon: "bg-gradient-to-br from-green-500 to-emerald-600",
    },
    purple: {
      bg: "bg-gradient-to-br from-purple-50 to-pink-50",
      icon: "bg-gradient-to-br from-purple-500 to-pink-600",
    },
    yellow: {
      bg: "bg-gradient-to-br from-yellow-50 to-orange-50",
      icon: "bg-gradient-to-br from-yellow-500 to-orange-600",
    },
    red: {
      bg: "bg-gradient-to-br from-red-50 to-pink-50",
      icon: "bg-gradient-to-br from-red-500 to-pink-600",
    },
    indigo: {
      bg: "bg-gradient-to-br from-indigo-50 to-purple-50",
      icon: "bg-gradient-to-br from-indigo-500 to-purple-600",
    },
    pink: {
      bg: "bg-gradient-to-br from-pink-50 to-rose-50",
      icon: "bg-gradient-to-br from-pink-500 to-rose-600",
    },
    orange: {
      bg: "bg-gradient-to-br from-orange-50 to-red-50",
      icon: "bg-gradient-to-br from-orange-500 to-red-600",
    },
  };
  return colorMap[color] || colorMap.blue;
};






