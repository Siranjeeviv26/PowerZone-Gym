import { createSlice } from '@reduxjs/toolkit'

const appSlice = createSlice({
  name: 'app',
  initialState: {
    mobileMenuOpen: false,
    theme: 'dark',
  },
  reducers: {
    toggleMobileMenu(state) {
      state.mobileMenuOpen = !state.mobileMenuOpen
    },
    closeMobileMenu(state) {
      state.mobileMenuOpen = false
    },
  },
})

export const { toggleMobileMenu, closeMobileMenu } = appSlice.actions
export default appSlice.reducer
