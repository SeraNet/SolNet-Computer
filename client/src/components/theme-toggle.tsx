import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppearance } from "@/lib/appearance";

export function ThemeToggle() {
  const { appearance, updateAppearance } = useAppearance();

  const toggleTheme = () => {
    // Toggle between light and dark
    const newTheme = appearance.theme === "dark" ? "light" : "dark";
    updateAppearance({ theme: newTheme });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative w-9 h-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
      title={appearance.theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
