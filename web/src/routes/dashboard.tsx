import { createFileRoute } from '@tanstack/react-router'
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import BigCalendar from "@/components/big-calendar"
import { CalendarProvider } from "@/components/event-calendar/calendar-context"

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <CalendarProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-2 pt-0">
            <BigCalendar />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </CalendarProvider>
  )
}