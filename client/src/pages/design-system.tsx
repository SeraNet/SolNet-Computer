// This file is currently disabled - all code is commented out
// Uncomment and implement when needed

export default function DesignSystem() {
  return null;
}

// import { useState } from "react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { Separator } from "@/components/ui/separator";
// import { designTokens } from "@/design-tokens";
// import {
//   AlertCircle,
//   CheckCircle2,
//   Info,
//   AlertTriangle,
//   Copy,
//   Check,
//   Download
// } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";

// export default function DesignSystem() {
//   const { toast } = useToast();
//   const [copiedValue, setCopiedValue] = useState<string | null>(null);

//   const copyToClipboard = (value: string, label: string) => {
//     navigator.clipboard.writeText(value);
//     setCopiedValue(value);
//     toast({
//       title: "Copied!",
//       description: `${label} copied to clipboard`,
//     });
//     setTimeout(() => setCopiedValue(null), 2000);
//   };

//   const downloadTokens = () => {
//     const dataStr = JSON.stringify(designTokens, null, 2);
//     const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
//     const exportFileDefaultName = "design-tokens.json";

//     const linkElement = document.createElement("a");
//     linkElement.setAttribute("href", dataUri);
//     linkElement.setAttribute("download", exportFileDefaultName);
//     linkElement.click();

//     toast({
//       title: "Download Started",
//       description: "Design tokens JSON file is being downloaded",
//     });
//   };

//   return (
//     <div className="container mx-auto py-6 space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-4xl font-bold tracking-tight">Design System</h1>
//           <p className="text-muted-foreground mt-2">
//             Complete design system documentation and component showcase
//           </p>
//         </div>
//         <Button onClick={downloadTokens} variant="outline">
//           <Download className="h-4 w-4 mr-2" />
//           Export Tokens
//         </Button>
//       </div>

//       <Tabs defaultValue="colors" className="space-y-6">
//         <TabsList className="grid w-full grid-cols-6">
//           <TabsTrigger value="colors">Colors</TabsTrigger>
//           <TabsTrigger value="typography">Typography</TabsTrigger>
//           <TabsTrigger value="spacing">Spacing</TabsTrigger>
//           <TabsTrigger value="components">Components</TabsTrigger>
//           <TabsTrigger value="patterns">Patterns</TabsTrigger>
//           <TabsTrigger value="tokens">Tokens</TabsTrigger>
//         </TabsList>

//         {/* Colors Tab */}
//         <TabsContent value="colors" className="space-y-6">
//           {/* Primary Colors */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Primary Colors</CardTitle>
//               <CardDescription>Main brand colors used throughout the application</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="grid grid-cols-3 gap-4">
//                 {Object.entries(designTokens.colors.primary).map(([key, value]) => (
//                   <ColorSwatch
//                     key={key}
//                     name={`Primary ${key}`}
//                     value={value}
//                     onCopy={() => copyToClipboard(value, `Primary ${key}`)}
//                     copied={copiedValue === value}
//                   />
//                 ))}
//               </div>
//             </CardContent>
//           </Card>

//           {/* Semantic Colors */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Semantic Colors</CardTitle>
//               <CardDescription>Colors for specific states and meanings</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div>
//                 <h4 className="text-sm font-semibold mb-3">Success</h4>
//                 <div className="grid grid-cols-3 gap-4">
//                   {Object.entries(designTokens.colors.success).map(([key, value]) => (
//                     <ColorSwatch
//                       key={key}
//                       name={`Success ${key}`}
//                       value={value}
//                       onCopy={() => copyToClipboard(value, `Success ${key}`)}
//                       copied={copiedValue === value}
//                     />
//                   ))}
//                 </div>
//               </div>

//               <div>
//                 <h4 className="text-sm font-semibold mb-3">Warning</h4>
//                 <div className="grid grid-cols-3 gap-4">
//                   {Object.entries(designTokens.colors.warning).map(([key, value]) => (
//                     <ColorSwatch
//                       key={key}
//                       name={`Warning ${key}`}
//                       value={value}
//                       onCopy={() => copyToClipboard(value, `Warning ${key}`)}
//                       copied={copiedValue === value}
//                     />
//                   ))}
//                 </div>
//               </div>

