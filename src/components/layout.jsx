import { NavLink, Outlet } from 'react-router-dom'
import styled from 'styled-components'
import { useUiStore } from '../store/ui-store'
import { useAuthStore } from '../store/auth-store'

// ── Header ────────────────────────────────────────────────────────────────────

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  padding-top: calc(12px + env(safe-area-inset-top));
  height: auto;
  min-height: 56px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border);
`

const Logo = styled.span`
  font-weight: 700;
  font-size: 1.125rem;
  color: var(--color-primary);
  letter-spacing: -0.5px;
`

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 1.25rem;
  transition: background 0.15s, color 0.15s;
  &:hover, &:active { background: var(--bg-secondary); color: var(--text-primary); }
`

// ── Bottom Nav ────────────────────────────────────────────────────────────────

const BottomNav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  background: var(--bg-primary);
  border-top: 1px solid var(--border);
  padding-bottom: env(safe-area-inset-bottom);
`

const NavItem = styled(NavLink)`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 10px 0;
  font-size: 0.625rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  transition: color 0.15s;

  .nav-icon { font-size: 1.375rem; }

  &.active {
    color: var(--color-primary);
  }
`

// ── Main ──────────────────────────────────────────────────────────────────────

const Main = styled.main`
  min-height: calc(100dvh - 64px - 80px);
  padding: 16px 16px calc(80px + env(safe-area-inset-bottom));
  background: var(--bg-primary);
`

// ── Theme toggle ──────────────────────────────────────────────────────────────

const themeIcons = { light: '☀️', dark: '🌙', system: '💻' }
const themeOrder = ['system', 'light', 'dark']

const ThemeToggle = () => {
  const { theme, setTheme } = useUiStore()
  const next = themeOrder[(themeOrder.indexOf(theme) + 1) % themeOrder.length]
  return (
    <IconButton
      onClick={() => setTheme(next)}
      aria-label={`Tema atual: ${theme}. Clique para mudar.`}
      title={`Tema: ${theme}`}
    >
      {themeIcons[theme]}
    </IconButton>
  )
}

// ── Layout ────────────────────────────────────────────────────────────────────

export const Layout = () => {
  const { clearAuth } = useAuthStore()

  return (
    <>
      <Header>
        <Logo>SyncLife</Logo>
        <HeaderActions>
          <ThemeToggle />
          <IconButton onClick={clearAuth} aria-label="Sair" title="Sair">
            🚪
          </IconButton>
        </HeaderActions>
      </Header>

      <Main>
        <Outlet />
      </Main>

      <BottomNav>
        <NavItem to="/" end>
          <span className="nav-icon">🏠</span>
          Início
        </NavItem>
        <NavItem to="/exercises">
          <span className="nav-icon">💪</span>
          Exercícios
        </NavItem>
        <NavItem to="/templates">
          <span className="nav-icon">📋</span>
          Treinos
        </NavItem>
        <NavItem to="/checkin">
          <span className="nav-icon">✅</span>
          Check-in
        </NavItem>
        <NavItem to="/history">
          <span className="nav-icon">📈</span>
          Histórico
        </NavItem>
      </BottomNav>
    </>
  )
}
