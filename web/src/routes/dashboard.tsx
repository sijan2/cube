import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useAuth } from '@/providers/auth-provider'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import BigCalendar from '@/components/big-calendar'
import { CalendarProvider } from '@/components/event-calendar/calendar-context'
import { RightPanelChat } from '@/components/right-panel-chat'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { session, isSessionLoading } = useAuth()

  // No loaders/spinners; just wait silently while session loads
  if (isSessionLoading) return null

  if (!session?.user) {
    return <Navigate to="/login" />
  }

  return (
    <CalendarProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="relative flex flex-1 flex-col gap-4 p-2 pt-0 pb-0">
            <BigCalendar />
            {/* Right-side chat panel */}
            <RightPanelChat />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </CalendarProvider>
  )
}