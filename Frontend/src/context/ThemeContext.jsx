import { createContext, useContext, useEffect, useState } from 'react'
import api from '../utils/api'

const ThemeContext = createContext(null)

const DEFAULT_THEME = {
  primary: '#e63946',
  primaryDark: '#c1121f',
  primaryLight: '#ff6b6b',
  secondary: '#f4a261',
}

function hexToRgbChannels(hex) {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `${r} ${g} ${b}`
}

function applyTheme(theme) {
  const root = document.documentElement
  root.style.setProperty('--color-primary', hexToRgbChannels(theme.primary || DEFAULT_THEME.primary))
  root.style.setProperty('--color-primary-dark', hexToRgbChannels(theme.primaryDark || DEFAULT_THEME.primaryDark))
  root.style.setProperty('--color-primary-light', hexToRgbChannels(theme.primaryLight || DEFAULT_THEME.primaryLight))
  root.style.setProperty('--color-secondary', hexToRgbChannels(theme.secondary || DEFAULT_THEME.secondary))
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(DEFAULT_THEME)

  useEffect(() => {
    api.get('/site-content/theme').then(({ data }) => {
      if (data.data && Object.keys(data.data).length > 0) {
        const t = { ...DEFAULT_THEME, ...data.data }
        setTheme(t)
        applyTheme(t)
      }
    }).catch(() => {})
  }, [])

  const updateTheme = (newTheme) => {
    const t = { ...DEFAULT_THEME, ...newTheme }
    setTheme(t)
    applyTheme(t)
  }

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
