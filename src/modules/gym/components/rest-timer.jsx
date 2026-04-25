import { useCallback, useEffect, useRef, useState } from 'react'
import styled, { keyframes } from 'styled-components'

// ── Animations ────────────────────────────────────────────────────────────────

const slideDown = keyframes`
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`

// ── Styles ────────────────────────────────────────────────────────────────────

const Wrapper = styled.div`
  display: ${({ $done }) => $done ? 'none' : 'flex'};
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.55);
  border-radius: 8px;
  color: white;
  font-size: 0.9375rem;
  animation: ${slideDown} 0.3s ease-out;
  backdrop-filter: blur(4px);
`

const TimeAndLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const Time = styled.span`
  font-size: 1.375rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  min-width: 60px;
  text-align: center;
  line-height: 1;
`

const Label = styled.span`
  font-size: 0.9375rem;
  font-weight: 600;
  text-transform: capitalize;
`

const Controls = styled.div`
  display: flex;
  gap: 6px;
  flex-shrink: 0;
`

const Btn = styled.button`
  min-height: 36px;
  padding: 0 12px;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.15);
  color: inherit;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
  &:active {
    background: rgba(255, 255, 255, 0.25);
  }
`

const SkipBtn = styled(Btn)`
  width: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
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

  // Memoize onDismiss to avoid dependency changes
  const memoizedOnDismiss = useCallback(onDismiss, [onDismiss])

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
      <TimeAndLabel>
        <Time>{fmt(remaining)}</Time>
        <Label>descanso</Label>
      </TimeAndLabel>
      <Controls>
        <Btn type="button" onClick={() => setPaused((p) => !p)}>
          {paused ? '▶' : '⏸'}
        </Btn>
        <SkipBtn type="button" onClick={memoizedOnDismiss} title="Pular">
          ✕
        </SkipBtn>
      </Controls>
    </Wrapper>
  )
}
