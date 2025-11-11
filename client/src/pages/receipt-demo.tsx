import { ReceiptTemplateDemo } from "@/components/receipt-template";

export default function ReceiptDemo() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Receipt Template Demo
          </h1>
          <p className="text-gray-600">
            Test the new tabular receipt layout optimized for different paper
            sizes
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg">
          <ReceiptTemplateDemo />
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Key Improvements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Tabular Layout</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Information organized in clear tables</li>
                <li>• Better space utilization</li>
                <li>• Easier to scan and read</li>
                <li>• Professional appearance</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Size Optimization
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 80mm thermal paper support</li>
                <li>• A6 paper compatibility</li>
                <li>• Responsive font sizes</li>
                <li>• Optimized spacing</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Print Optimization
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Enhanced print styles</li>
                <li>• Better table formatting</li>
                <li>• Improved readability</li>
                <li>• Consistent spacing</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                User Experience
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Faster information scanning</li>
                <li>• Reduced paper usage</li>
                <li>• Standard receipt format</li>
                <li>• Better customer experience</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
