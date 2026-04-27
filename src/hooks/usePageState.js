import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { create } from 'zustand'

// Store para preservar estado das páginas (scroll, dados, etc)
export const usePageStateStore = create((set, get) => ({
  pageStates: {}, // { path: { scroll, timestamp, data } }

  savePageState: (path, state) => {
    set((s) => ({
      pageStates: {
        ...s.pageStates,
        [path]: {
          ...s.pageStates[path],
          ...state,
          timestamp: Date.now(),
        },
      },
    }))
  },

  getPageState: (path) => {
    return get().pageStates[path] || null
  },

  saveScroll: (path, scrollY) => {
    set((s) => ({
      pageStates: {
        ...s.pageStates,
        [path]: {
          ...s.pageStates[path],
          scrollY,
          timestamp: Date.now(),
        },
      },
    }))
  },

  getScroll: (path) => {
    return get().pageStates[path]?.scrollY || 0
  },

  clearPageState: (path) => {
    set((s) => {
      const { [path]: _, ...rest } = s.pageStates
      return { pageStates: rest }
    })
  },

  clearAllPageStates: () => {
    set({ pageStates: {} })
  },
}))

/**
 * Hook para gerenciar preservação de scroll e estado de página
 * Salva scroll position ao sair da página e restaura ao voltar
 */
export const usePageState = () => {
  const location = useLocation()
  const scrollContainerRef = useRef(null)
  const { saveScroll, getScroll, savePageState, getPageState } = usePageStateStore()

  // Salvar scroll position ao mudar de página
  useEffect(() => {
    return () => {
      if (scrollContainerRef.current) {
        saveScroll(location.pathname, scrollContainerRef.current.scrollY)
      }
    }
  }, [location.pathname, saveScroll])

  // Restaurar scroll position ao voltar
  useEffect(() => {
    const scrollY = getScroll(location.pathname)
    if (scrollY > 0 && scrollContainerRef.current) {
      // Aguardar renderização antes de restaurar
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo(0, scrollY)
        }
      })
    }
  }, [location.pathname, getScroll])

  return {
    scrollContainerRef,
    savePageState: (state) => savePageState(location.pathname, state),
    getPageState: () => getPageState(location.pathname),
  }
}
