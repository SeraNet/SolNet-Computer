# Figma Design System Import Guide

**Version:** 1.0  
**Purpose:** Guide for importing SolNetManage design tokens into Figma  
**Last Updated:** October 15, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Method 1: Using Figma Tokens Plugin](#method-1-using-figma-tokens-plugin) (Recommended)
4. [Method 2: Manual Import](#method-2-manual-import)
5. [Creating Components in Figma](#creating-components-in-figma)
6. [Maintaining Sync](#maintaining-sync)
7. [Troubleshooting](#troubleshooting)

---

## Overview

This guide will help you import the SolNetManage design system into Figma, allowing designers to:

- Create consistent mockups and wireframes
- Prototype new features
- Collaborate with developers using the same design language
- Export designs that match the implemented code

### What You'll Import

- ✅ **Color Palette:** 50+ color tokens (primary, semantic, grays)
- ✅ **Typography:** Font sizes, weights, and line heights
- ✅ **Spacing:** Spacing scale (xs to 3xl)
- ✅ **Border Radius:** Rounding values (sm to full)
- ✅ **Shadows:** Elevation system (sm to 2xl)
- ✅ **Component Specs:** Button, input, card dimensions

---

## Prerequisites

### Required

1. **Figma Account** (Free or paid)
2. **Access to SolNetManage App** (to export tokens)
3. **Figma Desktop or Web App**

### Recommended Plugins

- **Figma Tokens** - For automated token import
- **Styles to Variables** - Convert styles to Figma variables
- **Color Contrast Checker** - Verify WCAG compliance

---

## Method 1: Using Figma Tokens Plugin

### Recommended Approach ⭐

The Figma Tokens plugin automates the import process.

### Step 1: Export Design Tokens from SolNetManage

1. Log into SolNetManage as an admin
2. Navigate to **Settings** → **Design System** (or go to `/design-system`)
3. Click the **"Tokens"** tab
4. Click **"Download Full Tokens (JSON)"** button
5. Save the `design-tokens.json` file to your computer

### Step 2: Install Figma Tokens Plugin

1. Open Figma
2. Go to **Plugins** → **Browse Plugins in Community**
3. Search for **"Figma Tokens"** by Jan Six
4. Click **"Install"**

**Plugin Link:** https://www.figma.com/community/plugin/843461159747178978/Figma-Tokens

### Step 3: Import Tokens into Figma

1. Open your Figma file (or create a new one)
2. Right-click → **Plugins** → **Figma Tokens**
3. In the plugin panel, click **"Load from JSON"** or the file icon
4. Select your downloaded `design-tokens.json` file
5. The plugin will parse and import all tokens

### Step 4: Apply Tokens to Figma Styles

1. In the Figma Tokens plugin, go to **"Themes"** tab
2. Click **"Create Styles"** or **"Update Styles"**
3. This will convert JSON tokens to Figma color styles, text styles, and effect styles
4. You can now use these styles in your designs

### Step 5: Organize Your Styles

The imported styles will appear in Figma's style picker:

- **Colors:** Organized by category (primary, success, warning, etc.)
- **Text Styles:** Font sizes and weights
- **Effects:** Shadows (elevation system)

---

## Method 2: Manual Import

### If Plugin Method Doesn't Work

This approach requires manual work but gives you full control.

### Step 1: Export Design Tokens

1. Navigate to `/design-system` in SolNetManage
2. Go to the **"Tokens"** tab
3. Click **"Copy as CSS Variables"**
4. Paste the CSS into a text editor

### Step 2: Create Color Styles in Figma

For each color in the design system:

1. In Figma, click the **"Fill"** color picker
2. Choose the **"+"** icon to create a new style
3. Name it: `Primary/Default`, `Success/Light`, etc.
4. Convert HSL values to RGB/Hex:
   - Use online converters like https://www.rapidtables.com/convert/color/hsl-to-rgb.html
   - Example: `hsl(217, 91%, 60%)` → `#4F8FFF`

**Color List to Create:**

```
Primary
├── Default (hsl(217, 91%, 60%))
├── Dark (hsl(217, 91%, 45%))
└── Light (hsl(217, 91%, 75%))

Success
├── Default (hsl(142, 76%, 36%))
└── Light (hsl(142, 76%, 50%))

Warning
├── Default (hsl(38, 92%, 50%))
└── Light (hsl(38, 92%, 60%))

Error
├── Default (hsl(0, 84%, 60%))
└── Light (hsl(0, 84%, 70%))

Info
├── Default (hsl(199, 89%, 48%))
└── Light (hsl(199, 89%, 60%))

Gray Scale
├── 50 (hsl(210, 40%, 98%))
├── 100 (hsl(210, 40%, 96%))
├── 200 (hsl(214, 32%, 91%))
├── ... (continue for 300-900)
└── 900 (hsl(222, 84%, 5%))
```

### Step 3: Create Text Styles

Create text styles for the typography scale:

1. Click **"Text"** → **"Type Settings"** (T key)
2. Click the **"+"** icon in the style dropdown
3. Configure each text style:

| Style Name | Font Size | Line Height | Font Weight    |
| ---------- | --------- | ----------- | -------------- |
| Heading/H1 | 48px      | 48px        | Bold (700)     |
| Heading/H2 | 36px      | 40px        | Semibold (600) |
| Heading/H3 | 30px      | 36px        | Semibold (600) |
| Heading/H4 | 24px      | 32px        | Medium (500)   |
| Heading/H5 | 20px      | 28px        | Medium (500)   |
| Heading/H6 | 16px      | 24px        | Medium (500)   |
| Body/Large | 18px      | 28px        | Normal (400)   |
| Body/Base  | 16px      | 24px        | Normal (400)   |
| Body/Small | 14px      | 20px        | Normal (400)   |
| Caption    | 12px      | 16px        | Normal (400)   |

**Font:** Use **Inter** (available free on Google Fonts)

### Step 4: Create Effect Styles (Shadows)

Create shadow/elevation styles:

1. Select a rectangle
2. Add a **Drop Shadow** effect
3. Click the style icon **"+"** to save

| Style Name | Blur | Y Offset | Color            |
| ---------- | ---- | -------- | ---------------- |
| Shadow/SM  | 2px  | 1px      | rgba(0,0,0,0.05) |
| Shadow/MD  | 6px  | 4px      | rgba(0,0,0,0.1)  |
| Shadow/LG  | 15px | 10px     | rgba(0,0,0,0.1)  |
| Shadow/XL  | 25px | 20px     | rgba(0,0,0,0.1)  |
| Shadow/2XL | 50px | 25px     | rgba(0,0,0,0.25) |

---

## Creating Components in Figma

Once you have the design tokens imported, create reusable components.

### Button Component

1. Create a rectangle (R key)
2. Set dimensions:
   - Width: Auto (min 100px)
   - Height: 36px (default size)
3. Apply styles:
   - Fill: `Primary/Default`
   - Corner Radius: 8px (`md`)
   - Padding: 16px horizontal, 8px vertical
4. Add text layer:
   - Text: "Button"
   - Style: `Body/Base`
   - Color: White
5. Create component: **Cmd+Option+K** (Mac) / **Ctrl+Alt+K** (Windows)
6. Add variants:
   - Default, Secondary, Destructive, Outline
   - Small (28px), Medium (36px), Large (44px)

### Input Field Component

1. Create a rectangle: 300px × 40px
2. Apply styles:
   - Fill: White
   - Stroke: `Gray/300` (1px)
   - Corner Radius: 8px
   - Padding: 12px
3. Add placeholder text:
   - Text: "Enter text..."
   - Style: `Body/Base`
   - Color: `Gray/400`
4. Create component with states:
   - Default
   - Focused (Blue border)
   - Error (Red border)
   - Disabled (Gray background)

### Card Component

1. Create a rectangle: 320px × Auto
2. Apply styles:
   - Fill: White
   - Corner Radius: 12px (`lg`)
   - Shadow: `Shadow/MD`
   - Padding: 24px
3. Add Auto Layout (Shift+A):
   - Direction: Vertical
   - Gap: 16px
4. Create header section:
   - Title: `Heading/H4`
   - Description: `Body/Small`, `Gray/500`
5. Create component with variants

---

## Maintaining Sync

### Workflow for Updates

When the design system changes in code:

1. **Export New Tokens**
   - Go to `/design-system` → Download updated JSON
2. **Re-import to Figma**
   - Use Figma Tokens plugin to reload
   - Update existing styles
3. **Update Components**
   - Review component specs
   - Adjust as needed
4. **Communicate Changes**
   - Notify design team of updates
   - Document changes in Figma file

### Best Practices

✅ **Single Source of Truth:** Keep the code as the source of truth  
✅ **Regular Syncs:** Update Figma weekly or before major design work  
✅ **Version Control:** Use Figma's version history  
✅ **Component Library:** Create a master Figma file for components  
✅ **Documentation:** Add notes in Figma about token usage

---

## Using Variables (Figma Variables Feature)

### If Using Figma Variables (New Feature)

Figma now supports Variables natively (Paid plans):

1. **Create Variable Collections:**

   - Colors
   - Spacing
   - Corner Radius

2. **Import from JSON:**

   - Use Figma Tokens plugin to convert to Variables
   - Or manually create each variable

3. **Benefits:**
   - Better theming support (Light/Dark modes)
   - Easy mode switching
   - Programmatic design

### Converting Styles to Variables

1. Install **"Styles to Variables"** plugin
2. Run the plugin
3. Select styles to convert
4. Creates Figma Variables from existing styles

---

## Troubleshooting

### Issue: Colors Look Different

**Problem:** HSL values in code don't match Figma colors  
**Solution:**

- Ensure accurate HSL → RGB conversion
- Use online tools to verify colors
- Check for color profile differences (sRGB vs Display P3)

### Issue: Figma Tokens Plugin Not Working

**Problem:** Plugin won't load JSON file  
**Solution:**

- Verify JSON is valid (use JSONLint.com)
- Try the manual import method
- Check plugin is up to date
- Restart Figma

### Issue: Fonts Don't Match

**Problem:** Text looks different in Figma vs app  
**Solution:**

- Install Inter font locally from Google Fonts
- Ensure using same font weights
- Check line-height values match

### Issue: Spacing Inconsistencies

**Problem:** Component spacing doesn't match code  
**Solution:**

- Use Auto Layout with explicit gap values
- Reference the spacing scale (8px grid)
- Check padding vs margin differences

---

## Resources

### Official Documentation

- [Figma Tokens Plugin Docs](https://docs.tokens.studio/)
- [Figma Variables Guide](https://help.figma.com/hc/en-us/articles/15339657135383-Guide-to-variables-in-Figma)
- [Design Tokens W3C Spec](https://design-tokens.github.io/community-group/format/)

### Color Converters

- [HSL to RGB Converter](https://www.rapidtables.com/convert/color/hsl-to-rgb.html)
- [Coolors.co](https://coolors.co/convert) - Bulk color conversion

### Fonts

- [Inter Font](https://fonts.google.com/specimen/Inter) - Google Fonts
- [JetBrains Mono](https://www.jetbrains.com/lp/mono/) - Free monospace font

### Plugins

- [Figma Tokens](https://www.figma.com/community/plugin/843461159747178978)
- [Color Contrast Checker](https://www.figma.com/community/plugin/733159460536249875)
- [Styles to Variables](https://www.figma.com/community/plugin/1245304441258327827)

---

## Quick Start Checklist

- [ ] Export `design-tokens.json` from `/design-system`
- [ ] Install Figma Tokens plugin
- [ ] Import JSON into Figma Tokens
- [ ] Create Figma styles from tokens
- [ ] Install Inter font in Figma
- [ ] Create button component
- [ ] Create input component
- [ ] Create card component
- [ ] Set up color styles (50+ colors)
- [ ] Set up text styles (10+ styles)
- [ ] Set up effect styles (5 shadows)
- [ ] Document in Figma file
- [ ] Share with team

---

## Support

For questions or issues:

- **Design System:** See `DESIGN_SYSTEM.md`
- **Live Demo:** Navigate to `/design-system` in the app
- **System Architecture:** See `SYSTEM_BLUEPRINT.md`

**Version:** 1.0  
**Last Updated:** October 15, 2025


