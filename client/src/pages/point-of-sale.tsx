import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import POSModal from "@/components/pos-modal";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

export default function PointOfSale() {
  const [showPOSModal, setShowPOSModal] = useState(false);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Point of Sale</h1>
        <p className="mt-1 text-sm text-gray-600">Process sales and manage transactions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Terminal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <ShoppingCart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-600 mb-4">Click below to open the sales terminal</p>
            <Button onClick={() => setShowPOSModal(true)} size="lg">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Open POS Terminal
            </Button>
          </div>
        </CardContent>
      </Card>

      <POSModal open={showPOSModal} onOpenChange={setShowPOSModal} />
    </div>
  );
}
