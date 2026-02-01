import { Outlet, createRootRoute } from '@tanstack/react-router'
// import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
// import { TanStackDevtools } from '@tanstack/react-devtools'

import LeftSidebar from '../components/layout/LeftSidebar'
import Bottombar from '../components/layout/Bottombar'

export const Route = createRootRoute({
  component: () => (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <LeftSidebar />

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Bar */}
      <Bottombar />

      {/* <TanStackDevtools
        config={{
          position: 'bottom-right',
        }}
        plugins={[
          {
            name: 'Tanstack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      /> */}
    </div>
  ),
})
