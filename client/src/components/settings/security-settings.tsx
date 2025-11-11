import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Shield,
  Lock,
  Smartphone,
  Clock,
  LogOut,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

export function SecuritySettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [settings, setSettings] = useState({
    twoFactorAuth: false,
    autoLogout: true,
    sessionTimeout: "30",
    loginNotifications: true,
    deviceManagement: true,
  });
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [twoFASecret, setTwoFASecret] = useState("");
  const [twoFAQRCode, setTwoFAQRCode] = useState("");
  const [twoFABackupCodes, setTwoFABackupCodes] = useState<string[]>([]);
  const [verificationToken, setVerificationToken] = useState("");
  const [twoFATotpUrl, setTwoFATotpUrl] = useState("");
  const [showManualEntry, setShowManualEntry] = useState(false);

  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score += 25;
    if (/[A-Z]/.test(password)) score += 20;
    if (/[a-z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 20;
    if (/[^A-Za-z0-9]/.test(password)) score += 20;
    return Math.min(score, 100);
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSavePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirm password do not match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Not authenticated",
        description: "Please log in again and retry.",
        variant: "destructive",
      });
      return;
    }
    apiRequest(`/api/users/${encodeURIComponent(user.id)}`, "PUT", {
      currentPassword: passwordForm.currentPassword,
      password: passwordForm.newPassword,
    })
      .then(() => {
        toast({
          title: "Password Updated",
          description: "Your password has been changed successfully.",
        });
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      })
      .catch((err) => {
        const message = err?.message || "Failed to update password";
        toast({
          title: "Password Change Failed",
          description: message,
          variant: "destructive",
        });
      });
  };

  const handleToggle2FA = async () => {
    if (!settings.twoFactorAuth) {
      // Enable 2FA - show setup flow
      try {
        const response = await apiRequest("/api/security/2fa/setup", "POST");
        setTwoFASecret(response.secret);
        setTwoFAQRCode(response.qrCode);
        setTwoFATotpUrl(response.totpUrl);
        setTwoFABackupCodes(response.backupCodes);
        setShow2FASetup(true);
      } catch (error) {
        toast({
          title: "2FA Setup Failed",
          description:
            "Failed to setup two-factor authentication. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      // Disable 2FA
      try {
        await apiRequest("/api/security/2fa/disable", "POST");
        setSettings((prev) => ({ ...prev, twoFactorAuth: false }));
        toast({
          title: "2FA Disabled",
          description: "Two-factor authentication has been disabled.",
        });
      } catch (error) {
        toast({
          title: "Failed to Disable 2FA",
          description:
            "Could not disable two-factor authentication. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationToken || !/^\d{6}$/.test(verificationToken)) {
      toast({
        title: "Invalid Token",
        description: "Please enter a valid 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiRequest("/api/security/2fa/verify", "POST", {
        token: verificationToken,
        secret: twoFASecret, // Pass the secret for verification
      });

      if (response.verified) {
        // Enable 2FA after successful verification
        await apiRequest("/api/security/2fa/enable", "POST");

        setSettings((prev) => ({ ...prev, twoFactorAuth: true }));
        setShow2FASetup(false);
        setVerificationToken("");
        toast({
          title: "2FA Enabled",
          description:
            "Two-factor authentication has been successfully enabled.",
        });
      } else {
        toast({
          title: "Verification Failed",
          description: "Invalid verification code. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Invalid verification code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogoutAll = async () => {
    try {
      await apiRequest("/api/security/logout-all-sessions", "POST");
      toast({
        title: "All Sessions Logged Out",
        description: "You have been logged out from all devices.",
      });
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "Failed to logout all sessions. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Load existing security settings from backend
  useEffect(() => {
    let mounted = true;
    setIsLoadingSettings(true);

    // Load both security settings and 2FA status
    Promise.all([
      apiRequest<Record<string, any>>("/api/settings/security", "GET"),
      apiRequest<{
        enabled: boolean;
        hasSecret: boolean;
        hasBackupCodes: boolean;
      }>("/api/security/2fa/status", "GET"),
    ])
      .then(([settingsResult, twoFAStatus]) => {
        if (!mounted) return;

        setSettings((prev) => ({
          twoFactorAuth: Boolean(twoFAStatus?.enabled ?? prev.twoFactorAuth),
          autoLogout: Boolean(settingsResult["autoLogout"] ?? prev.autoLogout),
          sessionTimeout: String(
            settingsResult["sessionTimeout"] ?? prev.sessionTimeout
          ),
          loginNotifications: Boolean(
            settingsResult["loginNotifications"] ?? prev.loginNotifications
          ),
          deviceManagement: Boolean(
            settingsResult["deviceManagement"] ?? prev.deviceManagement
          ),
        }));
      })
      .catch((error) => {
        console.error("Failed to load security settings:", error);
        // Settings will use default values if loading fails
      })
      .finally(() => {
        if (mounted) {
          setIsLoadingSettings(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleSaveSecuritySettings = async () => {
    try {
      setIsSavingSettings(true);
      const payloads = [
        { key: "twoFactorAuth", value: settings.twoFactorAuth },
        { key: "autoLogout", value: settings.autoLogout },
        { key: "sessionTimeout", value: Number(settings.sessionTimeout) || 30 },
        { key: "loginNotifications", value: settings.loginNotifications },
        { key: "deviceManagement", value: settings.deviceManagement },
      ];

      // Save settings with proper error handling
      const results = await Promise.allSettled(
        payloads.map((p) =>
          apiRequest("/api/settings", "POST", {
            category: "security",
            key: p.key,
            value: p.value,
            description: `Security setting: ${p.key}`,
          })
        )
      );

      const failed = results.filter((result) => result.status === "rejected");
      if (failed.length > 0) {
        console.error("Some settings failed to save:", failed);
        toast({
          title: "Partial Save",
          description: `${results.length - failed.length} settings saved, ${
            failed.length
          } failed.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Settings Saved",
          description: "Your security settings have been updated successfully.",
        });
      }
    } catch (err: any) {
      console.error("Error saving security settings:", err);
      toast({
        title: "Failed to Save",
        description: err?.message || "Could not save security settings.",
        variant: "destructive",
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="card-elevated">
        <CardHeader>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl text-slate-900 dark:text-slate-100">Security Center</CardTitle>
            </div>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Strengthen account protection and manage session safety
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Two-Factor Auth</div>
              <div className="font-medium text-slate-900 dark:text-slate-100">
                {settings.twoFactorAuth ? "Enabled" : "Disabled"}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Session Timeout</div>
              <div className="font-medium text-slate-900 dark:text-slate-100">{settings.sessionTimeout} min</div>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Login Alerts</div>
              <div className="font-medium text-slate-900 dark:text-slate-100">
                {settings.loginNotifications ? "On" : "Off"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Password Security */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Lock className="h-5 w-5 text-green-600 dark:text-green-400" />
            Password Security
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Update your account password and security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoadingSettings && (
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Loading security settings…
            </div>
          )}
          {/* Password Requirements */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-blue-50 dark:bg-blue-950/30">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Password Requirements</h4>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                    At least 8 characters long
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                    Include uppercase and lowercase letters
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                    Include at least one number
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                    Include at least one special character
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Lock className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-slate-900 dark:text-slate-100">Change Password</DialogTitle>
                <DialogDescription className="text-slate-600 dark:text-slate-400">
                  Enter your current password and choose a new one
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showPassword ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        handlePasswordChange("currentPassword", e.target.value)
                      }
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        handlePasswordChange("newPassword", e.target.value)
                      }
                      placeholder="Enter new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        handlePasswordChange("confirmPassword", e.target.value)
                      }
                      placeholder="Confirm new password"
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
                </div>
                {/* Live strength in modal */}
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-slate-900 dark:text-slate-100">Password Strength</Label>
                      <span className={`text-xs font-medium ${
                        calculatePasswordStrength(passwordForm.newPassword) < 25
                          ? "text-red-600 dark:text-red-400"
                          : calculatePasswordStrength(passwordForm.newPassword) < 50
                          ? "text-orange-600 dark:text-orange-400"
                          : calculatePasswordStrength(passwordForm.newPassword) < 75
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-green-600 dark:text-green-400"
                      }`}>
                        {calculatePasswordStrength(passwordForm.newPassword) < 25
                          ? "Weak"
                          : calculatePasswordStrength(passwordForm.newPassword) < 50
                          ? "Fair"
                          : calculatePasswordStrength(passwordForm.newPassword) < 75
                          ? "Good"
                          : "Strong"}
                      </span>
                    </div>
                    <Progress
                      value={calculatePasswordStrength(passwordForm.newPassword)}
                      className="h-2"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSavePassword} className="flex-1">
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Update Password
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Enable 2FA</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Require a verification code in addition to your password
              </p>
            </div>
            <Switch
              checked={settings.twoFactorAuth}
              onCheckedChange={handleToggle2FA}
            />
          </div>

          {settings.twoFactorAuth && (
            <div className="rounded-lg p-4 border bg-blue-50">
              <p className="text-sm text-blue-800">
                🔐 Two-factor authentication is enabled. You'll enter a
                verification code when logging in.
              </p>
            </div>
          )}

          {/* 2FA Setup Dialog */}
          <Dialog open={show2FASetup} onOpenChange={setShow2FASetup}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
                <DialogDescription>
                  Scan the QR code with your authenticator app and enter the
                  verification code
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-center">
                  <h4 className="font-medium mb-4">
                    Step 1: Add to Authenticator App
                  </h4>

                  {!showManualEntry ? (
                    <>
                      {twoFAQRCode && (
                        <div className="mb-4">
                          <img
                            src={twoFAQRCode}
                            alt="2FA QR Code"
                            className="mx-auto w-48 h-48 border rounded-lg bg-white p-2"
                          />
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                            Scan this QR code with your authenticator app
                          </p>
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowManualEntry(true)}
                        className="mb-4"
                      >
                        Can't scan? Enter manually
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-3 mb-4">
                      <div className="text-left">
                        <Label className="text-sm font-medium">
                          Secret Key:
                        </Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            value={twoFASecret}
                            readOnly
                            className="font-mono text-xs"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigator.clipboard.writeText(twoFASecret)
                            }
                          >
                            Copy
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 text-left">
                        Enter this secret key manually in your authenticator app
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowManualEntry(false)}
                      >
                        Show QR Code Instead
                      </Button>
                    </div>
                  )}
                </div>

                {twoFABackupCodes.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Step 2: Save Backup Codes
                    </Label>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-gray-50 p-3 rounded border">
                      {twoFABackupCodes.map((code, index) => (
                        <div key={index} className="text-center font-bold">
                          {code}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      ⚠️ Save these backup codes in a safe place. You can use
                      them if you lose your phone or authenticator app.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="verification-token">
                    Step 3: Verify Setup
                  </Label>
                  <Input
                    id="verification-token"
                    type="text"
                    value={verificationToken}
                    onChange={(e) =>
                      setVerificationToken(
                        e.target.value.replace(/\D/g, "").slice(0, 6)
                      )
                    }
                    placeholder="Enter 6-digit code from your authenticator app"
                    maxLength={6}
                    className="text-center text-lg font-mono tracking-widest"
                  />
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Enter the 6-digit code from your authenticator app to verify
                    the setup
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleVerify2FA}
                    className="flex-1"
                    disabled={
                      !verificationToken || verificationToken.length !== 6
                    }
                  >
                    Verify & Enable 2FA
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShow2FASetup(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Session Management
          </CardTitle>
          <CardDescription>
            Manage your active sessions and auto-logout settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Auto Logout</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Automatically log out after period of inactivity
                </p>
              </div>
              <Switch
                checked={settings.autoLogout}
                onCheckedChange={() =>
                  setSettings((prev) => ({
                    ...prev,
                    autoLogout: !prev.autoLogout,
                  }))
                }
              />
            </div>

            {settings.autoLogout && (
              <div className="space-y-2">
                <Label htmlFor="timeout">Session Timeout (minutes)</Label>
                <Input
                  id="timeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      sessionTimeout: e.target.value,
                    }))
                  }
                  min="5"
                  max="480"
                  className="w-32"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">
                  Login Notifications
                </Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Get notified of new login attempts
                </p>
              </div>
              <Switch
                checked={settings.loginNotifications}
                onCheckedChange={() =>
                  setSettings((prev) => ({
                    ...prev,
                    loginNotifications: !prev.loginNotifications,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">
                  Device Management
                </Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Allow managing devices from multiple locations
                </p>
              </div>
              <Switch
                checked={settings.deviceManagement}
                onCheckedChange={() =>
                  setSettings((prev) => ({
                    ...prev,
                    deviceManagement: !prev.deviceManagement,
                  }))
                }
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button
              onClick={handleLogoutAll}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout All Sessions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveSecuritySettings}
          className="px-6"
          disabled={isSavingSettings}
        >
          {isSavingSettings ? "Saving…" : "Save Security Settings"}
        </Button>
      </div>
    </div>
  );
}
