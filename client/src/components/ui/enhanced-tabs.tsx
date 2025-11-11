import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface EnhancedTab {
  value: string;
  label: string;
  icon?: LucideIcon;
  content: ReactNode;
  badge?: string | number;
}

interface EnhancedTabsProps {
  tabs: EnhancedTab[];
  defaultValue?: string;
  className?: string;
  onTabChange?: (value: string) => void;
}

/**
 * EnhancedTabs - Standardized tab component with beautiful gradient styling
 * 
 * Provides consistent tab navigation with:
 * - Gradient active states
 * - Optional icons
 * - Optional badges
 * - Smooth transitions
 * - Glass morphism background
 * 
 * @example
 * const tabs = [
 *   { value: "all", label: "All Items", icon: Package, content: <AllItems /> },
 *   { value: "active", label: "Active", icon: CheckCircle, badge: 5, content: <ActiveItems /> }
 * ];
 * 
 * <EnhancedTabs tabs={tabs} defaultValue="all" />
 */
export function EnhancedTabs({
  tabs,
  defaultValue,
  className = "",
  onTabChange,
}: EnhancedTabsProps) {
  return (
    <div
      className={`bg-white dark:bg-slate-900 border-0 rounded-2xl shadow-lg dark:shadow-slate-900/50 overflow-hidden animate-fade-in-up transition-colors duration-300 ${className}`}
    >
      <Tabs
        defaultValue={defaultValue || tabs[0]?.value}
        onValueChange={onTabChange}
      >
        {/* Professional Tab List Header with Dark Mode */}
        <div className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 px-6 py-4 transition-colors duration-300">
          <TabsList className="inline-flex gap-2 bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-1.5 transition-colors duration-300">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 
                    font-medium text-slate-600 dark:text-slate-400
                    data-[state=active]:bg-gradient-to-r 
                    data-[state=active]:from-blue-500 
                    data-[state=active]:to-blue-600 
                    data-[state=active]:text-white 
                    data-[state=active]:shadow-md 
                    data-[state=active]:shadow-blue-500/30
                    hover:bg-white dark:hover:bg-slate-800
                    hover:text-slate-900 dark:hover:text-slate-100
                    data-[state=active]:hover:from-blue-600 
                    data-[state=active]:hover:to-blue-700
                    data-[state=active]:scale-105
                    relative"
                >
                  {IconComponent && (
                    <IconComponent className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                  )}
                  <span className="font-semibold">{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className="ml-1.5 px-2 py-0.5 text-xs font-bold rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 data-[state=active]:bg-white/30 data-[state=active]:text-white">
                      {tab.badge}
                    </span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* Tab Content with Professional Styling and Dark Mode */}
        {tabs.map((tab, index) => (
          <TabsContent 
            key={tab.value} 
            value={tab.value} 
            className="p-6 animate-fade-in-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}


