import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
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

const ComingSoonPage = ({ title, fase }) => (
  <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-secondary)' }}>
    <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: 8 }}>🏗️</span>
    <strong style={{ color: 'var(--text-primary)' }}>{title}</strong>
    <p style={{ marginTop: 4, fontSize: '0.875rem' }}>Chegando na {fase}.</p>
  </div>
)

const App = () => {
  const initTheme = useUiStore((s) => s.initTheme)
  const token = useAuthStore((s) => s.token)

  useEffect(() => {
    initTheme()
  }, [])

  return (
    <ErrorBoundary>
      <GlobalStyles />
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
            <Route path="/templates" element={<ComingSoonPage title="Templates de Treino" fase="Fase 4" />} />
            <Route path="/history" element={<ComingSoonPage title="Histórico" fase="Fase 6" />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
