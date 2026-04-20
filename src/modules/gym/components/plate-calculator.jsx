import styled from 'styled-components'

// ── Styles ────────────────────────────────────────────────────────────────────

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
`

const Sheet = styled.div`
  background: var(--bg-primary);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  width: 100%;
  max-width: 480px;
  padding: 20px 20px 36px;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`

const Title = styled.h3`
  font-size: 1rem;
  font-weight: 700;
`

const CloseBtn = styled.button`
  font-size: 1.25rem;
  color: var(--text-secondary);
  width: 36px;
  height: 36px;
  min-height: 36px;
`

const TotalLine = styled.p`
  font-size: 0.9375rem;
  color: var(--text-secondary);
  margin-bottom: 16px;
`

const PlatesRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`

const PlatePill = styled.div`
  padding: 6px 14px;
  border-radius: 99px;
  background: ${({ $color }) => $color || 'var(--bg-secondary)'};
  color: var(--text-primary);
  font-weight: 700;
  font-size: 0.875rem;
  border: 1px solid var(--border);
`

const Note = styled.p`
  font-size: 0.8125rem;
  color: var(--text-secondary);
`

// ── Helpers ───────────────────────────────────────────────────────────────────

const PLATE_COLORS = {
  20: '#ef4444',
  15: '#3b82f6',
  10: '#22c55e',
  5: '#f59e0b',
  2.5: '#8b5cf6',
  1.25: '#6b7280',
}

const calculatePlates = (totalKg, barbellKg, availablePlates) => {
  const perSide = (totalKg - barbellKg) / 2
  if (perSide < 0) return { error: `Peso total menor que a barra (${barbellKg}kg)` }
  if (perSide === 0) return { plates: [], perSide: 0 }

  const sorted = [...availablePlates].sort((a, b) => b - a)
  const plates = []
  let remaining = perSide

  for (const plate of sorted) {
    while (remaining >= plate - 0.001) {
      plates.push(plate)
      remaining -= plate
    }
  }

  if (remaining > 0.1) {
    return { plates, perSide, warning: `Não foi possível atingir exatamente (faltam ${remaining.toFixed(2)}kg/lado com as anilhas disponíveis)` }
  }

  return { plates, perSide }
}

// ── Component ─────────────────────────────────────────────────────────────────

const DEFAULT_BARBELL = 20
const DEFAULT_PLATES = [20, 15, 10, 5, 2.5, 1.25]

export const PlateCalculator = ({ weightKg, onClose, preferences = {} }) => {
  const barbellKg = preferences.barbellWeight ?? DEFAULT_BARBELL
  const availablePlates = preferences.availablePlates ?? DEFAULT_PLATES

  const { plates, perSide, error, warning } = calculatePlates(weightKg, barbellKg, availablePlates)

  return (
    <Overlay onClick={onClose}>
      <Sheet onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>Calculadora de anilhas</Title>
          <CloseBtn onClick={onClose}>×</CloseBtn>
        </Header>

        <TotalLine>
          {weightKg}kg total · Barra {barbellKg}kg · {perSide?.toFixed(2)}kg/lado
        </TotalLine>

        {error ? (
          <Note style={{ color: 'var(--color-danger)' }}>{error}</Note>
        ) : plates?.length === 0 ? (
          <Note>Só a barra! 🎉</Note>
        ) : (
          <>
            <p style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-secondary)' }}>
              DE CADA LADO:
            </p>
            <PlatesRow>
              {plates?.map((p, i) => (
                <PlatePill key={i} $color={PLATE_COLORS[p] ? `${PLATE_COLORS[p]}22` : undefined}>
                  {p}kg
                </PlatePill>
              ))}
            </PlatesRow>
          </>
        )}

        {warning && <Note style={{ color: 'var(--color-warmup)' }}>⚠ {warning}</Note>}
      </Sheet>
    </Overlay>
  )
}
