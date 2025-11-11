import { Search, Settings, User, LogOut, Bell, Command } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { SearchResults } from "@/components/search-results";
import { NotificationDropdown } from "@/components/notification-dropdown";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export default function Header() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch user details to get current profile picture
  const { data: userDetails } = useQuery({
    queryKey: ["user", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      return await apiRequest(`/api/users/${user.id}`, "GET");
    },
    enabled: !!user?.id,
  });

  // Search query with debouncing
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["global-search", searchQuery],
    queryFn: () =>
      apiRequest(`/api/search?q=${encodeURIComponent(searchQuery)}`, "GET"),
    enabled: searchQuery.length >= 2,
    staleTime: 30000, // 30 seconds
  });

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Show results when search query changes
  useEffect(() => {
    if (searchQuery.length >= 2) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [searchQuery]);

  // Keyboard shortcut to focus search (Ctrl/Cmd + K)
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        const searchInput = searchRef.current?.querySelector("input");
        if (searchInput) {
          searchInput.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const getUserInitials = () => {
    const firstName = userDetails?.firstName || user?.firstName;
    const lastName = userDetails?.lastName || user?.lastName;

    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return user?.username?.slice(0, 2).toUpperCase() || "U";
  };


  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 shadow-md dark:shadow-slate-950/50 transition-colors duration-300">
      <div className="flex h-full items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative" ref={searchRef}>
            <div
              className={cn(
                "relative flex items-center transition-all duration-200",
                isSearchFocused && "scale-105"
              )}
            >
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500 z-10" />
              <Input
                placeholder="Search devices, customers, brands, models..."
                className={cn(
                  "w-80 h-11 pl-11 pr-20 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-400 dark:focus:border-blue-600 transition-all duration-200",
                  isSearchFocused && "shadow-lg ring-4 ring-blue-500/10 dark:ring-blue-400/10"
                )}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  setIsSearchFocused(true);
                  searchQuery.length >= 2 && setShowResults(true);
                }}
                onBlur={() => setIsSearchFocused(false)}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 font-mono text-[11px] font-bold text-slate-600 dark:text-slate-400 shadow-sm">
                  <Command className="h-3 w-3" />
                  <span>K</span>
                </kbd>
              </div>
            </div>

            {showResults && (
              <SearchResults
                results={
                  searchResults || {
                    devices: [],
                    customers: [],
                    sales: [],
                    inventory: [],
                    brands: [],
                    models: [],
                    accessories: [],
                    serviceTypes: [],
                    totalResults: 0,
                  }
                }
                onClose={() => setShowResults(false)}
                onClearSearch={() => setSearchQuery("")}
                isLoading={isSearching}
              />
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Notification Dropdown */}
          <NotificationDropdown />

          {/* User Profile Dropdown - Enhanced */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-3 px-3 py-2 h-auto rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-950/30 dark:hover:to-indigo-950/30 transition-all duration-200 hover:shadow-md border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
              >
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {userDetails?.firstName ||
                      user?.firstName ||
                      user?.username}
                  </span>
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-bold",
                      user?.role === "admin" 
                        ? "bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-sm" 
                        : user?.role === "technician"
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm"
                        : user?.role === "sales"
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    {user?.role?.toUpperCase()}
                  </span>
                </div>
                <div className="relative">
                  <Avatar className="h-10 w-10 ring-2 ring-blue-500/20 dark:ring-blue-400/30 shadow-md">
                    <AvatarImage
                      src={
                        userDetails?.profilePicture || user?.profilePicture
                          ? `${
                              userDetails?.profilePicture ||
                              user?.profilePicture
                            }?t=${Date.now()}`
                          : undefined
                      }
                      alt={
                        userDetails?.firstName ||
                        user?.firstName ||
                        user?.username
                      }
                    />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-base">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 shadow-md"></div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 p-0 border-0 shadow-2xl rounded-2xl overflow-hidden bg-white dark:bg-slate-900"
            >
              {/* Enhanced Profile Header with Gradient */}
              <div className="relative bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 p-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative flex items-center gap-4">
                  <Avatar className="h-16 w-16 ring-4 ring-white/30 shadow-xl">
                    <AvatarImage
                      src={
                        userDetails?.profilePicture || user?.profilePicture
                          ? `${
                              userDetails?.profilePicture ||
                              user?.profilePicture
                            }?t=${Date.now()}`
                          : undefined
                      }
                      alt={
                        userDetails?.firstName ||
                        user?.firstName ||
                        user?.username
                      }
                    />
                    <AvatarFallback className="bg-white text-blue-600 font-bold text-2xl">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold text-white truncate">
                      {userDetails?.firstName || user?.firstName}{" "}
                      {userDetails?.lastName || user?.lastName || user?.username}
                    </p>
                    {(userDetails?.email || user?.email) && (
                      <p className="text-sm text-white/80 truncate">
                        {userDetails?.email || user?.email}
                      </p>
                    )}
                    <div className="mt-2 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs font-bold text-white uppercase tracking-wide">
                        {user?.role || "User"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">

                {user?.role === "admin" && (
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
                        <Settings className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">Settings</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">System configuration</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link
                    href={
                      user?.role === "admin"
                        ? "/owner-profile"
                        : "/worker-profile"
                    }
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">My Profile</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">View and edit profile</p>
                    </div>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-2" />
                
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer mx-2 mb-2"
                >
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-all w-full">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400">
                      <LogOut className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-red-600 dark:text-red-400">Sign Out</p>
                      <p className="text-xs text-red-600/70 dark:text-red-400/70">End your session</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
