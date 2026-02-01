import { Store } from '@tanstack/store'
import { useStore } from '@tanstack/react-store'

const STORAGE_KEY = 'sidebar-collapsed'

interface SidebarState {
  isCollapsed: boolean
}

function getInitialState(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'true'
  } catch {
    return false
  }
}

export const sidebarStore = new Store<SidebarState>({
  isCollapsed: getInitialState(),
})

function persistState(collapsed: boolean) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, String(collapsed))
  } catch {
    // Ignore storage errors
  }
}

sidebarStore.subscribe(() => {
  persistState(sidebarStore.state.isCollapsed)
})

export function useSidebarStore() {
  return useStore(sidebarStore)
}

export function toggleSidebar() {
  sidebarStore.setState((state) => ({
    isCollapsed: !state.isCollapsed,
  }))
}

export function setSidebarCollapsed(collapsed: boolean) {
  sidebarStore.setState(() => ({
    isCollapsed: collapsed,
  }))
}
