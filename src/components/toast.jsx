import { useEffect } from 'react'
import styled, { keyframes } from 'styled-components'
import { useToastStore } from '../lib/toast'


// ── Styles ────────────────────────────────────────────────────────────────────

const slideIn = keyframes`
  from { transform: translateY(16px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
`

const Container = styled.div`
  position: fixed;
  bottom: 72px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  pointer-events: none;
  width: calc(100% - 32px);
  max-width: 400px;
`

const Pill = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 99px;
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  animation: ${slideIn} 0.2s ease;
  pointer-events: all;
  background: ${({ $type }) =>
    $type === 'success' ? '#166534'
    : $type === 'error'  ? '#7f1d1d'
    : '#1e3a5f'};
  color: ${({ $type }) =>
    $type === 'success' ? '#bbf7d0'
    : $type === 'error'  ? '#fecaca'
    : '#bfdbfe'};
  border: 1px solid ${({ $type }) =>
    $type === 'success' ? '#15803d'
    : $type === 'error'  ? '#991b1b'
    : '#1d4ed8'};
`

// ── ToastItem ─────────────────────────────────────────────────────────────────

const ICONS = { success: '✓', error: '✕', info: 'ℹ' }
const DURATION = 3000

const ToastItem = ({ id, type, message }) => {
  const remove = useToastStore((s) => s.remove)

  useEffect(() => {
    const t = setTimeout(() => remove(id), DURATION)
    return () => clearTimeout(t)
  }, [id, remove])

  return (
    <Pill $type={type} onClick={() => remove(id)}>
      <span>{ICONS[type]}</span>
      <span>{message}</span>
    </Pill>
  )
}

// ── Provider ──────────────────────────────────────────────────────────────────

export const ToastProvider = () => {
  const toasts = useToastStore((s) => s.toasts)
  return (
    <Container>
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} />
      ))}
    </Container>
  )
}
