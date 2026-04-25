import { useCallback, useEffect, useRef, useState } from 'react'
import styled, { keyframes } from 'styled-components'

// ── Animations ────────────────────────────────────────────────────────────────

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`

// ── Styles ────────────────────────────────────────────────────────────────────

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 40;
  display: ${({ $done }) => $done ? 'none' : 'flex'};
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 10px 16px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  color: white;
  font-size: 0.9375rem;
`

const Time = styled.span`
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  min-width: 52px;
  text-align: center;
  line-height: 1;
`

const Label = styled.span`
  font-size: 1.125rem;
  font-weight: 600;
`

const Btn = styled.button`
  min-height: 40px;
  padding: 0 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 700;
  background: rgba(0,0,0,0.15);
  color: inherit;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
  &:active {
    background: rgba(0,0,0,0.25);
  }
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
  const dismissTimeoutRef = useRef(null)
  const done = remaining <= 0

  // Memoize onDismiss to avoid dependency changes
  const memoizedOnDismiss = useCallback(onDismiss, [onDismiss])

  useEffect(() => {
    setRemaining(seconds)
    setPaused(false)
    clearTimeout(dismissTimeoutRef.current)
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
          <Label>✓ Descansou!</Label>
          <Btn type="button" onClick={memoizedOnDismiss}>OK</Btn>
        </>
      ) : (
        <>
          <Time>{fmt(remaining)}</Time>
          <Label>descanso</Label>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn type="button" onClick={() => setPaused((p) => !p)}>
              {paused ? '▶ Retomar' : '⏸ Pausar'}
            </Btn>
            <Btn type="button" onClick={onDismiss}>✕</Btn>
          </div>
        </>
      )}
    </Wrapper>
  )
}
