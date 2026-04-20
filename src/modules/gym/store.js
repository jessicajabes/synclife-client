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

  // ── Workout Templates ────────────────────────────────────────────────────────
  templates: [],
  templatesLoading: false,
  templatesError: null,

  fetchTemplates: async () => {
    set({ templatesLoading: true, templatesError: null })
    try {
      const { data } = await gymApi.fetchTemplates()
      set({ templates: data.data })
    } catch (err) {
      set({ templatesError: err.response?.data?.message || 'Erro ao carregar templates' })
    } finally {
      set({ templatesLoading: false })
    }
  },

  createTemplate: async (payload) => {
    const { data } = await gymApi.createTemplate(payload)
    set((s) => ({ templates: [...s.templates, data.data].sort((a, b) => a.name.localeCompare(b.name)) }))
    return data.data
  },

  updateTemplate: async (id, payload) => {
    const { data } = await gymApi.updateTemplate(id, payload)
    set((s) => ({ templates: s.templates.map((t) => (t.id === id ? data.data : t)) }))
    return data.data
  },

  deleteTemplate: async (id) => {
    await gymApi.deleteTemplate(id)
    set((s) => ({ templates: s.templates.filter((t) => t.id !== id) }))
  },

  // ── Training Plans ────────────────────────────────────────────────────────────
  plans: [],
  plansLoading: false,
  activePlan: null,

  fetchPlans: async () => {
    set({ plansLoading: true })
    try {
      const { data } = await gymApi.fetchPlans()
      const plans = data.data
      set({ plans, activePlan: plans[0] ?? null })
    } finally {
      set({ plansLoading: false })
    }
  },

  createPlan: async (payload) => {
    const { data } = await gymApi.createPlan(payload)
    const plan = data.data
    set((s) => ({ plans: [plan, ...s.plans], activePlan: plan }))
    return plan
  },

  updatePlan: async (id, payload) => {
    const { data } = await gymApi.updatePlan(id, payload)
    const plan = data.data
    set((s) => ({
      plans: s.plans.map((p) => (p.id === id ? plan : p)),
      activePlan: s.activePlan?.id === id ? plan : s.activePlan,
    }))
    return plan
  },

  deletePlan: async (id) => {
    await gymApi.deletePlan(id)
    set((s) => {
      const plans = s.plans.filter((p) => p.id !== id)
      return { plans, activePlan: plans[0] ?? null }
    })
  },
}))
