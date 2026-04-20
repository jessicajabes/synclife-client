import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import styled from 'styled-components'
import { useAuthStore } from '../../../store/auth-store'
import { useGymStore } from '../store'
import * as gymApi from '../api'
import { Button } from '../../../components/button'
import { Skeleton } from '../../../components/skeleton'
import { toast } from '../../../lib/toast'

// ── Styles ────────────────────────────────────────────────────────────────────

const Greeting = styled.h2`
  font-size: 1.375rem;
  font-weight: 700;
  margin-bottom: 4px;
`

const Sub = styled.p`
  color: var(--text-secondary);
  font-size: 0.9375rem;
  margin-bottom: 20px;
`

const Card = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px 16px;
  margin-bottom: 12px;
`

const CardTitle = styled.p`
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  margin-bottom: 8px;
`

const WorkoutName = styled.p`
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 4px;
`

const WorkoutMeta = styled.p`
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 16px;
`

const MuscleChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
`

const Chip = styled.span`
  font-size: 0.75rem;
  padding: 3px 10px;
  border-radius: 99px;
  background: color-mix(in srgb, var(--color-primary) 12%, transparent);
  color: var(--color-primary-dark);
  border: 1px solid color-mix(in srgb, var(--color-primary) 30%, transparent);
  font-weight: 600;
`

const RestDayBox = styled.div`
  text-align: center;
  padding: 32px 16px;

  span { display: block; font-size: 3rem; margin-bottom: 8px; }
  h3 { font-size: 1.125rem; font-weight: 700; margin-bottom: 4px; }
  p { color: var(--text-secondary); font-size: 0.9375rem; }
`

const NoPlanBox = styled.div`
  text-align: center;
  padding: 32px 16px;

  span { display: block; font-size: 3rem; margin-bottom: 8px; }
  h3 { font-size: 1.125rem; font-weight: 700; margin-bottom: 8px; }
  p { color: var(--text-secondary); font-size: 0.9375rem; margin-bottom: 16px; }
`

// ── Helpers ───────────────────────────────────────────────────────────────────

const WEEKDAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

const getTodayTemplate = (plan, templates) => {
  if (!plan) return null

  if (plan.mode === 'weekly') {
    const key = WEEKDAY_KEYS[new Date().getDay()]
    const templateId = plan.weekMap?.[key]
    if (!templateId) return null
    return templates.find((t) => t.id === templateId) ?? null
  }

  if (plan.mode === 'sequential') {
    // Find next in sequence after last completed session
    // For now, return first template in sequence
    const firstTemplateItem = (plan.sequence || []).find((s) => !s.rest)
    if (!firstTemplateItem) return null
    return templates.find((t) => t.id === firstTemplateItem.templateId) ?? null
  }

  return null
}

const getTemplateMuscleGroups = (template) => {
  const seen = new Set()
  const result = []
  for (const ex of template.exercises) {
    const primary = ex.exercise?.muscleGroups?.[0]
    if (primary && !seen.has(primary.id)) {
      seen.add(primary.id)
      result.push(primary.name)
    }
  }
  return result.slice(0, 5)
}

// ── Recovery Modal ────────────────────────────────────────────────────────────

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`

const ModalBox = styled.div`
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 24px 20px;
  width: 100%;
  max-width: 360px;
  border: 1px solid var(--border);
`

const ModalTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 8px;
`

const ModalDesc = styled.p`
  font-size: 0.9375rem;
  color: var(--text-secondary);
  margin-bottom: 20px;
`

const ModalActions = styled.div`
  display: flex;
  gap: 10px;
`

// ── Template Picker ──────────────────────────────────────────────────────────

const PickerOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 100;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`

const PickerSheet = styled.div`
  background: var(--bg-primary);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  max-height: 70dvh;
  display: flex;
  flex-direction: column;
`

const SheetHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 10px;
  border-bottom: 1px solid var(--border);
`

const SheetTitle = styled.h3`
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

const PickerList = styled.ul`
  list-style: none;
  overflow-y: auto;
  flex: 1;
`

const PickerItem = styled.li`
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  &:last-child { border-bottom: none; }
  &:active { background: var(--bg-secondary); }
