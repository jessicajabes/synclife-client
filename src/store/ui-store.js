import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const applyTheme = (theme) => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const resolved = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme
  document.documentElement.setAttribute('data-theme', resolved)
}

export const useUiStore = create(
  persist(
    (set, get) => ({
      theme: 'system',

      setTheme: (theme) => {
        applyTheme(theme)
        set({ theme })
      },

      initTheme: () => {
        applyTheme(get().theme)
      },
    }),
    { name: 'synclife-ui' }
  )
)
