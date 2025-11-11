import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Clock, Users, Wrench, Star, Zap, Loader2 } from "lucide-react";
import { BusinessProfile, TrackingResult } from "@/pages/landing/types";

interface LandingHeroProps {
  businessProfile: BusinessProfile | null;
  trackingCode: string;
  setTrackingCode: (code: string) => void;
  trackingResult: TrackingResult | null;
  isTracking: boolean;
  onTrack: () => void;
  showTrackingModal: boolean;
}

export default function LandingHero({
  businessProfile,
  trackingCode,
  setTrackingCode,
  trackingResult,
  isTracking,
  onTrack,
  showTrackingModal,
}: LandingHeroProps) {
  return (
    <section className="relative pt-20 pb-16 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-black opacity-10"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full animate-pulse-slow delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-8 sm:py-12">
        <div className="mb-8 animate-fade-in">
          <Badge
            variant="secondary"
            className="mb-4 bg-white/20 text-white border-white/30 backdrop-blur-sm animate-bounce"
          >
            <Zap className="h-3 w-3 mr-1 animate-pulse" />
            Professional Computer Services
          </Badge>
        </div>

        <h1 className="text-fluid-4xl font-bold mb-6 animate-slide-up">
          <span className="bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent">
            Expert Computer Service
          </span>
        </h1>

        <p className="text-fluid-lg mb-8 max-w-3xl mx-auto text-blue-100 animate-fade-in-delay">
          Professional repair services for laptops, desktops, printers, and
          more. Fast, reliable, and affordable solutions for all your
          technology needs.
        </p>

        {/* Device Tracking Card */}
        {!showTrackingModal && (
          <Card
            className="max-w-lg mx-auto bg-white/15 backdrop-blur-md border-white/30 shadow-2xl hover:shadow-white/10 transition-all duration-500 animate-fade-in-delay-4 mb-8"
            data-tracking-section
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full w-16 h-16 flex items-center justify-center">
                <Search className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="flex items-center justify-center gap-2 text-white text-xl">
                Track Your Device
              </CardTitle>
              <p className="text-blue-100 text-sm mt-2">
                Enter your receipt or tracking code to check repair status
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="tracking-code"
                    name="trackingCode"
                    placeholder="Enter tracking code..."
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && onTrack()}
                    className="pl-10 bg-white/95 border-white/40 focus:border-blue-400 focus:ring-blue-400/50 transition-all duration-300"
                  />
                </div>
                <Button
                  onClick={onTrack}
                  disabled={isTracking}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 px-6"
                >
                  {isTracking ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Tracking...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Track
                    </>
                  )}
                </Button>
              </div>

              {trackingResult && (
                <div className="mt-4 p-3 rounded-lg bg-white/20 backdrop-blur-sm">
                  {trackingResult?.error ? (
                    <p className="text-red-200 text-sm">
                      {trackingResult?.error}
                    </p>
                  ) : (
                    <div className="text-left text-white">
                      <p className="font-medium">
                        {trackingResult?.customerName}
                      </p>
                      <div className="text-sm text-blue-100 space-y-1">
                        <p>
                          <span className="font-medium">Device:</span>{" "}
                          {trackingResult?.deviceType} -{" "}
                          {trackingResult?.brand} {trackingResult?.model}
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
                      <Badge
                        variant={
                          trackingResult?.status === "completed"
                            ? "default"
                            : trackingResult?.status === "in_progress"
                            ? "secondary"
                            : "outline"
                        }
                        className="mt-2"
                      >
                        {trackingResult?.status
                          ?.replace("_", " ")
                          .toUpperCase()}
                      </Badge>
                      <p className="text-xs text-blue-200 mt-1">
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
            </CardContent>
          </Card>
        )}

        {/* Statistics Grid */}
        {businessProfile?.publicInfo?.showStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 animate-fade-in-delay-3">
            <div className="text-center group">
              <div className="relative p-6 bg-white/10 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="text-4xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                    {businessProfile?.happyCustomers || "N/A"}
                  </div>
                  <div className="text-blue-100 text-sm font-medium">
                    Happy Customers
                  </div>
                  <div className="flex justify-center mt-2">
                    <Users className="h-4 w-4 text-emerald-300" />
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center group">
              <div className="relative p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-500 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="text-4xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                    {businessProfile?.totalDevicesRepaired || "N/A"}
                  </div>
                  <div className="text-blue-100 text-sm font-medium">
                    Devices Repaired
                  </div>
                  <div className="flex justify-center mt-2">
                    <Wrench className="h-4 w-4 text-blue-300" />
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center group">
              <div className="relative p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-500 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="text-4xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                    {businessProfile?.averageRepairTime || "N/A"}
                  </div>
                  <div className="text-blue-100 text-sm font-medium">
                    Average Turnaround
                  </div>
                  <div className="flex justify-center mt-2">
                    <Clock className="h-4 w-4 text-purple-300" />
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center group">
              <div className="relative p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-500 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="text-4xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                    {businessProfile?.averageRating || "N/A"}★
                  </div>
                  <div className="text-blue-100 text-sm font-medium">
                    Customer Rating
                  </div>
                  <div className="flex justify-center mt-2">
                    <Star className="h-4 w-4 text-yellow-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