`

// ── Component ─────────────────────────────────────────────────────────────────

export const HomePage = () => {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const firstName = user?.name?.split(' ')[0] || 'Atleta'
  const { templates, fetchPlans, fetchTemplates, activePlan, plansLoading } = useGymStore()

  const [inProgressSession, setInProgressSession] = useState(undefined) // undefined=loading, null=none
  const [showRecovery, setShowRecovery] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [starting, setStarting] = useState(false)
  const [discarding, setDiscarding] = useState(false)

  useEffect(() => {
    fetchPlans()
    fetchTemplates()

    // Check for in_progress session
    gymApi.fetchInProgressSession()
      .then(({ data }) => {
        const sess = data.data
        setInProgressSession(sess)
        if (sess) setShowRecovery(true)
      })
      .catch(() => setInProgressSession(null))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const todayTemplate = getTodayTemplate(activePlan, templates)

  const startWorkout = async (template) => {
    setStarting(true)
    try {
      const sessionId = uuidv4()
      const today = new Date().toISOString().slice(0, 10)
      const { data } = await gymApi.createSession({
        id: sessionId,
        workoutTemplateId: template.id,
        date: today,
        startedAt: new Date().toISOString(),
      })
      navigate(`/workout/${data.data.id}`)
    } catch (err) {
      toast.error('Erro ao iniciar treino: ' + (err.response?.data?.message || err.message))
    } finally {
      setStarting(false)
    }
  }

  const handleContinue = () => {
    setShowRecovery(false)
    navigate(`/workout/${inProgressSession.id}`)
  }

  const handleDiscard = async () => {
    setDiscarding(true)
    try {
      await gymApi.discardSession(inProgressSession.id)
      setInProgressSession(null)
      setShowRecovery(false)
    } catch {
      toast.error('Erro ao descartar sessão')
    } finally {
      setDiscarding(false)
    }
  }

  const isLoading = inProgressSession === undefined || plansLoading

  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  const todayCapital = today.charAt(0).toUpperCase() + today.slice(1)

  return (
    <>
      <Greeting>Olá, {firstName}! 💪</Greeting>
      <Sub>{todayCapital}</Sub>

      {isLoading ? (
        <Card>
          <Skeleton $height="14px" $width="80px" style={{ marginBottom: 12 }} />
          <Skeleton $height="22px" $width="60%" style={{ marginBottom: 8 }} />
          <Skeleton $height="14px" $width="40%" style={{ marginBottom: 16 }} />
          <Skeleton $height="48px" />
        </Card>
      ) : !activePlan ? (
        <Card>
          <NoPlanBox>
            <span>📋</span>
            <h3>Sem plano de treino</h3>
            <p>Configure um plano para o app saber qual treino fazer hoje.</p>
            <Button onClick={() => navigate('/plans/setup')}>
              Configurar plano
            </Button>
          </NoPlanBox>
        </Card>
      ) : todayTemplate ? (
        <Card>
          <CardTitle>Treino de hoje</CardTitle>
          <WorkoutName>{todayTemplate.name}</WorkoutName>
          <WorkoutMeta>{todayTemplate.exercises.length} exercícios</WorkoutMeta>
          <MuscleChips>
            {getTemplateMuscleGroups(todayTemplate).map((name) => (
              <Chip key={name}>{name}</Chip>
            ))}
          </MuscleChips>
          <Button $fullWidth onClick={() => startWorkout(todayTemplate)} disabled={starting}>
            {starting ? 'Iniciando…' : 'Iniciar treino'}
          </Button>
          <Button $variant="ghost" $fullWidth onClick={() => setShowPicker(true)} style={{ marginTop: 8 }}>
            Iniciar outro treino
          </Button>
        </Card>
      ) : (
        <Card>
          <RestDayBox>
            <span>💤</span>
            <h3>Dia de descanso</h3>
            <p>Nenhum treino agendado para hoje.</p>
          </RestDayBox>
          <Button $variant="ghost" $fullWidth onClick={() => setShowPicker(true)} style={{ marginTop: 8 }}>
            Iniciar treino avulso
          </Button>
        </Card>
      )}

      {/* Quick access to plan setup */}
      {activePlan && (
        <button
          style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', width: '100%', minHeight: 44 }}
          onClick={() => navigate('/plans/setup')}
        >
          Editar plano de treino →
        </button>
      )}

      {/* Recovery modal */}
      {showRecovery && inProgressSession && (
        <ModalOverlay>
          <ModalBox>
            <ModalTitle>Treino em andamento</ModalTitle>
            <ModalDesc>
              Você tem um treino não finalizado. Deseja continuar de onde parou?
            </ModalDesc>
            <ModalActions>
              <Button
                $variant="ghost"
                $fullWidth
                onClick={handleDiscard}
                disabled={discarding}
              >
                {discarding ? '…' : 'Descartar'}
              </Button>
              <Button $fullWidth onClick={handleContinue}>
                Continuar
              </Button>
            </ModalActions>
          </ModalBox>
        </ModalOverlay>
      )}

      {/* Template picker for ad-hoc workout */}
      {showPicker && (
        <PickerOverlay onClick={() => setShowPicker(false)}>
          <PickerSheet onClick={(e) => e.stopPropagation()}>
            <SheetHeader>
              <SheetTitle>Escolher treino</SheetTitle>
              <CloseBtn onClick={() => setShowPicker(false)}>×</CloseBtn>
            </SheetHeader>
            <PickerList>
              {templates.map((t) => (
                <PickerItem
                  key={t.id}
                  onClick={() => {
                    setShowPicker(false)
                    startWorkout(t)
                  }}
                >
                  <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{t.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    {t.exercises.length} exercícios
                  </p>
                </PickerItem>
              ))}
            </PickerList>
          </PickerSheet>
        </PickerOverlay>
      )}
    </>
  )
}