//               <div>
//                 <h4 className="text-sm font-semibold mb-3">Error</h4>
//                 <div className="grid grid-cols-3 gap-4">
//                   {Object.entries(designTokens.colors.error).map(([key, value]) => (
//                     <ColorSwatch
//                       key={key}
//                       name={`Error ${key}`}
//                       value={value}
//                       onCopy={() => copyToClipboard(value, `Error ${key}`)}
//                       copied={copiedValue === value}
//                     />
//                   ))}
//                 </div>
//               </div>

//               <div>
//                 <h4 className="text-sm font-semibold mb-3">Info</h4>
//                 <div className="grid grid-cols-3 gap-4">
//                   {Object.entries(designTokens.colors.info).map(([key, value]) => (
//                     <ColorSwatch
//                       key={key}
//                       name={`Info ${key}`}
//                       value={value}
//                       onCopy={() => copyToClipboard(value, `Info ${key}`)}
//                       copied={copiedValue === value}
//                     />
//                   ))}
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Gray Scale */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Gray Scale</CardTitle>
//               <CardDescription>Neutral colors for backgrounds, borders, and text</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="grid grid-cols-5 gap-4">
//                 {Object.entries(designTokens.colors.gray).map(([key, value]) => (
//                   <ColorSwatch
//                     key={key}
//                     name={`Gray ${key}`}
//                     value={value}
//                     onCopy={() => copyToClipboard(value, `Gray ${key}`)}
//                     copied={copiedValue === value}
//                   />
//                 ))}
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Typography Tab */}
//         <TabsContent value="typography" className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Font Sizes</CardTitle>
//               <CardDescription>Typography scale with line heights</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               {Object.entries(designTokens.typography.fontSize).map(([key, [size, { lineHeight }]]) => (
//                 <div key={key} className="flex items-baseline gap-4 p-4 border rounded-lg">
//                   <div className="w-24">
//                     <code className="text-sm bg-muted px-2 py-1 rounded">{key}</code>
//                   </div>
//                   <div className="flex-1">
//                     <p style={{ fontSize: size, lineHeight }}>
//                       The quick brown fox jumps over the lazy dog
//                     </p>
//                   </div>
//                   <div className="text-sm text-muted-foreground">
//                     {size} / {lineHeight}
//                   </div>
//                 </div>
//               ))}
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Font Weights</CardTitle>
//               <CardDescription>Available font weight variations</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               {Object.entries(designTokens.typography.fontWeight).map(([key, weight]) => (
//                 <div key={key} className="flex items-center gap-4 p-4 border rounded-lg">
//                   <div className="w-32">
//                     <code className="text-sm bg-muted px-2 py-1 rounded">{key}</code>
//                   </div>
//                   <div className="flex-1">
//                     <p style={{ fontWeight: weight }} className="text-lg">
//                       The quick brown fox jumps over the lazy dog
//                     </p>
//                   </div>
//                   <div className="text-sm text-muted-foreground">{weight}</div>
//                 </div>
//               ))}
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Heading Hierarchy</CardTitle>
//               <CardDescription>Standard heading styles</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <h1 className="text-4xl font-bold">Heading 1 - Page Titles</h1>
//               <h2 className="text-3xl font-semibold">Heading 2 - Section Titles</h2>
//               <h3 className="text-2xl font-semibold">Heading 3 - Subsection Titles</h3>
//               <h4 className="text-xl font-medium">Heading 4 - Minor Headings</h4>
//               <h5 className="text-lg font-medium">Heading 5 - Small Headings</h5>
//               <h6 className="text-base font-medium">Heading 6 - Smallest Headings</h6>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Spacing Tab */}
//         <TabsContent value="spacing" className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Spacing Scale</CardTitle>
//               <CardDescription>Consistent spacing system for margins and padding</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               {Object.entries(designTokens.spacing).map(([key, value]) => (
//                 <div key={key} className="flex items-center gap-4">
//                   <div className="w-24">
//                     <code className="text-sm bg-muted px-2 py-1 rounded">{key}</code>
//                   </div>
//                   <div className="flex-1">
//                     <div className="bg-primary" style={{ width: value, height: "40px" }} />
//                   </div>
//                   <div className="text-sm text-muted-foreground w-24 text-right">{value}</div>
//                 </div>
//               ))}
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Border Radius</CardTitle>
//               <CardDescription>Rounded corner scales</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               {Object.entries(designTokens.borderRadius).map(([key, value]) => (
//                 <div key={key} className="flex items-center gap-4">
//                   <div className="w-24">
//                     <code className="text-sm bg-muted px-2 py-1 rounded">{key}</code>
//                   </div>
//                   <div className="flex-1">
//                     <div
//                       className="bg-primary h-20 w-32"
//                       style={{ borderRadius: value }}
//                     />
//                   </div>
//                   <div className="text-sm text-muted-foreground w-24 text-right">{value}</div>
//                 </div>
//               ))}
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Shadows</CardTitle>
//               <CardDescription>Elevation and depth effects</CardDescription>
//             </CardHeader>
//             <CardContent className="grid grid-cols-3 gap-6">
//               {Object.entries(designTokens.shadows).map(([key, value]) => (
//                 <div key={key} className="space-y-2">
//                   <code className="text-sm bg-muted px-2 py-1 rounded">{key}</code>
//                   <div
//                     className="bg-white p-6 rounded-lg"
//                     style={{ boxShadow: value }}
//                   >
//                     Shadow {key}
//                   </div>
//                 </div>
//               ))}
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Components Tab */}
//         <TabsContent value="components" className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Buttons</CardTitle>
//               <CardDescription>Button variants and sizes</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="space-y-4">
//                 <h4 className="text-sm font-semibold">Variants</h4>
//                 <div className="flex flex-wrap gap-3">
//                   <Button>Default</Button>
//                   <Button variant="secondary">Secondary</Button>
//                   <Button variant="destructive">Destructive</Button>
//                   <Button variant="outline">Outline</Button>
//                   <Button variant="ghost">Ghost</Button>
//                   <Button variant="link">Link</Button>
//                 </div>
//               </div>

