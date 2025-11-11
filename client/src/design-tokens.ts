/**
 * Design Tokens - SolNetManage Design System
 *
 * This file exports all design tokens used in the application.
 * Can be imported into Figma, exported to JSON, or used programmatically.
 */

export const designTokens = {
  name: "SolNetManage Design System",
  version: "1.0.0",

  colors: {
    primary: {
      DEFAULT: "hsl(217, 91%, 60%)",
      dark: "hsl(217, 91%, 45%)",
      light: "hsl(217, 91%, 75%)",
      foreground: "hsl(0, 0%, 100%)",
    },
    secondary: {
      DEFAULT: "hsl(220, 14%, 96%)",
      dark: "hsl(220, 14%, 90%)",
      foreground: "hsl(24, 9.8%, 10%)",
    },
    accent: {
      DEFAULT: "hsl(262, 83%, 58%)",
      light: "hsl(262, 83%, 70%)",
      foreground: "hsl(24, 9.8%, 10%)",
    },
    success: {
      DEFAULT: "hsl(142, 76%, 36%)",
      light: "hsl(142, 76%, 50%)",
      foreground: "hsl(0, 0%, 100%)",
    },
    warning: {
      DEFAULT: "hsl(38, 92%, 50%)",
      light: "hsl(38, 92%, 60%)",
      foreground: "hsl(24, 9.8%, 10%)",
    },
    error: {
      DEFAULT: "hsl(0, 84%, 60%)",
      light: "hsl(0, 84%, 70%)",
      foreground: "hsl(60, 9.1%, 97.8%)",
    },
    info: {
      DEFAULT: "hsl(199, 89%, 48%)",
      light: "hsl(199, 89%, 60%)",
      foreground: "hsl(0, 0%, 100%)",
    },
    gray: {
      50: "hsl(210, 40%, 98%)",
      100: "hsl(210, 40%, 96%)",
      200: "hsl(214, 32%, 91%)",
      300: "hsl(213, 27%, 84%)",
      400: "hsl(215, 20%, 65%)",
      500: "hsl(215, 16%, 47%)",
      600: "hsl(215, 19%, 35%)",
      700: "hsl(215, 25%, 27%)",
      800: "hsl(217, 33%, 17%)",
      900: "hsl(222, 84%, 5%)",
    },
    background: "hsl(0, 0%, 100%)",
    foreground: "hsl(20, 14.3%, 4.1%)",
    card: {
      DEFAULT: "hsl(0, 0%, 100%)",
      foreground: "hsl(20, 14.3%, 4.1%)",
    },
    border: "hsl(20, 5.9%, 90%)",
    input: "hsl(20, 5.9%, 90%)",
    ring: "hsl(20, 14.3%, 4.1%)",
  },

  spacing: {
    xs: "0.25rem", // 4px
    sm: "0.5rem", // 8px
    md: "1rem", // 16px
    lg: "1.5rem", // 24px
    xl: "2rem", // 32px
    "2xl": "3rem", // 48px
    "3xl": "4rem", // 64px
  },

  borderRadius: {
    sm: "0.25rem", // 4px
    md: "0.5rem", // 8px
    lg: "0.75rem", // 12px
    xl: "1rem", // 16px
    "2xl": "1.5rem", // 24px
    full: "9999px",
  },

  typography: {
    fontFamily: {
      sans: [
        "Inter",
        "system-ui",
        "-apple-system",
        "BlinkMacSystemFont",
        '"Segoe UI"',
        "Roboto",
        '"Helvetica Neue"',
        "Arial",
        "sans-serif",
      ].join(", "),
      mono: [
        '"JetBrains Mono"',
        '"Fira Code"',
        "Consolas",
        "Monaco",
        "monospace",
      ].join(", "),
    },
    fontSize: {
      xs: ["0.75rem", { lineHeight: "1rem" }], // 12px
      sm: ["0.875rem", { lineHeight: "1.25rem" }], // 14px
      base: ["1rem", { lineHeight: "1.5rem" }], // 16px
      lg: ["1.125rem", { lineHeight: "1.75rem" }], // 18px
      xl: ["1.25rem", { lineHeight: "1.75rem" }], // 20px
      "2xl": ["1.5rem", { lineHeight: "2rem" }], // 24px
      "3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px
      "4xl": ["2.25rem", { lineHeight: "2.5rem" }], // 36px
      "5xl": ["3rem", { lineHeight: "1" }], // 48px
    },
    fontWeight: {
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
    },
  },

  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
  },

  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
};

/**
 * Export for Figma Tokens Plugin
 * Format: https://github.com/tokens-studio/figma-plugin
 */
export const figmaTokens = {
  global: {
    colors: Object.entries(designTokens.colors).reduce((acc, [key, value]) => {
      if (typeof value === "string") {
        acc[key] = { value, type: "color" };
      } else {
        Object.entries(value).forEach(([subKey, subValue]) => {
          acc[`${key}-${subKey}`] = { value: subValue, type: "color" };
        });
      }
      return acc;
    }, {} as Record<string, any>),
    spacing: Object.entries(designTokens.spacing).reduce(
      (acc, [key, value]) => {
        acc[key] = { value, type: "spacing" };
        return acc;
      },
      {} as Record<string, any>
    ),
    borderRadius: Object.entries(designTokens.borderRadius).reduce(
      (acc, [key, value]) => {
        acc[key] = { value, type: "borderRadius" };
        return acc;
      },
      {} as Record<string, any>
    ),
    fontSize: Object.entries(designTokens.typography.fontSize).reduce(
      (acc, [key, value]) => {
        acc[key] = { value: value[0], type: "fontSize" };
        return acc;
      },
      {} as Record<string, any>
    ),
    fontWeight: Object.entries(designTokens.typography.fontWeight).reduce(
      (acc, [key, value]) => {
        acc[key] = { value, type: "fontWeight" };
        return acc;
      },
      {} as Record<string, any>
    ),
  },
};

/**
 * Component-specific tokens
 */
export const componentTokens = {
  button: {
    paddingX: {
      sm: designTokens.spacing.md,
      md: designTokens.spacing.lg,
      lg: designTokens.spacing.xl,
    },
    paddingY: {
      sm: designTokens.spacing.sm,
      md: designTokens.spacing.md,
      lg: designTokens.spacing.lg,
    },
    borderRadius: designTokens.borderRadius.md,
    fontSize: {
      sm: designTokens.typography.fontSize.sm[0],
      md: designTokens.typography.fontSize.base[0],
      lg: designTokens.typography.fontSize.lg[0],
    },
  },
  input: {
    borderRadius: designTokens.borderRadius.md,
    borderColor: designTokens.colors.border,
    padding: designTokens.spacing.md,
    fontSize: designTokens.typography.fontSize.base[0],
  },
  card: {
    borderRadius: designTokens.borderRadius.lg,
    padding: designTokens.spacing.xl,
    shadow: designTokens.shadows.md,
    backgroundColor: designTokens.colors.card.DEFAULT,
  },
  modal: {
    borderRadius: designTokens.borderRadius.xl,
    padding: designTokens.spacing["2xl"],
    shadow: designTokens.shadows["2xl"],
    backdropBlur: "8px",
  },
};


