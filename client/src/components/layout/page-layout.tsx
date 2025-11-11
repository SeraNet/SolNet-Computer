import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface PageLayoutProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * PageLayout - Standardized page structure component
 * 
 * Provides consistent header styling with icon, title, subtitle, and action buttons.
 * Ensures all pages have the same visual hierarchy and spacing.
 * 
 * @example
 * <PageLayout
 *   icon={Users}
 *   title="Customers"
 *   subtitle="Manage your customer relationships"
 *   actions={<Button>Add Customer</Button>}
 * >
 *   <YourPageContent />
 * </PageLayout>
 */
export function PageLayout({
  icon: Icon,
  title,
  subtitle,
  actions,
  children,
  className = "",
}: PageLayoutProps) {
  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 p-6 transition-colors duration-300">
      {/* Professional Page Header */}
      <div className="mb-8 pb-6 border-b border-slate-200/60 dark:border-slate-700/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 animate-fade-in-up">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Icon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-1">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex gap-2 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Page Content */}
      <div className={`space-y-6 ${className}`}>{children}</div>
    </div>
  );
}