//               <Separator />

//               <div className="space-y-4">
//                 <h4 className="text-sm font-semibold">Sizes</h4>
//                 <div className="flex flex-wrap items-center gap-3">
//                   <Button size="sm">Small</Button>
//                   <Button size="default">Default</Button>
//                   <Button size="lg">Large</Button>
//                   <Button size="icon"><Check className="h-4 w-4" /></Button>
//                 </div>
//               </div>

//               <Separator />

//               <div className="space-y-4">
//                 <h4 className="text-sm font-semibold">States</h4>
//                 <div className="flex flex-wrap gap-3">
//                   <Button>Normal</Button>
//                   <Button disabled>Disabled</Button>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Form Controls</CardTitle>
//               <CardDescription>Input fields and form elements</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium">Default Input</label>
//                   <Input placeholder="Enter text..." />
//                 </div>
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium">Disabled Input</label>
//                   <Input placeholder="Disabled" disabled />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Badges</CardTitle>
//               <CardDescription>Badge variants and colors</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="flex flex-wrap gap-3">
//                 <Badge>Default</Badge>
//                 <Badge variant="secondary">Secondary</Badge>
//                 <Badge variant="destructive">Destructive</Badge>
//                 <Badge variant="outline">Outline</Badge>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Alerts</CardTitle>
//               <CardDescription>Alert messages for different states</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <Alert>
//                 <Info className="h-4 w-4" />
//                 <AlertTitle>Information</AlertTitle>
//                 <AlertDescription>
//                   This is an informational alert message.
//                 </AlertDescription>
//               </Alert>

//               <Alert variant="destructive">
//                 <AlertCircle className="h-4 w-4" />
//                 <AlertTitle>Error</AlertTitle>
//                 <AlertDescription>
//                   This is an error alert message.
//                 </AlertDescription>
//               </Alert>

//               <Alert className="border-yellow-500 bg-yellow-50">
//                 <AlertTriangle className="h-4 w-4 text-yellow-600" />
//                 <AlertTitle className="text-yellow-800">Warning</AlertTitle>
//                 <AlertDescription className="text-yellow-700">
//                   This is a warning alert message.
//                 </AlertDescription>
//               </Alert>

