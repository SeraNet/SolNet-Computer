import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageLayout } from "@/components/layout/page-layout";
import {
  Settings as SettingsIcon,
  Building2,
  Bell,
  Shield,
  Palette,
  Database,
  FileText,
  MessageSquare,
  Users,
  Target,
  SlidersHorizontal,
  Mail,
} from "lucide-react";
import { BusinessSettings } from "@/components/settings/business-settings";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { SecuritySettings } from "@/components/settings/security-settings";
import { AppearanceSettings } from "@/components/settings/appearance-settings";
import { DataSettings } from "@/components/settings/data-settings";
import ReportGenerator from "@/components/report-generator";
import { SMSTemplateEditor } from "@/components/sms-template-editor";
import { RecipientGroupsManager } from "@/components/recipient-groups-manager";
import { BulkSMSCampaign } from "@/components/bulk-sms-campaign";
import { RevenueTargetsSettings } from "@/components/revenue-targets-settings";
import { AdvancedSettingsModal } from "@/components/advanced-settings-modal";
import { EmailSettings } from "@/components/settings/email-settings";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("business");
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <PageLayout
      title="System Settings"
      subtitle="Manage your business configuration and system preferences"
      icon={SettingsIcon}
    >
      {/* Main Content */}
      <Card className="card-elevated">
        <CardContent className="p-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-10 h-auto p-1 bg-slate-100 dark:bg-slate-800 rounded-lg mb-6">
              <TabsTrigger
                value="business"
                className="flex items-center gap-2 px-3 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm"
              >
                <Building2 className="h-4 w-4" />
                <span className="font-medium hidden lg:inline">Business</span>
              </TabsTrigger>
              <TabsTrigger
                value="email"
                className="flex items-center gap-2 px-3 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm"
              >
                <Mail className="h-4 w-4" />
                <span className="font-medium hidden lg:inline">Email</span>
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="flex items-center gap-2 px-3 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm"
              >
                <Bell className="h-4 w-4" />
                <span className="font-medium hidden lg:inline">Notify</span>
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="flex items-center gap-2 px-3 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm"
              >
                <Shield className="h-4 w-4" />
                <span className="font-medium hidden lg:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger
                value="appearance"
                className="flex items-center gap-2 px-3 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm"
              >
                <Palette className="h-4 w-4" />
                <span className="font-medium hidden lg:inline">Theme</span>
              </TabsTrigger>
              <TabsTrigger
                value="data"
                className="flex items-center gap-2 px-3 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm"
              >
                <Database className="h-4 w-4" />
                <span className="font-medium hidden lg:inline">Data</span>
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="flex items-center gap-2 px-3 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm"
              >
                <FileText className="h-4 w-4" />
                <span className="font-medium hidden lg:inline">Reports</span>
              </TabsTrigger>
              <TabsTrigger
                value="messaging"
                className="flex items-center gap-2 px-3 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="font-medium hidden lg:inline">SMS</span>
              </TabsTrigger>
              <TabsTrigger
                value="revenue"
                className="flex items-center gap-2 px-3 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm"
              >
                <Target className="h-4 w-4" />
                <span className="font-medium hidden lg:inline">Revenue</span>
              </TabsTrigger>
              <TabsTrigger
                value="advanced"
                className="flex items-center gap-2 px-3 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="font-medium hidden lg:inline">Advanced</span>
              </TabsTrigger>
            </TabsList>

            <div>
            <TabsContent value="business" className="space-y-6">
              <BusinessSettings />
            </TabsContent>
            <TabsContent value="email" className="space-y-6">
              <EmailSettings />
            </TabsContent>
            <TabsContent value="notifications" className="space-y-6">
              <NotificationSettings />
            </TabsContent>
            <TabsContent value="security" className="space-y-6">
              <SecuritySettings />
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6">
              <AppearanceSettings />
            </TabsContent>

            <TabsContent value="data" className="space-y-6">
              <DataSettings />
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-slate-100">Generate Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReportGenerator />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="messaging" className="space-y-6">
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                    <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Messaging
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="templates" className="space-y-4">
                    <TabsList className="h-auto p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <TabsTrigger
                        value="templates"
                        className="flex items-center gap-2 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm"
                      >
                        <MessageSquare className="h-4 w-4" />
                        SMS Templates
                      </TabsTrigger>
                      <TabsTrigger
                        value="groups"
                        className="flex items-center gap-2 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm"
                      >
                        <Users className="h-4 w-4" />
                        Recipient Groups
                      </TabsTrigger>
                      <TabsTrigger
                        value="campaigns"
                        className="flex items-center gap-2 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Bulk Campaigns
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="templates" className="space-y-4">
                      <SMSTemplateEditor />
                    </TabsContent>
                    <TabsContent value="groups" className="space-y-4">
                      <RecipientGroupsManager />
                    </TabsContent>
                    <TabsContent value="campaigns" className="space-y-4">
                      <BulkSMSCampaign />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="revenue" className="space-y-6">
              <RevenueTargetsSettings />
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="card-elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                      <SlidersHorizontal className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      Advanced Settings
                    </CardTitle>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Configure system-wide advanced settings and preferences
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Access comprehensive system configuration including:
                      </p>
                      <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 ml-4">
                        <li>• System monitoring and health</li>
                        <li>• Performance optimization</li>
                        <li>• Security settings</li>
                        <li>• Integration management</li>
                        <li>• Business automation rules</li>
                        <li>• Database maintenance</li>
                      </ul>
                    </div>
                    <Button
                      onClick={() => setShowAdvanced(true)}
                      className="w-full"
                      size="lg"
                    >
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Open Advanced Settings
                    </Button>
                  </CardContent>
                </Card>

                <Card className="card-elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                      <Database className="h-5 w-5 text-green-600 dark:text-green-400" />
                      System Status
                    </CardTitle>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Quick overview of system health and performance
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          ✓
                        </div>
                        <div className="text-sm text-green-700 dark:text-green-300">
                          System Online
                        </div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          8
                        </div>
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                          Active Services
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-slate-700 dark:text-slate-300">
                        <span>Database Status</span>
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          Healthy
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-slate-700 dark:text-slate-300">
                        <span>Last Backup</span>
                        <span>2 hours ago</span>
                      </div>
                      <div className="flex justify-between text-sm text-slate-700 dark:text-slate-300">
                        <span>System Uptime</span>
                        <span>15 days</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => (window.location.href = "/system-health")}
                    >
                      <Database className="h-4 w-4 mr-2" />
                      View Detailed Status
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Render modal outside of tabs to avoid z-index issues */}
      {showAdvanced && (
        <AdvancedSettingsModal
          isOpen={showAdvanced}
          onClose={() => setShowAdvanced(false)}
        />
      )}
    </PageLayout>
  );
}
