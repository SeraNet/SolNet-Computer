import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ThemeMode = "light" | "dark";
type SidebarPosition = "left" | "right";
type FontSize = "small" | "medium" | "large";
type Density = "compact" | "comfortable" | "spacious";

export type AppearanceState = {
  theme: ThemeMode;
  primaryColor: string; // token name like "blue", "green", etc
  sidebarPosition: SidebarPosition;
  compactMode: boolean;
  animations: boolean;
  highContrast: boolean;
  fontSize: FontSize;
  density: Density;
};

const DEFAULT_APPEARANCE: AppearanceState = {
  theme: "light",
  primaryColor: "blue",
  sidebarPosition: "left",
  compactMode: false,
  animations: true,
  highContrast: false,
  fontSize: "medium",
  density: "comfortable",
};

const STORAGE_KEY = "solnet.appearance";

type AppearanceContextValue = {
  appearance: AppearanceState;
  setAppearance: (updater: (prev: AppearanceState) => AppearanceState) => void;
  updateAppearance: (partial: Partial<AppearanceState>) => void;
};

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

export function AppearanceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [appearance, setAppearanceState] = useState<AppearanceState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppearanceState;
        return { ...DEFAULT_APPEARANCE, ...parsed };
      }
    } catch {}
    return DEFAULT_APPEARANCE;
  });

  const setAppearance = useCallback(
    (updater: (prev: AppearanceState) => AppearanceState) => {
      setAppearanceState((prev) => {
        const next = updater(prev);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    []
  );

  const updateAppearance = useCallback(
    (partial: Partial<AppearanceState>) => {
      setAppearance((prev) => ({ ...prev, ...partial }));
    },
    [setAppearance]
  );

  // Apply DOM side effects: theme, font size, density, animations, highContrast, primary color
  useEffect(() => {
    const root = document.documentElement;

    // Theme handling - apply immediately for instant switching
    const isDark = appearance.theme === "dark";
    
    // Use color-scheme for better browser optimization
    root.style.colorScheme = isDark ? "dark" : "light";
    
    // Apply class change immediately
    if (isDark !== root.classList.contains("dark")) {
      root.classList.toggle("dark", isDark);
    }

    // Font size scaling
    const fontScale =
      appearance.fontSize === "small"
        ? 0.95
        : appearance.fontSize === "large"
        ? 1.05
        : 1;
    root.style.setProperty("--app-font-scale", String(fontScale));
    root.style.setProperty("font-size", `${fontScale * 16}px`);

    // Density affects spacing multiplier
    const densityScale =
      appearance.density === "compact"
        ? 0.9
        : appearance.density === "spacious"
        ? 1.1
        : 1;
    root.style.setProperty("--app-density-scale", String(densityScale));
    root.setAttribute("data-density", appearance.density);

    // Animations toggle
    if (!appearance.animations) {
      root.style.setProperty("--app-anim-duration", "0ms");
      root.classList.add("reduce-motion");
      root.classList.remove("theme-transition");
      root.classList.remove("theme-stable");
    } else {
      root.style.removeProperty("--app-anim-duration");
      root.classList.remove("reduce-motion");
      root.classList.add("theme-transition");
      
      // Remove theme-stable temporarily during transition
      root.classList.remove("theme-stable");
      
      // Add it back after transition completes to optimize performance
      setTimeout(() => {
        root.classList.add("theme-stable");
      }, 100);
    }

    // High contrast mode
    root.classList.toggle("high-contrast", appearance.highContrast);

    // Primary color token -> set CSS variable used by Tailwind theme tokens when possible
    // Simple mapping to hues; can be expanded
    const colorMap: Record<string, string> = {
      blue: "217 91% 60%",
      green: "142 76% 36%",
      purple: "262 83% 58%",
      red: "0 84% 60%",
      orange: "24 95% 53%",
      teal: "173 80% 40%",
    };
    const hsl = colorMap[appearance.primaryColor] || colorMap.blue;
    root.style.setProperty("--primary", `hsl(${hsl})`);
    root.setAttribute("data-primary", appearance.primaryColor);
  }, [appearance]);


  const value = useMemo<AppearanceContextValue>(
    () => ({ appearance, setAppearance, updateAppearance }),
    [appearance, setAppearance, updateAppearance]
  );

  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const ctx = useContext(AppearanceContext);
  if (!ctx)
    throw new Error("useAppearance must be used within AppearanceProvider");
  return ctx;
}