//               <Alert className="border-green-500 bg-green-50">
//                 <CheckCircle2 className="h-4 w-4 text-green-600" />
//                 <AlertTitle className="text-green-800">Success</AlertTitle>
//                 <AlertDescription className="text-green-700">
//                   This is a success alert message.
//                 </AlertDescription>
//               </Alert>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Patterns Tab */}
//         <TabsContent value="patterns" className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Card Layouts</CardTitle>
//               <CardDescription>Common card patterns used in the application</CardDescription>
//             </CardHeader>
//             <CardContent className="grid grid-cols-2 gap-4">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Simple Card</CardTitle>
//                   <CardDescription>Basic card with header and content</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <p className="text-sm">Card content goes here.</p>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader>
//                   <div className="flex items-center justify-between">
//                     <CardTitle>Card with Action</CardTitle>
//                     <Button size="sm">Action</Button>
//                   </div>
//                 </CardHeader>
//                 <CardContent>
//                   <p className="text-sm">Card with action button in header.</p>
//                 </CardContent>
//               </Card>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Data Display Patterns</CardTitle>
//               <CardDescription>Common ways to display information</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-3 gap-4">
//                 <div className="p-4 border rounded-lg">
//                   <div className="text-2xl font-bold">1,234</div>
//                   <div className="text-sm text-muted-foreground">Total Sales</div>
//                 </div>
//                 <div className="p-4 border rounded-lg">
//                   <div className="text-2xl font-bold text-green-600">+12.5%</div>
//                   <div className="text-sm text-muted-foreground">Growth</div>
//                 </div>
//                 <div className="p-4 border rounded-lg">
//                   <div className="text-2xl font-bold">$45,678</div>
//                   <div className="text-sm text-muted-foreground">Revenue</div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Tokens Tab */}
//         <TabsContent value="tokens" className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Design Tokens Export</CardTitle>
//               <CardDescription>
//                 Download tokens in JSON format for import into Figma, Sketch, or other design tools
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="bg-muted p-4 rounded-lg">
//                 <pre className="text-xs overflow-x-auto">
//                   {JSON.stringify(designTokens, null, 2).slice(0, 500)}...
//                 </pre>
//               </div>
//               <div className="flex gap-3">
//                 <Button onClick={downloadTokens}>
//                   <Download className="h-4 w-4 mr-2" />
//                   Download Full Tokens (JSON)
//                 </Button>
//                 <Button
//                   variant="outline"
//                   onClick={() => {
//                     const css = generateCSSVariables();
//                     navigator.clipboard.writeText(css);
//                     toast({ title: "Copied!", description: "CSS variables copied to clipboard" });
//                   }}
//                 >
//                   <Copy className="h-4 w-4 mr-2" />
//                   Copy as CSS Variables
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Integration Guide</CardTitle>
//               <CardDescription>How to use these tokens in other tools</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="space-y-2">
//                 <h4 className="font-semibold">Figma</h4>
//                 <p className="text-sm text-muted-foreground">
//                   1. Install the "Figma Tokens" plugin<br />
//                   2. Import the downloaded JSON file<br />
//                   3. Apply tokens to your designs
//                 </p>
//               </div>

//               <Separator />

//               <div className="space-y-2">
//                 <h4 className="font-semibold">CSS/SCSS</h4>
//                 <p className="text-sm text-muted-foreground">
//                   Copy the CSS variables and paste them into your stylesheet root selector
//                 </p>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }

// // Helper component for color swatches
// function ColorSwatch({
//   name,
//   value,
//   onCopy,
//   copied
// }: {
//   name: string;
//   value: string;
//   onCopy: () => void;
//   copied: boolean;
// }) {
//   return (
//     <div
//       className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
//       onClick={onCopy}
//     >
//       <div
//         className="h-24 w-full"
//         style={{ background: value }}
//       />
//       <div className="p-3 space-y-1">
//         <div className="text-sm font-medium flex items-center justify-between">
//           {name}
//           {copied ? (
//             <Check className="h-3 w-3 text-green-600" />
//           ) : (
//             <Copy className="h-3 w-3 text-muted-foreground" />
//           )}
//         </div>
//         <code className="text-xs text-muted-foreground">{value}</code>
//       </div>
//     </div>
//   );
// }

// // Generate CSS variables from tokens
// function generateCSSVariables(): string {
//   const lines: string[] = [':root {'];

//   // Colors
//   Object.entries(designTokens.colors).forEach(([key, value]) => {
//     if (typeof value === 'string') {
//       lines.push(`  --color-${key}: ${value};`);
//     } else {
//       Object.entries(value).forEach(([subKey, subValue]) => {
//         lines.push(`  --color-${key}-${subKey}: ${subValue};`);
//       });
//     }
//   });

//   // Spacing
//   Object.entries(designTokens.spacing).forEach(([key, value]) => {
//     lines.push(`  --spacing-${key}: ${value};`);
//   });

//   // Border radius
//   Object.entries(designTokens.borderRadius).forEach(([key, value]) => {
//     lines.push(`  --radius-${key}: ${value};`);
//   });

//   lines.push('}');
//   return lines.join('\n');
// }
