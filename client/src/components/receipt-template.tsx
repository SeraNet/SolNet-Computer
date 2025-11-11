import { forwardRef, useState, useEffect } from "react";
import IconLogoDisplay from "./icon-logo-display";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
interface ReceiptData {
  receiptNumber: string;
  date: string;
  time: string;
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  device: {
    type: string;
    brand: string;
    model: string;
    serialNumber: string;
    service: string;
    problemDescription: string;
    estimatedCost: string;
    taxRate?: number;
    taxAmount?: number;
    totalCost?: number;
    priority: string;
  };
  status: string;
  nextSteps: string;
}
interface ReceiptTemplateProps {
  data: ReceiptData;
  size?: "A6" | "A5" | "A4" | "thermal";
}
const ReceiptTemplate = forwardRef<HTMLDivElement, ReceiptTemplateProps>(
  ({ data, size = "A6" }, ref) => {
    console.log("🎫 ReceiptTemplate size:", size);
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
    const sizeClass =
      size === "thermal"
        ? "max-w-[80mm] p-2 text-[8px]"
        : size === "A6"
        ? "max-w-[380px] p-3 text-[9px]"
        : size === "A5"
        ? "max-w-[560px] p-4 text-[10px]"
        : "max-w-lg p-5 text-[11px]";
    // Generate QR code when component mounts
    useEffect(() => {
      const generateQRCode = async () => {
        const qrData = `Receipt: ${data.receiptNumber}
Customer: ${data.customer.name}
Device: ${data.device.type}
Service: ${data.device.service}
Date: ${data.date}
Status: ${data.status}`;
        try {
          const QRCodeModule = await import("qrcode");
          const QRCode = QRCodeModule.default || QRCodeModule;
          const qrCodeUrl = await QRCode.toDataURL(qrData, {
            width: size === "thermal" ? 40 : 60,
            margin: 1,
            color: {
              dark: "#000000",
              light: "#FFFFFF",
            },
          });
          setQrCodeDataUrl(qrCodeUrl);
        } catch (error) {
          console.error("Failed to generate QR code:", error);
        }
      };
      generateQRCode();
    }, [data, size]);
    return (
      <div ref={ref} className="receipt-print print-visible print-hidden">
        <div
          className={`mx-auto bg-white shadow-sm border border-gray-300 ${sizeClass}`}
        >
          {/* Header */}
          <div className="text-center mb-3 border-b border-gray-300 pb-2">
            <div className="flex justify-center mb-1">
              <div className="text-2xl font-bold text-blue-600">🔧</div>
            </div>
            <h1 className="font-bold text-gray-900 mb-0.5">
              SolNet Computer Services
            </h1>
            <p className="text-gray-600 mb-0.5">
              Professional Computer Repair & Technical Services
            </p>
            <p className="text-gray-500">
              📞 091 334 1664 | 📧 info@solnetcomputer.com
            </p>
            <p className="text-gray-500">Halaba Edget Primary School</p>
          </div>
          {/* Receipt Title */}
          <div className="text-center mb-3">
            <h2 className="font-bold text-gray-900 border-b-2 border-gray-400 pb-1">
              DEVICE REGISTRATION RECEIPT
            </h2>
          </div>
          {/* Receipt Details */}
          <div className="space-y-2 mb-3">
            <div className="flex justify-between">
              <span className="font-medium">Receipt #:</span>
              <span className="font-mono">{data.receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Date:</span>
              <span>{data.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Time:</span>
              <span>{data.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Status:</span>
              <span className="bg-green-100 text-green-800 px-1 rounded text-xs">
                {data.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Priority:</span>
              <span
                className={`px-1 rounded text-xs ${
                  data.device.priority === "urgent"
                    ? "bg-red-100 text-red-800"
                    : data.device.priority === "high"
                    ? "bg-orange-100 text-orange-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {data.device.priority.toUpperCase()}
              </span>
            </div>
          </div>
          {/* Customer Info */}
          <div className="mb-3 border-t border-gray-300 pt-2">
            <h3 className="font-bold text-gray-900 mb-1">CUSTOMER</h3>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{data.customer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-mono">{data.customer.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="text-blue-600">{data.customer.email}</span>
              </div>
            </div>
          </div>
          {/* Device Info */}
          <div className="mb-3 border-t border-gray-300 pt-2">
            <h3 className="font-bold text-gray-900 mb-1">DEVICE</h3>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span>{data.device.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Brand:</span>
                <span>{data.device.brand}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Model:</span>
                <span>{data.device.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Serial #:</span>
                <span className="font-mono text-xs">
                  {data.device.serialNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span>{data.device.service}</span>
              </div>
            </div>
          </div>
          {/* Problem Description */}
          <div className="mb-3 border-t border-gray-300 pt-2">
            <h3 className="font-bold text-gray-900 mb-1">PROBLEM</h3>
            <div className="bg-gray-50 p-2 rounded border">
              <p className="text-gray-700 italic">
                "{data.device.problemDescription}"
              </p>
            </div>
          </div>
          {/* Cost Summary */}
          <div className="mb-3 border-t border-gray-300 pt-2">
            <h3 className="font-bold text-gray-900 mb-1">COST SUMMARY</h3>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Cost:</span>
                <span className="font-semibold">
                  {data.device.estimatedCost || "TBD"}
                </span>
              </div>
              {data.device.taxRate && data.device.taxRate > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Tax ({data.device.taxRate}%):
                  </span>
                  <span>
                    {data.device.taxAmount
                      ? formatCurrency(data.device.taxAmount)
                      : "Calculated"}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-300 pt-1">
                <span className="font-bold">TOTAL:</span>
                <span className="font-bold text-green-600">
                  {data.device.totalCost
                    ? formatCurrency(data.device.totalCost)
                    : data.device.estimatedCost || "TBD"}
                </span>
              </div>
            </div>
          </div>
          {/* Next Steps */}
          <div className="mb-3 border-t border-gray-300 pt-2">
            <h3 className="font-bold text-gray-900 mb-1">NEXT STEPS</h3>
            <div className="bg-blue-50 p-2 rounded border border-blue-200">
              <p className="text-blue-800">{data.nextSteps}</p>
            </div>
          </div>
          {/* Footer */}
          <div className="border-t-2 border-gray-400 pt-2">
            <div className="text-center space-y-1">
              <p className="font-bold text-gray-900">IMPORTANT</p>
              <div className="text-gray-600 space-y-0.5">
                <p>• Keep this receipt for device pickup</p>
                <p>• We'll contact you with updates</p>
                <p>• Pickup: Mon-Sat 9AM-8PM</p>
                <p>• 30-day pickup limit applies</p>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-300">
                <p className="font-bold text-blue-600">
                  Thank you for choosing SolNet!
                </p>
                <p className="text-gray-500">
                  Professional • Reliable • Affordable
                </p>
                {qrCodeDataUrl && (
                  <div className="mt-2 flex justify-center">
                    <img
                      src={qrCodeDataUrl}
                      alt="Receipt QR Code"
                      className={size === "thermal" ? "w-6 h-6" : "w-8 h-8"}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
ReceiptTemplate.displayName = "ReceiptTemplate";
// Demo data for testing different receipt sizes
export const demoReceiptData: ReceiptData = {
  receiptNumber: "RCP-2024-001",
  date: "2024-01-15",
  time: "14:30",
  customer: {
    name: "John Doe",
    phone: "+251 912 345 678",
    email: "john.doe@example.com",
  },
  device: {
    type: "Laptop",
    brand: "Dell",
    model: "Inspiron 15 3000",
    serialNumber: "DL123456789",
    service: "Hardware Repair",
    problemDescription: "Laptop not turning on, suspected power supply issue",
    estimatedCost: "2,500 ETB",
    taxRate: 15,
    taxAmount: 375,
    totalCost: 2875,
    priority: "high",
  },
  status: "Registered",
  nextSteps:
    "Device will be diagnosed within 24 hours. We will contact you with detailed findings and final cost estimate.",
};
// Demo component to showcase different receipt sizes
export function ReceiptTemplateDemo() {
  const [selectedSize, setSelectedSize] = useState<
    "thermal" | "A6" | "A5" | "A4"
  >("thermal");
  return (
    <div className="p-6 space-y-6">
      <div className="flex gap-4 mb-6">
        <Button
          variant={selectedSize === "thermal" ? "default" : "outline"}
          onClick={() => setSelectedSize("thermal")}
        >
          80mm Thermal
        </Button>
        <Button
          variant={selectedSize === "A6" ? "default" : "outline"}
          onClick={() => setSelectedSize("A6")}
        >
          A6 Paper
        </Button>
        <Button
          variant={selectedSize === "A5" ? "default" : "outline"}
          onClick={() => setSelectedSize("A5")}
        >
          A5 Paper
        </Button>
        <Button
          variant={selectedSize === "A4" ? "default" : "outline"}
          onClick={() => setSelectedSize("A4")}
        >
          A4 Paper
        </Button>
      </div>
      <div className="flex justify-center">
        <ReceiptTemplate data={demoReceiptData} size={selectedSize} />
      </div>
      <div className="text-center text-sm text-gray-600">
        <p>Current size: {selectedSize.toUpperCase()}</p>
        <p className="mt-2">
          {selectedSize === "thermal" &&
            "Optimized for 80mm thermal paper printers"}
          {selectedSize === "A6" && "Optimized for A6 paper (105mm × 148mm)"}
          {selectedSize === "A5" && "Optimized for A5 paper (148mm × 210mm)"}
          {selectedSize === "A4" && "Optimized for A4 paper (210mm × 297mm)"}
        </p>
      </div>
    </div>
  );
}
export default ReceiptTemplate;