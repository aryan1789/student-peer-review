import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import projectsSlice from './slices/projectsSlice'
import uiSlice from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    projects: projectsSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for Supabase auth objects
        ignoredActions: ['auth/setUser'],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['payload.session'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.user'],
      },
    }),
})
