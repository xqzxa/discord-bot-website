import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import { DashboardSidebar } from '@/components/dashboard/sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        {/* Top bar */}
        <header className="flex items-center gap-3 h-14 px-4 border-b border-border shrink-0 sticky top-0 bg-background/80 backdrop-blur-md z-10">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          <div className="h-4 w-px bg-border" />
          <span className="text-sm text-muted-foreground">Dashboard</span>
        </header>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
