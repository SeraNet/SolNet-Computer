import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImportExportControls } from "@/components/import-export";
import { PageLayout } from "@/components/layout/page-layout";
import {
  Users,
  Package,
  Smartphone,
  Settings,
  Info,
  AlertTriangle,
  CheckCircle,
  Download,
  Upload,
  FileDown,
  FileUp,
} from "lucide-react";

export default function ImportExportManagement() {
  const [activeTab, setActiveTab] = useState("customers");

  const entities = [
    {
      id: "customers",
      name: "Customers",
      icon: Users,
      description:
        "Import/export customer information including contact details and notes",
      fields: [
        { name: "name", required: true, description: "Customer full name" },
        {
          name: "email",
          required: false,
          description: "Email address (optional)",
        },
        { name: "phone", required: true, description: "Phone number (unique)" },
        {
          name: "address",
          required: false,
          description: "Physical address (optional)",
        },
        {
          name: "notes",
          required: false,
          description: "Additional notes (optional)",
        },
        {
          name: "registrationDate",
          required: false,
          description:
            "Date when customer first attended the shop (YYYY-MM-DD format, defaults to current date)",
        },
      ],
      systemFields: ["id", "locationId", "createdAt", "updatedAt"],
      tips: [
        "Phone numbers must be unique across all customers",
        "Email addresses are optional but recommended for notifications",
        "Registration date should be the date when customer first attended the shop",
        "If registration date is not provided, current date will be used",
        "System will automatically assign location based on your account",
      ],
    },
    {
      id: "inventory",
      name: "Inventory",
      icon: Package,
      description:
        "Import/export inventory items with pricing and stock management",
      fields: [
        { name: "name", required: true, description: "Item name" },
        {
          name: "sku",
          required: true,
          description: "Stock Keeping Unit (unique)",
        },
        {
          name: "description",
          required: false,
          description: "Item description (optional)",
        },
        {
          name: "category",
          required: false,
          description: "Item category (optional)",
        },
        {
          name: "purchasePrice",
          required: false,
          description: "Cost price (optional)",
        },
        { name: "salePrice", required: true, description: "Selling price" },
        {
          name: "quantity",
          required: true,
          description: "Current stock quantity",
        },
        {
          name: "minStockLevel",
          required: false,
          description: "Minimum stock level (default: 10)",
        },
        {
          name: "reorderPoint",
          required: false,
          description: "Reorder point (default: 15)",
        },
        {
          name: "reorderQuantity",
          required: false,
          description: "Reorder quantity (default: 50)",
        },
        {
          name: "leadTimeDays",
          required: false,
          description: "Supplier lead time in days (optional)",
        },
        {
          name: "supplier",
          required: false,
          description: "Supplier name (optional)",
        },
        { name: "barcode", required: false, description: "Barcode (optional)" },
      ],
      systemFields: [
        "id",
        "locationId",
        "isActive",
        "lastRestocked",
        "predictedStockout",
        "avgDailySales",
        "createdAt",
        "updatedAt",
      ],
      tips: [
        "SKU must be unique across all inventory items",
        "Sale price is required and must be greater than 0",
        "System will automatically calculate stock predictions",
        "Use the template to ensure correct data format",
      ],
    },
    {
      id: "devices",
      name: "Device Registration",
      icon: Smartphone,
      description:
        "Import/export device repair registrations and service records",
      fields: [
        {
          name: "customerId",
          required: true,
          description: "Customer UUID (must exist in system)",
        },
        {
          name: "deviceTypeId",
          required: false,
          description: "Device type UUID (optional)",
        },
        {
          name: "brandId",
          required: false,
          description: "Brand UUID (optional)",
        },
        {
          name: "modelId",
          required: false,
          description: "Model UUID (optional)",
        },
        {
          name: "serialNumber",
          required: false,
          description: "Device serial number (optional)",
        },
        {
          name: "problemDescription",
          required: true,
          description: "Description of the problem",
        },
        {
          name: "serviceTypeId",
          required: false,
          description: "Service type UUID (optional)",
        },
        {
          name: "status",
          required: false,
          description: "Device status (default: registered)",
        },
        {
          name: "priority",
          required: false,
          description: "Priority level (default: normal)",
        },
        {
          name: "estimatedCompletionDate",
          required: false,
          description: "Estimated completion date (YYYY-MM-DD)",
        },
        {
          name: "technicianNotes",
          required: false,
          description: "Internal technician notes (optional)",
        },
        {
          name: "customerNotes",
          required: false,
          description: "Customer notes (optional)",
        },
        {
          name: "totalCost",
          required: false,
          description: "Total repair cost (optional)",
        },
        {
          name: "paymentStatus",
          required: false,
          description: "Payment status (default: pending)",
        },
      ],
      systemFields: [
        "id",
        "receiptNumber",
        "locationId",
        "createdBy",
        "assignedTo",
        "feedbackRequested",
        "feedbackSubmitted",
        "createdAt",
        "updatedAt",
      ],
      tips: [
        "Customer ID must reference an existing customer in the system",
        "Device type, brand, and model IDs must exist in service management",
        "Receipt numbers are automatically generated by the system",
        "Status options: registered, diagnosed, in_progress, waiting_parts, completed, ready_for_pickup, delivered, cancelled",
        "Priority options: normal, high, urgent",
        "Payment status options: pending, paid, partial, refunded",
      ],
    },
    {
      id: "service-types",
      name: "Service Types",
      icon: Settings,
      description: "Import/export service types with pricing and features",
      fields: [
        { name: "name", required: true, description: "Service type name" },
        {
          name: "description",
          required: false,
          description: "Service description (optional)",
        },
        {
          name: "category",
          required: false,
          description: "Service category (default: General)",
        },
        {
          name: "estimatedDuration",
          required: false,
          description: "Estimated duration in minutes (optional)",
        },
        {
          name: "basePrice",
          required: false,
          description: "Base price for the service (optional)",
        },
        {
          name: "isPublic",
          required: false,
          description: "Show on public page (default: true)",
        },
        {
          name: "features",
          required: false,
          description: "Features array as JSON (optional)",
        },
        {
          name: "requirements",
          required: false,
          description: "Requirements array as JSON (optional)",
        },
        {
          name: "warranty",
          required: false,
          description: "Warranty information (optional)",
        },
        {
          name: "imageUrl",
          required: false,
          description: "Image URL (optional)",
        },
        {
          name: "isActive",
          required: false,
          description: "Active status (default: true)",
        },
        {
          name: "sortOrder",
          required: false,
          description: "Sort order (default: 0)",
        },
      ],
      systemFields: ["id", "createdAt", "updatedAt"],
      tips: [
        "Service type names must be unique",
        "Features and requirements should be JSON arrays",
        "Base price should be a decimal number",
        "Use the template to ensure correct data format",
      ],
    },
    {
      id: "brands",
      name: "Brands",
      icon: Settings,
      description: "Import/export device brands and manufacturers",
      fields: [
        { name: "name", required: true, description: "Brand name" },
        {
          name: "description",
          required: false,
          description: "Brand description (optional)",
        },
        {
          name: "website",
          required: false,
          description: "Brand website URL (optional)",
        },
        {
          name: "isActive",
          required: false,
          description: "Active status (default: true)",
        },
      ],
      systemFields: ["id", "createdAt"],
      tips: [
        "Brand names must be unique",
        "Website URLs should be valid format",
        "Use the template to ensure correct data format",
      ],
    },
    {
      id: "device-types",
      name: "Device Types",
      icon: Settings,
      description: "Import/export device type categories",
      fields: [
        { name: "name", required: true, description: "Device type name" },
        {
          name: "description",
          required: false,
          description: "Device type description (optional)",
        },
        {
          name: "isActive",
          required: false,
          description: "Active status (default: true)",
        },
      ],
      systemFields: ["id", "createdAt"],
      tips: [
        "Device type names must be unique",
        "Use the template to ensure correct data format",
      ],
    },
    {
      id: "models",
      name: "Models",
      icon: Settings,
      description: "Import/export device models linked to brands and types",
      fields: [
        { name: "name", required: true, description: "Model name" },
        {
          name: "brandId",
          required: true,
          description: "Brand UUID (must exist in system)",
        },
        {
          name: "deviceTypeId",
          required: true,
          description: "Device type UUID (must exist in system)",
        },
        {
          name: "description",
          required: false,
          description: "Model description (optional)",
        },
        {
          name: "specifications",
          required: false,
          description: "Model specifications (optional)",
        },
        {
          name: "releaseYear",
          required: false,
          description: "Release year (optional)",
        },
        {
          name: "isActive",
          required: false,
          description: "Active status (default: true)",
        },
      ],
      systemFields: ["id", "createdAt"],
      tips: [
        "Brand ID and Device Type ID must reference existing records",
        "Import order: Device Types → Brands → Models",
        "Use the template to ensure correct data format",
      ],
    },
    {
      id: "accessories",
      name: "Accessories",
      icon: Settings,
      description: "Import/export parts and accessories for sale",
      fields: [
        { name: "name", required: true, description: "Accessory name" },
        {
          name: "sku",
          required: true,
          description: "Stock Keeping Unit (unique)",
        },
        {
          name: "description",
          required: false,
          description: "Accessory description (optional)",
        },
        {
          name: "category",
          required: false,
          description: "Category (default: General)",
        },
        {
          name: "brand",
          required: false,
          description: "Brand name (optional)",
        },
        {
          name: "model",
          required: false,
          description: "Model name (optional)",
        },
        {
          name: "purchasePrice",
          required: false,
          description: "Cost price (optional)",
        },
        { name: "salePrice", required: true, description: "Selling price" },
        {
          name: "quantity",
          required: true,
          description: "Current stock quantity",
        },
        {
          name: "minStockLevel",
          required: false,
          description: "Minimum stock level (default: 5)",
        },
        {
          name: "reorderPoint",
          required: false,
          description: "Reorder point (default: 10)",
        },
        {
          name: "reorderQuantity",
          required: false,
          description: "Reorder quantity (default: 20)",
        },
        {
          name: "isPublic",
          required: false,
          description: "Show on public page (default: true)",
        },
        {
          name: "isActive",
          required: false,
          description: "Active status (default: true)",
        },
        {
          name: "sortOrder",
          required: false,
          description: "Sort order (default: 0)",
        },
        {
          name: "imageUrl",
          required: false,
          description: "Image URL (optional)",
        },
        {
          name: "specifications",
          required: false,
          description: "Specifications as JSON (optional)",
        },
        {
          name: "compatibility",
          required: false,
          description: "Compatibility as JSON array (optional)",
        },
        {
          name: "warranty",
          required: false,
          description: "Warranty information (optional)",
        },
      ],
      systemFields: ["id", "createdAt", "updatedAt"],
      tips: [
        "SKU must be unique across all accessories",
        "Sale price is required and must be greater than 0",
        "Specifications and compatibility should be JSON format",
        "Use the template to ensure correct data format",
      ],
    },
  ];

  const currentEntity = entities.find((e) => e.id === activeTab);

  return (
    <PageLayout
      title="Import/Export Management"
      subtitle="Manage data import and export operations for all system entities"
      icon={FileDown}
    >
      <Card className="card-elevated mb-6">
        <CardContent className="p-6">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-8 h-auto p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          {entities.map((entity) => (
            <TabsTrigger
              key={entity.id}
              value={entity.id}
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm py-3 px-2 rounded-md text-xs sm:text-sm"
            >
              <entity.icon className="h-4 w-4" />
              <span className="hidden lg:inline">{entity.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {entities.map((entity) => (
          <TabsContent key={entity.id} value={entity.id} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Controls */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="card-elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                      <entity.icon className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                      {entity.name} Import/Export
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      {entity.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ImportExportControls entity={entity.id as any} />
                  </CardContent>
                </Card>

                {/* Field Information */}
                <Card className="card-elevated">
                  <CardHeader>
                    <CardTitle className="text-slate-900 dark:text-slate-100">Required Fields</CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      Fields that must be included in your import file
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {entity.fields?.map((field) => (
                        <div
                          key={field.name}
                          className="flex items-start gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-900 dark:text-slate-100">{field.name}</span>
                              {field.required && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  Required
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              {field.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* System Fields */}
                <Card className="card-elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                      <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      System-Generated Fields
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      These fields are automatically handled by the system and
                      should not be included in import files
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {entity.systemFields?.map((field) => (
                        <div
                          key={field}
                          className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg"
                        >
                          <div className="p-1.5 bg-purple-600 dark:bg-purple-500 rounded">
                            <Settings className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-sm font-medium text-purple-900 dark:text-purple-300">
                            {field}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tips and Instructions */}
              <div className="space-y-6">
                <Card className="card-elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      Import Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {entity.tips?.map((tip, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
                        >
                          <div className="w-1.5 h-1.5 bg-green-600 dark:bg-green-400 rounded-full mt-2 flex-shrink-0" />
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                      <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      Important Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-600 dark:bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                        <span>
                          Always use the provided template for correct
                          formatting
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-600 dark:bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                        <span>
                          Large imports may take several minutes to complete
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-600 dark:bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                        <span>
                          Check import results for any errors or warnings
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-600 dark:bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                        <span>Backup your data before large imports</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {entity.id === "service-management" && (
                  <Card className="card-elevated">
                    <CardHeader>
                      <CardTitle className="text-slate-900 dark:text-slate-100">Import Order</CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-400">
                        For service management, import in this order:
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">1</Badge>
                          <span>Device Types</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">2</Badge>
                          <span>Brands</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">3</Badge>
                          <span>Models (requires Brand & Device Type IDs)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">4</Badge>
                          <span>Service Types</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">5</Badge>
                          <span>Accessories</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
