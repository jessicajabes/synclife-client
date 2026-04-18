import { create } from 'zustand'
import * as gymApi from './api'

export const useGymStore = create((set, get) => ({
  // ── Muscle Groups ────────────────────────────────────────────────────────────
  muscleGroups: [],
  muscleGroupsLoading: false,

  fetchMuscleGroups: async () => {
    if (get().muscleGroups.length > 0) return
    set({ muscleGroupsLoading: true })
    try {
      const { data } = await gymApi.fetchMuscleGroups()
      set({ muscleGroups: data.data })
    } finally {
      set({ muscleGroupsLoading: false })
    }
  },

  // ── Exercises ────────────────────────────────────────────────────────────────
  exercises: [],
  exercisesLoading: false,
  exercisesError: null,

  fetchExercises: async (params) => {
    set({ exercisesLoading: true, exercisesError: null })
    try {
      const { data } = await gymApi.fetchExercises(params)
      set({ exercises: data.data })
    } catch (err) {
      set({ exercisesError: err.response?.data?.message || 'Erro ao carregar exercícios' })
    } finally {
      set({ exercisesLoading: false })
    }
  },

  createExercise: async (payload) => {
    const { data } = await gymApi.createExercise(payload)
    set((s) => ({ exercises: [...s.exercises, data.data].sort((a, b) => a.name.localeCompare(b.name)) }))
    return data.data
  },

  updateExercise: async (id, payload) => {
    const { data } = await gymApi.updateExercise(id, payload)
    set((s) => ({
      exercises: s.exercises.map((e) => (e.id === id ? data.data : e)),
    }))
    return data.data
  },

  deleteExercise: async (id) => {
    await gymApi.deleteExercise(id)
    set((s) => ({ exercises: s.exercises.filter((e) => e.id !== id) }))
  },
}))
