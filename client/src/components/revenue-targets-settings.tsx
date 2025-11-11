import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/currency";
import { Target, TrendingUp } from "lucide-react";
import React from "react";

const revenueTargetsSchema = z.object({
  monthlyRevenueTarget: z.string().optional(),
  annualRevenueTarget: z.string().optional(),
  growthTargetPercentage: z
    .string()
    .min(1, "Growth target is required")
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 100;
    }, "Growth target must be between 0 and 100"),
});

type RevenueTargetsForm = z.infer<typeof revenueTargetsSchema>;

export function RevenueTargetsSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  // Fetch current business profile
  const { data: businessProfile, isLoading } = useQuery({
    queryKey: ["business-profile"],
    queryFn: () => apiRequest("/api/business-profile", "GET"),
  });

  const form = useForm<RevenueTargetsForm>({
    resolver: zodResolver(revenueTargetsSchema),
    defaultValues: {
      monthlyRevenueTarget:
        businessProfile?.monthlyRevenueTarget?.toString() || "",
      annualRevenueTarget:
        businessProfile?.annualRevenueTarget?.toString() || "",
      growthTargetPercentage:
        businessProfile?.growthTargetPercentage?.toString() || "15.00",
    },
  });

  // Update form values when business profile loads
  React.useEffect(() => {
    if (businessProfile) {
      form.reset({
        monthlyRevenueTarget:
          businessProfile.monthlyRevenueTarget?.toString() || "",
        annualRevenueTarget:
          businessProfile.annualRevenueTarget?.toString() || "",
        growthTargetPercentage:
          businessProfile.growthTargetPercentage?.toString() || "15.00",
      });
    }
  }, [businessProfile, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: RevenueTargetsForm) => {
      // Only send the revenue target fields that are being updated
      const updateData = {
        monthlyRevenueTarget: data.monthlyRevenueTarget
          ? parseFloat(data.monthlyRevenueTarget)
          : null,
        annualRevenueTarget: data.annualRevenueTarget
          ? parseFloat(data.annualRevenueTarget)
          : null,
        growthTargetPercentage: data.growthTargetPercentage
          ? parseFloat(data.growthTargetPercentage)
          : null,
      };

      return apiRequest("/api/business-profile", "PUT", updateData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Revenue targets updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["business-profile"] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update revenue targets",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RevenueTargetsForm) => {
    updateProfileMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-slate-100">Revenue Targets</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="card-elevated">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Revenue Targets
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Set your business revenue goals and growth targets for analytics
            </CardDescription>
          </div>
          <Button
            variant={isEditing ? "outline" : "default"}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="monthlyRevenueTarget">
                  Monthly Revenue Target
                </Label>
                <Input
                  id="monthlyRevenueTarget"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...form.register("monthlyRevenueTarget")}
                />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Set your monthly revenue goal (optional)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="annualRevenueTarget">
                  Annual Revenue Target
                </Label>
                <Input
                  id="annualRevenueTarget"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...form.register("annualRevenueTarget")}
                />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Set your annual revenue goal (optional)
                </p>
              </div>
            </div>

            <Separator className="dark:bg-slate-700" />

            <div className="space-y-2">
              <Label htmlFor="growthTargetPercentage">
                <TrendingUp className="h-4 w-4 inline mr-2 text-purple-600 dark:text-purple-400" />
                Growth Target Percentage
              </Label>
              <Input
                id="growthTargetPercentage"
                type="number"
                step="0.01"
                placeholder="15.00"
                {...form.register("growthTargetPercentage")}
              />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Target growth percentage for revenue projections (0-100%)
              </p>
              {form.formState.errors.growthTargetPercentage && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.growthTargetPercentage.message}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                onClick={form.handleSubmit(onSubmit)}
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Monthly Revenue Target
                </Label>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
                  {businessProfile?.monthlyRevenueTarget
                    ? formatCurrency(businessProfile.monthlyRevenueTarget)
                    : "Not set"}
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Annual Revenue Target
                </Label>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
                  {businessProfile?.annualRevenueTarget
                    ? formatCurrency(businessProfile.annualRevenueTarget)
                    : "Not set"}
                </p>
              </div>
            </div>

            <Separator className="dark:bg-slate-700" />

            <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border border-purple-200 dark:border-purple-800 rounded-lg">
              <Label className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                Growth Target Percentage
              </Label>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
                {businessProfile?.growthTargetPercentage || "15.00"}%
              </p>
            </div>

            <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Note:</strong> These targets are used in the Advanced
                Analytics dashboard to calculate revenue projections and goals.
                The growth target percentage determines the green "Target" bars
                in revenue charts.
              </p>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
