import { forwardRef } from "react";

interface ReceiptData {
  receiptNumber: string;
  date: string;
  customer: string;
  device: {
    type: string;
    brand: string;
    model: string;
    service: string;
  };
}

interface ReceiptTemplateProps {
  data: ReceiptData;
}

const ReceiptTemplate = forwardRef<HTMLDivElement, ReceiptTemplateProps>(
  ({ data }, ref) => {
    return (
      <div ref={ref} className="receipt-print print-visible print-hidden">
        <div className="max-w-sm mx-auto bg-white p-6 text-sm font-mono">
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold">LeulNet Computer Services</h2>
            <p className="text-xs text-gray-600">Professional Computer Repair & Sales</p>
            <p className="text-xs text-gray-600">Phone: (555) 123-4567</p>
            <div className="border-t border-gray-300 my-2"></div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between">
              <span>Receipt #:</span>
              <span>{data.receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{data.date}</span>
            </div>
            <div className="flex justify-between">
              <span>Customer:</span>
              <span>{data.customer}</span>
            </div>
          </div>

          <div className="border-t border-gray-300 py-2">
            <div className="font-semibold mb-2">Device Registration</div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Device:</span>
                <span>{data.device.type}</span>
              </div>
              <div className="flex justify-between">
                <span>Brand:</span>
                <span>{data.device.brand}</span>
              </div>
              <div className="flex justify-between">
                <span>Model:</span>
                <span>{data.device.model}</span>
              </div>
              <div className="flex justify-between">
                <span>Service:</span>
                <span>{data.device.service}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-300 py-2">
            <div className="text-center text-xs text-gray-600">
              <p>Thank you for choosing LeulNet!</p>
              <p>Your device will be ready in 2-3 business days</p>
              <p>Keep this receipt for device pickup</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ReceiptTemplate.displayName = "ReceiptTemplate";

export default ReceiptTemplate;
