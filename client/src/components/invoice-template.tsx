import { forwardRef } from "react";

interface InvoiceItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  notes?: string;
}

interface InvoiceTemplateProps {
  data: InvoiceData;
}

const InvoiceTemplate = forwardRef<HTMLDivElement, InvoiceTemplateProps>(
  ({ data }, ref) => {
    return (
      <div ref={ref} className="invoice-print print-visible print-hidden">
        <div className="max-w-4xl mx-auto bg-white p-8 text-sm">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-primary text-white p-3 rounded-lg mr-4">
                  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">LeulNet Computer Services</h1>
                  <p className="text-gray-600">Professional Computer Repair & Sales</p>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p>123 Tech Street, Digital City, DC 12345</p>
                <p>Phone: (555) 123-4567</p>
                <p>Email: info@leulnet.com</p>
                <p>Website: www.leulnet.com</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-bold text-primary mb-2">INVOICE</h2>
              <div className="text-sm">
                <p><span className="font-medium">Invoice #:</span> {data.invoiceNumber}</p>
                <p><span className="font-medium">Date:</span> {data.date}</p>
                <p><span className="font-medium">Status:</span> 
                  <span className={`ml-1 px-2 py-1 rounded text-xs font-medium ${
                    data.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                    data.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {data.paymentStatus.toUpperCase()}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium text-gray-900">{data.customer.name}</p>
                <p className="text-gray-600">{data.customer.phone}</p>
                {data.customer.email && (
                  <p className="text-gray-600">{data.customer.email}</p>
                )}
                {data.customer.address && (
                  <p className="text-gray-600 mt-2">{data.customer.address}</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Details:</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><span className="font-medium">Method:</span> {data.paymentMethod}</p>
                <p><span className="font-medium">Status:</span> {data.paymentStatus}</p>
                <p><span className="font-medium">Due Date:</span> {data.date}</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Item Description</th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold">Qty</th>
                  <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Unit Price</th>
                  <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3">{item.name}</td>
                    <td className="border border-gray-300 px-4 py-3 text-center">{item.quantity}</td>
                    <td className="border border-gray-300 px-4 py-3 text-right">${parseFloat(String(item.unitPrice || "0")).toFixed(2)}</td>
                    <td className="border border-gray-300 px-4 py-3 text-right">${parseFloat(String(item.totalPrice || "0")).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span>Subtotal:</span>
                <span>${parseFloat(String(data.subtotal || "0")).toFixed(2)}</span>
              </div>
              {data.discountAmount > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-200 text-green-600">
                  <span>Discount:</span>
                  <span>-${parseFloat(String(data.discountAmount || "0")).toFixed(2)}</span>
                </div>
              )}
              {data.taxAmount > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span>Tax:</span>
                  <span>${parseFloat(String(data.taxAmount || "0")).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between py-3 border-b-2 border-gray-300 font-bold text-lg">
                <span>Total:</span>
                <span>${parseFloat(String(data.totalAmount || "0")).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {data.notes && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes:</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{data.notes}</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-gray-300 pt-6">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Terms & Conditions:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Payment is due within 30 days of invoice date</li>
                  <li>• Late payments may incur additional charges</li>
                  <li>• All sales are final unless otherwise specified</li>
                  <li>• Warranty terms apply as per service agreement</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Thank You!</h4>
                <p className="text-xs text-gray-600">
                  We appreciate your business. For any questions about this invoice, 
                  please contact us at (555) 123-4567 or info@leulnet.com
                </p>
              </div>
            </div>
            
            <div className="text-center mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                This is a computer-generated invoice and does not require a signature.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

InvoiceTemplate.displayName = "InvoiceTemplate";

export default InvoiceTemplate;
