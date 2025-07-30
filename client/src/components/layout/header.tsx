import { Search, Bell, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow-sm border-b border-gray-200">
      <Button
        variant="ghost"
        size="sm"
        className="px-4 border-r border-gray-200 text-gray-500 md:hidden"
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex-1 flex">
          <div className="w-full flex md:ml-0">
            <div className="relative w-full text-gray-400 focus-within:text-gray-600">
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-3">
                <Search className="h-5 w-5" />
              </div>
              <Input
                className="block w-full pl-10 pr-3 py-2 border-transparent bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent"
                placeholder="Search devices, customers, or invoices..."
                type="search"
              />
            </div>
          </div>
        </div>
        
        <div className="ml-4 flex items-center md:ml-6">
          <Button
            variant="ghost"
            size="sm"
            className="p-1 rounded-full text-gray-400 hover:text-gray-500"
          >
            <Bell className="h-6 w-6" />
          </Button>
          
          <div className="ml-3 relative">
            <Button
              variant="ghost"
              size="sm"
              className="p-0 rounded-full"
            >
              <div className="h-8 w-8 rounded-full bg-gray-300"></div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
