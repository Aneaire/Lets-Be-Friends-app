import { Outlet, createRootRoute } from '@tanstack/react-router'

import LeftSidebar from '../components/layout/LeftSidebar'
import Bottombar from '../components/layout/Bottombar'

export const Route = createRootRoute({
  component: () => (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <LeftSidebar />

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Bar */}
      <Bottombar />
    </div>
  ),
})
