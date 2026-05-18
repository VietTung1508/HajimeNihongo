import {configureStore} from '@reduxjs/toolkit'
import sidebarReducer from './slices/sidebar-slice'
import authReducer from './slices/auth-slice'

export const store = configureStore({
  reducer: {
    sidebar: sidebarReducer,
    auth: authReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const selectIsCollapsed = (state: RootState) => state.sidebar.isCollapsed
export const selectUser = (state: RootState) => state.auth.user
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated
