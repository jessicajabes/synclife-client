import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { create } from 'zustand'

// Store para rastrear histórico de navegação
export const useNavigationStore = create((set, get) => ({
  history: [],
  previousPath: null,

  addToHistory: (path) => {
    set((state) => {
      const newHistory = [...state.history]
      // Se já está no histórico, move para o final (reordenar)
      const idx = newHistory.indexOf(path)
      if (idx !== -1) {
        newHistory.splice(idx, 1)
      }
      newHistory.push(path)
      // Manter apenas últimas 20 rotas
      return { history: newHistory.slice(-20), previousPath: state.history[state.history.length - 1] }
    })
  },

  getPreviousPath: () => {
    const history = get().history
    return history.length >= 2 ? history[history.length - 2] : null
  },

  canGoBack: () => {
    const history = get().history
    return history.length >= 2
  },

  goBack: (defaultPath = '/') => {
    const prevPath = get().getPreviousPath()
    return prevPath || defaultPath
  },

  clearHistory: () => {
    set({ history: [], previousPath: null })
  },
}))

/**
 * Hook para rastrear navegação e permitir voltar para página anterior
 * Automaticamente registra o caminho atual no histórico
 */
export const useNavigationHistory = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { addToHistory, getPreviousPath, canGoBack, goBack } = useNavigationStore()

  // Registrar caminho atual no histórico
  useEffect(() => {
    addToHistory(location.pathname)
  }, [location.pathname, addToHistory])

  return {
    previousPath: getPreviousPath(),
    canGoBack: canGoBack(),
    goBack: () => {
      const prevPath = goBack()
      navigate(prevPath)
    },
  }
}
