import api from '../../lib/axios'

// ── Auth ──────────────────────────────────────────────────────────────────────

export const signUp = (data) => api.post('/auth/signup', data)
export const logIn = (data) => api.post('/auth/login', data)
export const getMe = () => api.get('/auth/me')

// ── Muscle Groups ─────────────────────────────────────────────────────────────

export const fetchMuscleGroups = () => api.get('/exercises/muscle-groups')

// ── Exercises ─────────────────────────────────────────────────────────────────

export const fetchExercises = (params) => api.get('/exercises', { params })
export const fetchExercise = (id) => api.get(`/exercises/${id}`)
export const createExercise = (data) => api.post('/exercises', data)
export const updateExercise = (id, data) => api.patch(`/exercises/${id}`, data)
export const deleteExercise = (id) => api.delete(`/exercises/${id}`)

// ── Workout Templates ─────────────────────────────────────────────────────────

export const fetchTemplates = () => api.get('/workout-templates')
export const fetchTemplate = (id) => api.get(`/workout-templates/${id}`)
export const createTemplate = (data) => api.post('/workout-templates', data)
export const updateTemplate = (id, data) => api.patch(`/workout-templates/${id}`, data)
export const deleteTemplate = (id) => api.delete(`/workout-templates/${id}`)

// ── Training Plans ────────────────────────────────────────────────────────────

export const fetchPlans = () => api.get('/training-plans')
export const createPlan = (data) => api.post('/training-plans', data)
export const updatePlan = (id, data) => api.patch(`/training-plans/${id}`, data)
export const deletePlan = (id) => api.delete(`/training-plans/${id}`)

// ── Workout Sessions ──────────────────────────────────────────────────────────

export const fetchInProgressSession = () => api.get('/workout-sessions/in-progress')
export const fetchUnifiedHistory = (params) => api.get('/workout-sessions/history/unified', { params })
export const fetchSessions = (params) => api.get('/workout-sessions', { params })
export const fetchSession = (id) => api.get(`/workout-sessions/${id}`)
export const createSession = (data) => api.post('/workout-sessions', data)
export const updateSession = (id, data) => api.patch(`/workout-sessions/${id}`, data)
export const finishSession = (id, data) => api.post(`/workout-sessions/${id}/finish`, data)
export const discardSession = (id) => api.post(`/workout-sessions/${id}/discard`)
export const deleteSession = (id) => api.delete(`/workout-sessions/${id}`)

// ── Check-in ──────────────────────────────────────────────────────────────────

export const fetchCheckinQuestions = () => api.get('/checkin/questions')
export const searchCheckinQuestions = (q) => api.get('/checkin/questions/search', { params: { q } })
export const createCheckinQuestion = (data) => api.post('/checkin/questions', data)
export const updateCheckinQuestion = (id, data) => api.patch(`/checkin/questions/${id}`, data)
export const activateCheckinQuestion = (id) => api.patch(`/checkin/questions/${id}/activate`)
export const reorderCheckinQuestions = (data) => api.patch('/checkin/questions/reorder', data)
export const deleteCheckinQuestion = (id) => api.delete(`/checkin/questions/${id}`)
export const fetchCheckinEntry = (date) => api.get(`/checkin/entries/${date}`)
export const saveCheckinEntry = (data) => api.post('/checkin/entries', data)
export const deleteCheckinEntry = (id) => api.delete(`/checkin/entries/${id}`)
export const fetchCheckinQuestionEvolution = (id) => api.get(`/checkin/questions/${id}/evolution`)
