import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DeviceRegistration() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Device Registration</h1>
        <p className="mt-1 text-sm text-gray-600">Register new devices for repair services</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Device registration functionality will be available soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
