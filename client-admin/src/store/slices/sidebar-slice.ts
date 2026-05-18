// client-admin/src/store/slices/sidebar-slice.ts
import { createSlice } from '@reduxjs/toolkit'

export const STORAGE_KEY = 'sidebar-collapsed'

interface SidebarState {
  isCollapsed: boolean
}

const initialState: SidebarState = {
  isCollapsed: localStorage.getItem(STORAGE_KEY) === 'true',
}

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isCollapsed = !state.isCollapsed
    },
  },
})

export const { toggleSidebar } = sidebarSlice.actions
export default sidebarSlice.reducer
