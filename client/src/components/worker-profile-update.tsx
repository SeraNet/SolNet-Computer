import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth, User as UserType } from "@/hooks/useAuth";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PageLayout } from "@/components/layout/page-layout";
import {
  User,
  Camera,
  Eye,
  EyeOff,
  Save,
  Upload,
  Shield,
  Wrench,
  ShoppingCart,
} from "lucide-react";

const profileUpdateSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Valid email is required"),
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters")
      .optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.newPassword && data.newPassword !== data.confirmPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    }
  )
  .refine(
    (data) => {
      // If new password is provided, current password is required
      if (data.newPassword && !data.currentPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Current password is required when changing password",
      path: ["currentPassword"],
    }
  );

type ProfileUpdateForm = z.infer<typeof profileUpdateSchema>;

const roleConfig = {
  admin: {
    icon: Shield,
    label: "Administrator",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  },
  technician: {
    icon: Wrench,
    label: "Technician",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  },
  sales: {
    icon: ShoppingCart,
    label: "Sales",
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  },
};

export default function WorkerProfileUpdate() {
  const { user, login } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user details to get current information
  const { data: userDetails } = useQuery({
    queryKey: ["user", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await apiRequest(`/api/users/${user.id}`, "GET");
      return response;
    },
    enabled: !!user?.id,
  });

  const form = useForm<ProfileUpdateForm>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Update form when user details are loaded
  useEffect(() => {
    if (userDetails) {
      form.setValue("firstName", userDetails.firstName || "");
      form.setValue("lastName", userDetails.lastName || "");
      form.setValue("email", userDetails.email || "");
    }
  }, [userDetails, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileUpdateForm) => {
      const updateData: any = {};

      // Only include fields that have changed or are required
      if (data.firstName !== userDetails?.firstName) {
        updateData.firstName = data.firstName;
      }
      if (data.lastName !== userDetails?.lastName) {
        updateData.lastName = data.lastName;
      }
      if (data.email !== userDetails?.email) {
        updateData.email = data.email;
      }

      // Only include password if new password is provided
      if (data.newPassword) {
        updateData.password = data.newPassword;
        updateData.currentPassword = data.currentPassword;
      }

      return await apiRequest(`/api/users/${user?.id}`, "PUT", updateData);
    },
    onSuccess: (updatedUser) => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });

      // Update the user in auth context and localStorage
      const updatedUserData = {
        ...user,
        ...updatedUser,
      };
      login(updatedUserData, localStorage.getItem("token") || "");

      // Reset password fields
      form.setValue("currentPassword", "");
      form.setValue("newPassword", "");
      form.setValue("confirmPassword", "");

      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", user?.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const uploadProfilePictureMutation = useMutation({
    mutationFn: async (file: File) => {
      console.log("File:", file);
      console.log("File size:", file.size);

      const formData = new FormData();
      formData.append("profilePicture", file);

      console.log("FormData entries:");
      // Use Array.from to avoid iteration issues
      const entries = Array.from(formData.entries());
      for (const [key, value] of entries) {
        console.log(`${key}: ${value}`);
      }

      const response = await apiRequest(
        `/api/users/${user?.id}/profile-picture`,
        "POST",
        formData
      );

      return response;
    },
    onSuccess: (response) => {
      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been updated successfully.",
      });

      // Update the user in auth context and localStorage
      if (user) {
        const updatedUserData: UserType = {
          ...user,
          profilePicture: response.profilePicture,
        };
        login(updatedUserData, localStorage.getItem("token") || "");
      }

      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", user?.id] });
    },
    onError: (error: any) => {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        response: error.response,
      });

      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload profile picture",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      await uploadProfilePictureMutation.mutateAsync(file);
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = (data: ProfileUpdateForm) => {
    updateProfileMutation.mutate(data);
  };

  const updatePersonalInfo = (data: ProfileUpdateForm) => {
    const updateData: any = {};

    if (data.firstName !== userDetails?.firstName) {
      updateData.firstName = data.firstName;
    }
    if (data.lastName !== userDetails?.lastName) {
      updateData.lastName = data.lastName;
    }
    if (data.email !== userDetails?.email) {
      updateData.email = data.email;
    }

    if (Object.keys(updateData).length > 0) {
      updateProfileMutation.mutate({
        ...data,
        newPassword: "",
        confirmPassword: "",
        currentPassword: "",
      });
    } else {
      toast({
        title: "No Changes",
        description: "No personal information has been changed.",
      });
    }
  };

  const updatePassword = (data: ProfileUpdateForm) => {
    if (!data.newPassword) {
      toast({
        title: "No New Password",
        description: "Please enter a new password.",
        variant: "destructive",
      });
      return;
    }

    const updateData = {
      firstName: userDetails?.firstName || "",
      lastName: userDetails?.lastName || "",
      email: userDetails?.email || "",
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    };

    updateProfileMutation.mutate(updateData);
  };

  const getUserInitials = () => {
    const firstName = userDetails?.firstName || user?.firstName;
    const lastName = userDetails?.lastName || user?.lastName;

    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return user?.username?.slice(0, 2).toUpperCase() || "U";
  };

  const userRole = roleConfig[user?.role as keyof typeof roleConfig];

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="p-4 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl mx-auto w-fit mb-4">
            <User className="h-12 w-12 text-white" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">
            No user found
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Please log in to update your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PageLayout
      title="My Profile"
      subtitle="Manage your personal information and account settings"
      icon={User}
    >
      <div className="max-w-3xl mx-auto">
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <User className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              Profile Settings
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Update your personal information and profile picture
            </CardDescription>
          </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture Section */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={
                    userDetails?.profilePicture || user.profilePicture
                      ? `${
                          userDetails?.profilePicture || user.profilePicture
                        }?t=${Date.now()}`
                      : undefined
                  }
                  alt={
                    userDetails?.firstName || user.firstName || user.username
                  }
                  onError={(e) => {
                    console.error("Avatar image error:", e);
                  }}
                />
                <AvatarFallback className="text-lg font-semibold">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="outline"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                {userDetails?.firstName || user.firstName}{" "}
                {userDetails?.lastName || user.lastName}
              </h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">@{user.username}</p>
              <Badge className={`mt-2 ${userRole.color}`}>
                <userRole.icon className="h-3 w-3 mr-1" />
                {userRole.label}
              </Badge>
            </div>
          </div>

          <input
            id="profile-photo-upload"
            name="profilePhoto"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Profile Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Change Section */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                <h4 className="text-lg font-medium mb-4 text-slate-900 dark:text-slate-100">Change Password</h4>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showCurrentPassword ? "text" : "password"}
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() =>
                                setShowCurrentPassword(!showCurrentPassword)
                              }
                            >
                              {showCurrentPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showNewPassword ? "text" : "password"}
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() =>
                                setShowNewPassword(!showNewPassword)
                              }
                            >
                              {showNewPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={updateProfileMutation.isPending}
                  onClick={() => updatePersonalInfo(form.getValues())}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {updateProfileMutation.isPending
                    ? "Updating..."
                    : "Update Personal Info"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  disabled={updateProfileMutation.isPending}
                  onClick={() => updatePassword(form.getValues())}
                  className="flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  {updateProfileMutation.isPending
                    ? "Updating..."
                    : "Update Password"}
                </Button>

                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {updateProfileMutation.isPending
                    ? "Updating..."
                    : "Update All"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      </div>
    </PageLayout>
  );
}
