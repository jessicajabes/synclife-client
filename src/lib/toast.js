import { create } from 'zustand'

let _nextId = 1

export const useToastStore = create((set) => ({
  toasts: [],
  add: (item) => {
    const id = _nextId++
    set((s) => ({ toasts: [...s.toasts, { id, ...item }] }))
    return id
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

export const toast = {
  success: (message) => useToastStore.getState().add({ type: 'success', message }),
  error: (message) => useToastStore.getState().add({ type: 'error', message }),
  info: (message) => useToastStore.getState().add({ type: 'info', message }),
}
