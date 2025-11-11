# SolNetManage Design System Documentation

**Version:** 1.0.0  
**Last Updated:** October 15, 2025  
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Design Philosophy](#design-philosophy)
3. [Color System](#color-system)
4. [Typography](#typography)
5. [Spacing & Layout](#spacing--layout)
6. [Components](#components)
7. [Patterns & Best Practices](#patterns--best-practices)
8. [Accessibility](#accessibility)
9. [Dark Mode](#dark-mode)
10. [Exporting to Design Tools](#exporting-to-design-tools)

---

## Overview

The SolNetManage Design System is a comprehensive, code-first design system built with:

- **Framework:** React 18.3+ with TypeScript
- **Styling:** Tailwind CSS 3.4 with custom utility classes
- **Components:** shadcn/ui (Radix UI primitives)
- **Design Tokens:** CSS Custom Properties (CSS Variables)
- **Responsive:** Mobile-first approach
- **Theming:** Light and Dark mode support

### Key Features

✅ **Consistent** - Unified design language across all pages  
✅ **Accessible** - WCAG 2.1 AA compliant components  
✅ **Responsive** - Mobile, tablet, and desktop optimized  
✅ **Themeable** - Easy color customization via CSS variables  
✅ **Performant** - Optimized for fast loading and rendering  
✅ **Developer-Friendly** - Well-documented with TypeScript support

---

## Design Philosophy

### Principles

1. **Clarity First** - Information should be easy to find and understand
2. **Consistency** - Similar patterns for similar actions
3. **Efficiency** - Minimize clicks and cognitive load
4. **Feedback** - Provide clear feedback for all user actions
5. **Forgiveness** - Allow users to undo mistakes easily

### Visual Language

- **Clean & Modern** - Minimalist design with ample whitespace
- **Professional** - Suitable for business/enterprise use
- **Data-Focused** - Prioritize information hierarchy
- **Action-Oriented** - Clear call-to-action elements

---

## Color System

### Primary Colors

The primary color palette defines the brand identity.

| Color         | HSL Value            | Hex Equivalent | Usage                             |
| ------------- | -------------------- | -------------- | --------------------------------- |
| Primary       | `hsl(217, 91%, 60%)` | `#4F8FFF`      | Main brand color, primary actions |
| Primary Dark  | `hsl(217, 91%, 45%)` | `#2366E6`      | Hover states, emphasis            |
| Primary Light | `hsl(217, 91%, 75%)` | `#A3C7FF`      | Backgrounds, subtle highlights    |

**Usage Example:**

```tsx
<Button className="bg-primary hover:bg-primary-dark">Primary Action</Button>
```

### Semantic Colors

Colors with specific meanings for user feedback.

#### Success (Green)

- **Default:** `hsl(142, 76%, 36%)` - Success states, confirmations
- **Light:** `hsl(142, 76%, 50%)` - Success backgrounds

#### Warning (Orange/Yellow)

- **Default:** `hsl(38, 92%, 50%)` - Warning states, cautions
- **Light:** `hsl(38, 92%, 60%)` - Warning backgrounds

#### Error (Red)

- **Default:** `hsl(0, 84%, 60%)` - Error states, destructive actions
- **Light:** `hsl(0, 84%, 70%)` - Error backgrounds

#### Info (Blue)

- **Default:** `hsl(199, 89%, 48%)` - Informational messages
- **Light:** `hsl(199, 89%, 60%)` - Info backgrounds

**Usage Example:**

```tsx
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong</AlertDescription>
</Alert>
```

### Neutral Colors (Gray Scale)

A 10-step gray scale for text, borders, and backgrounds.

| Shade | HSL Value            | Usage                |
| ----- | -------------------- | -------------------- |
| 50    | `hsl(210, 40%, 98%)` | Lightest backgrounds |
| 100   | `hsl(210, 40%, 96%)` | Card backgrounds     |
| 200   | `hsl(214, 32%, 91%)` | Subtle borders       |
| 300   | `hsl(213, 27%, 84%)` | Borders              |
| 400   | `hsl(215, 20%, 65%)` | Disabled text        |
| 500   | `hsl(215, 16%, 47%)` | Secondary text       |
| 600   | `hsl(215, 19%, 35%)` | Body text            |
| 700   | `hsl(215, 25%, 27%)` | Headings             |
| 800   | `hsl(217, 33%, 17%)` | Strong emphasis      |
| 900   | `hsl(222, 84%, 5%)`  | Darkest text         |

### Color Usage Guidelines

1. **Text on Backgrounds**

   - Light backgrounds: Use gray-700 or darker for text
   - Dark backgrounds: Use gray-100 or lighter for text
   - Ensure minimum 4.5:1 contrast ratio (WCAG AA)

2. **Interactive Elements**

   - Primary actions: Primary color
   - Secondary actions: Secondary color
   - Destructive actions: Error color
   - Disabled states: Gray-400

3. **Status Indicators**
   - Pending: Gray
   - In Progress: Info (Blue)
   - Completed: Success (Green)
   - Failed: Error (Red)
   - Warning: Warning (Orange)

---

## Typography

### Font Family

**Primary Font:** Inter (Sans-serif)

```css
font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
  "Helvetica Neue", Arial, sans-serif;
```

**Monospace Font:** JetBrains Mono (for code)

```css
font-family: "JetBrains Mono", "Fira Code", Consolas, Monaco, monospace;
```

### Font Scale

| Size | Value           | Line Height    | Usage                  |
| ---- | --------------- | -------------- | ---------------------- |
| xs   | 0.75rem (12px)  | 1rem (16px)    | Small labels, captions |
| sm   | 0.875rem (14px) | 1.25rem (20px) | Body text (small)      |
| base | 1rem (16px)     | 1.5rem (24px)  | Body text (default)    |
| lg   | 1.125rem (18px) | 1.75rem (28px) | Large body text        |
| xl   | 1.25rem (20px)  | 1.75rem (28px) | H5 headings            |
| 2xl  | 1.5rem (24px)   | 2rem (32px)    | H4 headings            |
| 3xl  | 1.875rem (30px) | 2.25rem (36px) | H3 headings            |
| 4xl  | 2.25rem (36px)  | 2.5rem (40px)  | H2 headings            |
| 5xl  | 3rem (48px)     | 1              | H1 headings            |

### Font Weights

| Weight    | Value | Usage                       |
| --------- | ----- | --------------------------- |
| Light     | 300   | Subtle text, large headings |
| Normal    | 400   | Body text                   |
| Medium    | 500   | Emphasis, labels            |
| Semibold  | 600   | Subheadings, buttons        |
| Bold      | 700   | Headings, strong emphasis   |
| Extrabold | 800   | Hero text, major headings   |

### Heading Hierarchy

```tsx
<h1 className="text-4xl font-bold">Page Title</h1>
<h2 className="text-3xl font-semibold">Section Title</h2>
<h3 className="text-2xl font-semibold">Subsection</h3>
<h4 className="text-xl font-medium">Minor Heading</h4>
<h5 className="text-lg font-medium">Small Heading</h5>
<h6 className="text-base font-medium">Smallest Heading</h6>
```

### Typography Best Practices

1. **Line Length:** 45-75 characters per line for optimal readability
2. **Paragraph Spacing:** 1.5em between paragraphs
3. **Line Height:** 1.5-1.6 for body text, 1.2-1.4 for headings
4. **Text Alignment:** Left-aligned for body text (LTR languages)
5. **All Caps:** Avoid except for short labels and abbreviations

---

## Spacing & Layout

### Spacing Scale

Based on a 4px baseline grid:

| Token | Value   | Pixels | Usage                        |
| ----- | ------- | ------ | ---------------------------- |
| xs    | 0.25rem | 4px    | Minimal spacing, icon gaps   |
| sm    | 0.5rem  | 8px    | Small gaps, dense layouts    |
| md    | 1rem    | 16px   | Default spacing, form fields |
| lg    | 1.5rem  | 24px   | Section spacing              |
| xl    | 2rem    | 32px   | Card padding, large gaps     |
| 2xl   | 3rem    | 48px   | Page sections                |
| 3xl   | 4rem    | 64px   | Major sections               |

**Usage:**

```tsx
<div className="p-md">        {/* padding: 1rem */}
<div className="mt-lg">       {/* margin-top: 1.5rem */}
<div className="gap-sm">      {/* gap: 0.5rem (for flex/grid) */}
```

### Border Radius

Rounded corners for visual softness:

| Size | Value   | Pixels | Usage                    |
| ---- | ------- | ------ | ------------------------ |
| sm   | 0.25rem | 4px    | Small elements, tags     |
| md   | 0.5rem  | 8px    | Buttons, inputs, badges  |
| lg   | 0.75rem | 12px   | Cards, containers        |
| xl   | 1rem    | 16px   | Modals, large cards      |
| 2xl  | 1.5rem  | 24px   | Hero sections            |
| full | 9999px  | —      | Circular elements, pills |

### Shadows

Elevation system for depth and hierarchy:

| Level | CSS Value                          | Usage                    |
| ----- | ---------------------------------- | ------------------------ |
| sm    | `0 1px 2px rgba(0,0,0,0.05)`       | Subtle lift, buttons     |
| md    | `0 4px 6px rgba(0,0,0,0.1)`        | Cards, dropdowns         |
| lg    | `0 10px 15px rgba(0,0,0,0.1)`      | Elevated cards, popovers |
| xl    | `0 20px 25px rgba(0,0,0,0.1)`      | Modals, major elements   |
| 2xl   | `0 25px 50px rgba(0,0,0,0.25)`     | Overlays, hero sections  |
| inner | `inset 0 2px 4px rgba(0,0,0,0.05)` | Pressed states           |

### Breakpoints

Responsive design breakpoints:

| Breakpoint | Min Width | Target Devices                     |
| ---------- | --------- | ---------------------------------- |
| sm         | 640px     | Large phones (landscape)           |
| md         | 768px     | Tablets (portrait)                 |
| lg         | 1024px    | Tablets (landscape), small laptops |
| xl         | 1280px    | Desktops                           |
| 2xl        | 1536px    | Large desktops                     |

**Mobile-First Usage:**

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* 1 column on mobile, 2 on tablet, 3 on desktop */}
</div>
```

---

## Components

### Button

**Variants:**

- `default` - Primary action button
- `secondary` - Secondary actions
- `destructive` - Delete, remove actions
- `outline` - Subtle actions
- `ghost` - Minimal emphasis
- `link` - Text-style button

**Sizes:**

- `sm` - Small (28px height)
- `default` - Default (36px height)
- `lg` - Large (44px height)
- `icon` - Icon-only (square)

**Example:**

```tsx
<Button variant="default" size="md">
  Primary Action
</Button>
<Button variant="outline" size="sm">
  Secondary
</Button>
<Button variant="destructive">
  Delete
</Button>
```

### Input Fields

Standard form inputs with consistent styling:

```tsx
<Input type="text" placeholder="Enter text..." className="w-full" />
```

**States:**

- Default
- Focused (blue ring)
- Error (red border)
- Disabled (gray background)

### Card

Container component for grouped content:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Optional description</CardDescription>
  </CardHeader>
  <CardContent>{/* Card content */}</CardContent>
  <CardFooter>{/* Optional footer with actions */}</CardFooter>
</Card>
```

### Badges

Small status indicators:

```tsx
<Badge variant="default">Active</Badge>
<Badge variant="secondary">Pending</Badge>
<Badge variant="destructive">Failed</Badge>
<Badge variant="outline">Draft</Badge>
```

### Alerts

User feedback messages:

```tsx
<Alert>
  <Info className="h-4 w-4" />
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>
    This is an informational message.
  </AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Something went wrong.
  </AlertDescription>
</Alert>
```

### Complete Component List

Available in `/design-system` page:

1. **Form Controls:** Input, Textarea, Select, Checkbox, Radio, Switch
2. **Buttons:** Button, IconButton, ButtonGroup
3. **Feedback:** Alert, Toast, Badge, Progress, Skeleton
4. **Overlays:** Dialog, Modal, Popover, Tooltip, Sheet
5. **Navigation:** Tabs, Breadcrumb, Pagination
6. **Data Display:** Table, Card, Avatar, Separator
7. **Layout:** Container, Grid, Stack, Spacer

---

## Patterns & Best Practices

### Data Display Pattern

For metrics and statistics:

```tsx
<div className="grid grid-cols-3 gap-4">
  <Card>
    <CardContent className="pt-6">
      <div className="text-2xl font-bold">1,234</div>
      <div className="text-sm text-muted-foreground">Total Sales</div>
    </CardContent>
  </Card>
  {/* Repeat for other metrics */}
</div>
```

### Form Pattern

Standard form layout:

```tsx
<form className="space-y-4">
  <div className="space-y-2">
    <label className="text-sm font-medium">Field Label</label>
    <Input placeholder="Enter value..." />
    <p className="text-sm text-muted-foreground">Helper text</p>
  </div>
  <div className="flex gap-3">
    <Button type="submit">Submit</Button>
    <Button type="button" variant="outline">
      Cancel
    </Button>
  </div>
</form>
```

### Table Pattern

Data tables with actions:

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Column 1</TableHead>
      <TableHead>Column 2</TableHead>
      <TableHead className="text-right">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Data 1</TableCell>
      <TableCell>Data 2</TableCell>
      <TableCell className="text-right">
        <Button size="sm" variant="ghost">
          Edit
        </Button>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Loading States

Provide feedback during async operations:

```tsx
{
  isLoading ? <Skeleton className="h-20 w-full" /> : <div>{data}</div>;
}
```

### Empty States

Helpful messages when no data exists:

```tsx
<div className="text-center py-12">
  <Icon className="h-12 w-12 mx-auto text-muted-foreground" />
  <h3 className="mt-4 text-lg font-medium">No items found</h3>
  <p className="text-muted-foreground">Get started by creating a new item.</p>
  <Button className="mt-4">Create Item</Button>
</div>
```

---

## Accessibility

### WCAG 2.1 AA Compliance

✅ **Color Contrast:** 4.5:1 for normal text, 3:1 for large text  
✅ **Keyboard Navigation:** All interactive elements accessible via keyboard  
✅ **Screen Reader Support:** Proper ARIA labels and semantic HTML  
✅ **Focus Indicators:** Visible focus rings on all focusable elements  
✅ **Touch Targets:** Minimum 44x44px tap targets

### Best Practices

1. **Alt Text:** Provide descriptive alt text for images
2. **Form Labels:** Associate labels with inputs using `htmlFor`
3. **ARIA Attributes:** Use `aria-label`, `aria-describedby` when needed
4. **Heading Hierarchy:** Maintain logical heading order (h1 → h2 → h3)
5. **Skip Links:** Provide "Skip to main content" for keyboard users
6. **Color Independence:** Don't rely on color alone to convey information

### Example:

```tsx
<Button
  aria-label="Delete item"
  aria-describedby="delete-description"
>
  <Trash className="h-4 w-4" />
</Button>
<span id="delete-description" className="sr-only">
  This action cannot be undone
</span>
```

---

## Dark Mode

Full dark mode support using CSS variables:

### Toggling Dark Mode

```tsx
import { useTheme } from "@/hooks/use-theme";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
}
```

### Dark Mode Color Adjustments

Colors automatically adapt in dark mode:

| Light Mode             | Dark Mode                   |
| ---------------------- | --------------------------- |
| `hsl(0, 0%, 100%)`     | `hsl(240, 10%, 3.9%)`       |
| `hsl(20, 14.3%, 4.1%)` | `hsl(0, 0%, 98%)`           |
| Card backgrounds       | Darker with proper contrast |

---

## Exporting to Design Tools

### 1. Download Design Tokens

Visit `/design-system` in the app and click **"Export Tokens"** to download `design-tokens.json`.

### 2. Import to Figma

**Option A: Figma Tokens Plugin**

1. Install [Figma Tokens](https://www.figma.com/community/plugin/843461159747178978/Figma-Tokens) plugin
2. Open the plugin in Figma
3. Click "Load from JSON"
4. Upload the `design-tokens.json` file
5. Apply tokens to your designs

**Option B: Manual CSS Variables**

1. Copy CSS variables from `/design-system` → Tokens tab
2. Use in Figma's color picker (convert HSL to RGB/Hex)
3. Create color styles in Figma manually

### 3. Create Components in Figma

Use the design tokens to recreate:

- Buttons with correct padding, radius, colors
- Input fields with matching styles
- Cards with proper shadows and spacing
- Typography styles matching the scale

### 4. Design Token Format

The exported JSON follows this structure:

```json
{
  "global": {
    "colors": {
      "primary": { "value": "hsl(217, 91%, 60%)", "type": "color" },
      "spacing-md": { "value": "1rem", "type": "spacing" }
    }
  }
}
```

---

## Quick Reference

### Accessing the Design System

1. **Live Showcase:** Navigate to `/design-system` (Admin only)
2. **Code Reference:** `client/src/design-tokens.ts`
3. **CSS Variables:** `client/src/index.css`
4. **Components:** `client/src/components/ui/`

### File Locations

```
client/src/
├── design-tokens.ts           # Design token exports
├── index.css                  # CSS variables and global styles
├── pages/design-system.tsx    # Interactive showcase page
└── components/ui/             # Component library
```

### Common Patterns

```tsx
// Primary button
<Button>Action</Button>

// Card with content
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// Form field
<div className="space-y-2">
  <Label htmlFor="field">Label</Label>
  <Input id="field" />
</div>

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id}>...</Card>)}
</div>
```

---

## Support & Updates

- **Documentation:** This file (`DESIGN_SYSTEM.md`)
- **Live Demo:** `/design-system` route in the application
- **System Blueprint:** See `SYSTEM_BLUEPRINT.md` for system architecture
- **Version:** 1.0.0 (Production)

**Last Updated:** October 15, 2025  
**Maintained By:** SolNetManage Development Team


