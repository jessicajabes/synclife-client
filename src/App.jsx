import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { GlobalStyles } from './styles/global-styles'
import { ErrorBoundary } from './components/error-boundary'
import { Layout } from './components/layout'
import { ProtectedRoute } from './routes/protected-route'
import { useUiStore } from './store/ui-store'
import { useAuthStore } from './store/auth-store'

// Pages
import { LoginPage } from './modules/gym/pages/login-page'
import { SignupPage } from './modules/gym/pages/signup-page'
import { HomePage } from './modules/gym/pages/home-page'
import { ExerciseListPage } from './modules/gym/pages/exercise-list-page'
import { ExerciseFormPage } from './modules/gym/pages/exercise-form-page'
import { TemplateListPage } from './modules/gym/pages/template-list-page'
import { TemplateDetailPage } from './modules/gym/pages/template-detail-page'
import { TemplateFormPage } from './modules/gym/pages/template-form-page'
import { PlanSetupPage } from './modules/gym/pages/plan-setup-page'
import { WorkoutDayPage } from './modules/gym/pages/workout-day-page'
import { HistoryPage } from './modules/gym/pages/history-page'
import { SessionEditPage } from './modules/gym/pages/session-edit-page'
import { TemplateHistoryPage } from './modules/gym/pages/template-history-page'
import { ExerciseEvolutionPage } from './modules/gym/pages/exercise-evolution-page'
import { ToastProvider } from './components/toast'

const ComingSoonPage = ({ title, fase }) => (
  <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-secondary)' }}>
    <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: 8 }}>🏗️</span>
    <strong style={{ color: 'var(--text-primary)' }}>{title}</strong>
    <p style={{ marginTop: 4, fontSize: '0.875rem' }}>Chegando na {fase}.</p>
  </div>
)

const OfflineBanner = () => {
  const [offline, setOffline] = useState(!navigator.onLine)
  useEffect(() => {
    const on = () => setOffline(false)
    const off = () => setOffline(true)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])
  if (!offline) return null
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      background: '#92400e', color: '#fef3c7',
      fontSize: '0.8125rem', fontWeight: 600,
      padding: '8px 16px', textAlign: 'center',
    }}>
      Sem conexão — modo offline
    </div>
  )
}

const App = () => {
  const initTheme = useUiStore((s) => s.initTheme)
  const token = useAuthStore((s) => s.token)

  useEffect(() => {
    initTheme()
  }, [initTheme])

  return (
    <ErrorBoundary>
      <GlobalStyles />
      <OfflineBanner />
      <ToastProvider />
      <BrowserRouter>
        <Routes>
          {/* Rotas públicas */}
          <Route
            path="/login"
            element={token ? <Navigate to="/" replace /> : <LoginPage />}
          />
          <Route
            path="/signup"
            element={token ? <Navigate to="/" replace /> : <SignupPage />}
          />

          {/* Rotas protegidas */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/exercises" element={<ExerciseListPage />} />
            <Route path="/exercises/new" element={<ExerciseFormPage />} />
            <Route path="/exercises/:id/edit" element={<ExerciseFormPage />} />
            <Route path="/templates" element={<TemplateListPage />} />
            <Route path="/templates/new" element={<TemplateFormPage />} />
            <Route path="/templates/:id" element={<TemplateDetailPage />} />
            <Route path="/templates/:id/history" element={<TemplateHistoryPage />} />
            <Route path="/templates/:id/edit" element={<TemplateFormPage />} />
            <Route path="/plans/setup" element={<PlanSetupPage />} />
            <Route path="/workout/:sessionId" element={<WorkoutDayPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/history/:sessionId/edit" element={<SessionEditPage />} />
            <Route path="/history/exercise/:exerciseId" element={<ExerciseEvolutionPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
