import { useEffect, useRef, useState } from 'react'
import styled, { keyframes } from 'styled-components'

// ── Animations ────────────────────────────────────────────────────────────────

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`

// ── Styles ────────────────────────────────────────────────────────────────────

const Wrapper = styled.div`
  position: fixed;
  bottom: 88px; /* above bottom nav */
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-radius: 99px;
  background: ${({ $done }) =>
    $done
      ? 'color-mix(in srgb, var(--color-success) 90%, transparent)'
      : 'color-mix(in srgb, var(--color-warmup) 90%, transparent)'};
  color: ${({ $done }) => ($done ? '#14532d' : '#78350f')};
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  animation: ${({ $done }) => $done ? pulse : 'none'} 0.8s ease-in-out infinite;
  min-width: 220px;
  justify-content: center;
`

const Time = styled.span`
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  min-width: 52px;
  text-align: center;
`

const Label = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
`

const Btn = styled.button`
  min-height: 32px;
  padding: 0 10px;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 700;
  background: rgba(0,0,0,0.15);
  color: inherit;
`

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (s) => {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

// ── Component ─────────────────────────────────────────────────────────────────

export const RestTimer = ({ seconds, onDismiss }) => {
  const [remaining, setRemaining] = useState(seconds)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef(null)
  const done = remaining <= 0

  useEffect(() => {
    setRemaining(seconds)
    setPaused(false)
  }, [seconds])

  useEffect(() => {
    if (paused || done) {
      clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current)
          // Vibrate when done
          if (navigator.vibrate) navigator.vibrate([200, 100, 200])
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [paused, done])

  return (
    <Wrapper $done={done} role="status" aria-live="polite">
      {done ? (
        <>
          <Label>Descansou!</Label>
          <Btn type="button" onClick={onDismiss}>OK</Btn>
        </>
      ) : (
        <>
          <Time>{fmt(remaining)}</Time>
          <Label>descanso</Label>
          <Btn type="button" onClick={() => setPaused((p) => !p)}>
            {paused ? '▶' : '⏸'}
          </Btn>
          <Btn type="button" onClick={onDismiss}>✕</Btn>
        </>
      )}
    </Wrapper>
  )
}
