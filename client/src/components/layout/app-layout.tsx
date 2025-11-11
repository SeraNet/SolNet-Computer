import Sidebar from "./sidebar";
import Header from "./header";
import { useAppearance } from "@/lib/appearance";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { appearance } = useAppearance();
  const isRightSidebar = appearance.sidebarPosition === "right";
  const isMobile = useIsMobile();

  return (
    <div
      className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300"
      style={{
        direction: isRightSidebar
          ? ("rtl" as React.CSSProperties["direction"])
          : ("ltr" as React.CSSProperties["direction"]),
      }}
    >
      <Sidebar />
      <div 
        className="flex flex-col flex-1 min-w-0 transition-all duration-300"
        style={{
          marginLeft: isMobile ? '0' : 'var(--sidebar-width, 18rem)',
        }}
      >
        <Header />
        <main
          style={{
            flex: "1",
            padding:
              appearance.density === "compact"
                ? "12px"
                : appearance.density === "spacious"
                ? "28px"
                : "20px",
            overflowY: "auto",
          }}
          className={appearance.compactMode ? "space-y-4" : "content-spacing"}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
