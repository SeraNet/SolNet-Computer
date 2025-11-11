import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Palette,
  Moon,
  Sun,
  Monitor,
  Layout,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { useAppearance } from "@/lib/appearance";

export function AppearanceSettings() {
  const { toast } = useToast();
  const { appearance, updateAppearance } = useAppearance();
  const [settings, setSettings] = useState(appearance);

  // Keep local preview state in sync when context changes from elsewhere
  useEffect(() => {
    setSettings(appearance);
  }, [appearance]);

  const colorOptions = [
    { value: "blue", label: "Blue", color: "#3b82f6" },
    { value: "green", label: "Green", color: "#10b981" },
    { value: "purple", label: "Purple", color: "#8b5cf6" },
    { value: "red", label: "Red", color: "#ef4444" },
    { value: "orange", label: "Orange", color: "#f97316" },
    { value: "teal", label: "Teal", color: "#14b8a6" },
  ];

  const handleThemeChange = (theme: string) => {
    setSettings((prev) => ({ ...prev, theme: theme as any }));
    updateAppearance({ theme: theme as any });
    toast({
      title: "Theme Updated",
      description: `Switched to ${theme} theme.`,
    });
  };

  const handleColorChange = (color: string) => {
    setSettings((prev) => ({ ...prev, primaryColor: color }));
    updateAppearance({ primaryColor: color });
    toast({
      title: "Color Updated",
      description: "Primary color has been changed.",
    });
  };

  const handleSave = () => {
    // Persist any pending local changes
    updateAppearance(settings);
    toast({
      title: "Settings Saved",
      description: "Your appearance settings have been updated successfully.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="card-elevated">
        <CardHeader>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-rose-500 to-fuchsia-600 text-white flex items-center justify-center">
                <Palette className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl text-slate-900 dark:text-slate-100">Appearance & Theme</CardTitle>
            </div>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Tailor the product look-and-feel to match your brand
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Theme</div>
              <div className="font-medium text-slate-900 dark:text-slate-100 capitalize">{settings.theme}</div>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Primary Color</div>
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-3.5 w-3.5 rounded-full border border-slate-300 dark:border-slate-600"
                  style={{
                    backgroundColor: colorOptions.find(
                      (c) => c.value === settings.primaryColor
                    )?.color,
                  }}
                />
                <span className="font-medium text-slate-900 dark:text-slate-100 capitalize">
                  {settings.primaryColor}
                </span>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Density</div>
              <div className="font-medium text-slate-900 dark:text-slate-100 capitalize">{settings.density}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Theme Settings */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            Theme & Colors
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Customize the visual appearance of your application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base font-medium">Color Scheme</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Choose between light and dark themes
              </p>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={settings.theme === "light" ? "default" : "outline"}
                  onClick={() => handleThemeChange("light")}
                  className="flex items-center gap-2"
                >
                  <Sun className="h-4 w-4" />
                  Light
                </Button>
                <Button
                  variant={settings.theme === "dark" ? "default" : "outline"}
                  onClick={() => handleThemeChange("dark")}
                  className="flex items-center gap-2"
                >
                  <Moon className="h-4 w-4" />
                  Dark
                </Button>
                {/* Auto theme option disabled - ThemeMode only supports "light" | "dark" 
                <Button
                  variant={settings.theme === "auto" ? "default" : "outline"}
                  onClick={() => handleThemeChange("auto" as any)}
                  className="flex items-center gap-2"
                >
                  <Monitor className="h-4 w-4" />
                  Auto
                </Button> */}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium">Primary Color</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Choose your main brand color
              </p>
              <div className="grid grid-cols-6 gap-2 mt-2">
                {colorOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleColorChange(option.value)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      settings.primaryColor === option.value
                        ? "border-gray-900 scale-110"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    style={{ backgroundColor: option.color }}
                    title={option.label}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layout Settings */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Layout & Display
          </CardTitle>
          <CardDescription>
            Customize the layout and display preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base font-medium">Sidebar Position</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Choose where the sidebar appears
              </p>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={
                    settings.sidebarPosition === "left" ? "default" : "outline"
                  }
                  onClick={() => {
                    setSettings((prev) => ({
                      ...prev,
                      sidebarPosition: "left",
                    }));
                    updateAppearance({ sidebarPosition: "left" as any });
                  }}
                >
                  Left
                </Button>
                <Button
                  variant={
                    settings.sidebarPosition === "right" ? "default" : "outline"
                  }
                  onClick={() => {
                    setSettings((prev) => ({
                      ...prev,
                      sidebarPosition: "right",
                    }));
                    updateAppearance({ sidebarPosition: "right" as any });
                  }}
                >
                  Right
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium">Font Size</Label>
              <Select
                value={settings.fontSize}
                onValueChange={(value) => {
                  setSettings((prev) => ({ ...prev, fontSize: value as any }));
                  updateAppearance({ fontSize: value as any });
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium">Density</Label>
              <Select
                value={settings.density}
                onValueChange={(value) => {
                  setSettings((prev) => ({ ...prev, density: value as any }));
                  updateAppearance({ density: value as any });
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                  <SelectItem value="spacious">Spacious</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Display Options */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Maximize2 className="h-5 w-5" />
            Display Options
          </CardTitle>
          <CardDescription>
            Configure display and accessibility preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Compact Mode</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Reduce spacing for more content
                </p>
              </div>
              <Switch
                checked={settings.compactMode}
                onCheckedChange={(checked) => {
                  setSettings((prev) => ({ ...prev, compactMode: checked }));
                  updateAppearance({ compactMode: checked });
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Animations</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Enable smooth transitions and animations
                </p>
              </div>
              <Switch
                checked={settings.animations}
                onCheckedChange={(checked) => {
                  setSettings((prev) => ({ ...prev, animations: checked }));
                  updateAppearance({ animations: checked });
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">High Contrast</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Increase contrast for better visibility
                </p>
              </div>
              <Switch
                checked={settings.highContrast}
                onCheckedChange={(checked) => {
                  setSettings((prev) => ({ ...prev, highContrast: checked }));
                  updateAppearance({ highContrast: checked });
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>See how your settings will look</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`p-4 rounded-lg border ${
              settings.theme === "dark"
                ? "bg-gray-900 text-white"
                : "bg-white text-slate-900 dark:text-slate-100"
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-8 h-8 rounded-full"
                style={{
                  backgroundColor: colorOptions.find(
                    (c) => c.value === settings.primaryColor
                  )?.color,
                }}
              />
              <div>
                <h3 className="font-medium">Sample Interface</h3>
                <p className="text-sm opacity-70">
                  This is how your interface will look
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-2 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-2 rounded bg-gray-200 dark:bg-gray-700 w-3/4" />
              <div className="h-2 rounded bg-gray-200 dark:bg-gray-700 w-1/2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="px-6">
          Save Appearance Settings
        </Button>
      </div>
    </div>
  );
}
