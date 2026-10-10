import { Outlet } from 'react-router-dom'
import { DashboardSidebar } from './DashboardSidebar'
import { DashboardTopBar } from './DashboardTopBar'
import { ErrorBoundary } from './ErrorBoundary'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[#EDF0EE] text-[#101d26] flex font-sans selection:bg-[#005459]/15 selection:text-[#005459]">

      {/* 1. Sidebar Navigation */}
      <DashboardSidebar />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopBar />

        <main className="flex-1 p-8 max-w-[1600px] w-full mx-auto">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
