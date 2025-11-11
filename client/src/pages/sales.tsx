import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/currency";

function toNumber(value: any): number {
  if (value === undefined || value === null) return 0;
  if (typeof value === "number") return isNaN(value) ? 0 : value;
  if (typeof value === "string") {
    const n = parseFloat(value);
    return isNaN(n) ? 0 : n;
  }
  try {
    const s = String(value);
    const n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  } catch {
    return 0;
  }
}

export default function Sales() {
  const {
    data: sales = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["sales", "all"],
    queryFn: async () => await apiRequest<any[]>("/api/sales"),
  });

  const totalToday = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return sales
      .filter((s: any) =>
        s.createdAt ? new Date(s.createdAt) >= startOfToday : false
      )
      .reduce((sum: number, s: any) => sum + toNumber(s.totalAmount), 0);
  }, [sales]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Recent Sales</h1>
        <p className="mt-1 text-sm text-gray-600">
          View and review recent transactions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-gray-900">
              {isLoading ? "Loading..." : formatCurrency(totalToday)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-gray-900">
              {isLoading ? "—" : sales.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-700">
              {error ? "Failed to load" : "Up to date"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-sm text-gray-600">Loading...</div>
          ) : sales.length === 0 ? (
            <div className="text-sm text-gray-600">No sales found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Total (ETB)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((s: any) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        {s.createdAt
                          ? new Date(s.createdAt).toLocaleString()
                          : "—"}
                      </TableCell>
                      <TableCell className="truncate max-w-[220px]">
                        {s.customerName || "Walk-in"}
                      </TableCell>
                      <TableCell>
                        {typeof s.itemCount === "number"
                          ? s.itemCount
                          : Array.isArray(s.items)
                          ? s.items.length
                          : "—"}
                      </TableCell>
                      <TableCell>{s.paymentMethod || "—"}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(toNumber(s.totalAmount))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
