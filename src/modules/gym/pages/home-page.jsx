import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import styled from 'styled-components'
import { useAuthStore } from '../../../store/auth-store'
import { useGymStore } from '../store'
import * as gymApi from '../api'
import { useNavigationHistory } from '../../../hooks/useNavigationHistory'
import { Button } from '../../../components/button'
import { Skeleton } from '../../../components/skeleton'
import { toast } from '../../../lib/toast'

// ── Helper Functions ──────────────────────────────────────────────────────

const formatDateBr = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR')
}

const getLastCompletedDate = (sessions, templateId) => {
  const completed = sessions.find(
    (s) => s.workoutTemplateId === templateId && s.status === 'completed'
  )
  return completed ? completed.date : null
}

const getMonthStats = (sessions) => {
  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()
  
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const completedCount = sessions.filter((s) => {
    if (s.status !== 'completed') return false
    const sessionDate = new Date(s.date)
    return sessionDate.getMonth() === month && sessionDate.getFullYear() === year
  }).length
  
  return { completedCount, daysInMonth }
}

const getYearStats = (sessions) => {
  const now = new Date()
  const year = now.getFullYear()
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
  const daysInYear = isLeapYear ? 366 : 365
  
  const completedCount = sessions.filter((s) => {
    if (s.status !== 'completed') return false
    const sessionDate = new Date(s.date)
    return sessionDate.getFullYear() === year
  }).length
  
  return { completedCount, daysInYear }
}

const getWeekActivityMap = (sessions) => {
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  
  const dayMap = {}
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)
    const dateStr = date.toISOString().slice(0, 10)
    const hasWorkout = sessions.some(
      (s) => s.date.slice(0, 10) === dateStr && (s.status === 'completed' || s.status === 'in_progress')
    )
    dayMap[i] = { dateStr, hasWorkout }
  }
  return dayMap
}

const getActivePlanTemplateIds = (plan) => {
  if (!plan) return []

  const ids = new Set()

  if (plan.mode === 'weekly' && plan.weekMap) {
    Object.values(plan.weekMap).forEach((id) => {
      if (id) ids.add(id)
    })
  }

  if (plan.mode === 'sequential' && plan.sequence) {
    plan.sequence.forEach((item) => {
      if (item.templateId && !item.rest) {
        ids.add(item.templateId)
      }
    })
  }

  return Array.from(ids)
}

// ── Styles ────────────────────────────────────────────────────────────────────

const Greeting = styled.h2`
  font-size: 1.375rem;
  font-weight: 700;
  margin-bottom: 4px;
`

const Sub = styled.p`
  color: var(--text-secondary);
  font-size: 0.9375rem;
  margin-bottom: 10px;
`

const ActiveWorkoutCard = styled.div`
  background: linear-gradient(135deg, var(--color-primary) 0%, color-mix(in srgb, var(--color-primary) 80%, transparent) 100%);
  border: 1px solid color-mix(in srgb, var(--color-primary) 50%, transparent);
  border-radius: var(--radius-lg);
  padding: 16px;
  margin-bottom: 12px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

const ActiveWorkoutInfo = styled.div`
  flex: 1;
  min-width: 0;
  
  p {
    margin: 0;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    opacity: 0.9;
  }
  
  h3 {
    margin: 4px 0 0;
    font-size: 1rem;
    font-weight: 700;
  }
`

const ActiveWorkoutBtn = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-md);
  padding: 8px 14px;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  flex-shrink: 0;
  
  &:active {
    background: rgba(255, 255, 255, 0.3);
  }
`

const Card = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 10px 16px;
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

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
`

const StatCard = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 0px;
  text-align: center;
`

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 0px;
`

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
`

const WeekContainer = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 5px;
  margin-bottom: 10px;
`

const WeekTitle = styled.p`
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  margin-bottom: 12px;
`

const WeekGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
`

const WeekDay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`

const DayLabel = styled.span`
  font-size: 0.65rem;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
`

const DayCircle = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  background: ${(props) => props.$active ? 'var(--color-primary)' : 'var(--bg-secondary)'};
  color: ${(props) => props.$active ? 'white' : 'var(--text-secondary)'};
`

const WorkoutsSection = styled.div`
  margin-top: 10px;
`

const SectionTitle = styled.p`
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  margin-bottom: 12px;
`

const LastCompletedDate = styled.span`
  font-size: 0.75rem;
  color: var(--text-secondary);
  display: block;
  margin-top: 8px;
`

const ButtonGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 8px;
`

// ── Helpers ───────────────────────────────────────────────────────────────────

const WEEKDAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const WEEKDAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']

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
  padding: 10px;
`

const ModalBox = styled.div`
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 24px 10px;
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
  margin-bottom: 10px;
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
  const { templates, fetchPlans, fetchTemplates, activePlan, plansLoading, userExitedWorkout, setUserExitedWorkout } = useGymStore()
  const { canGoBack } = useNavigationHistory()

  const [inProgressSession, setInProgressSession] = useState(undefined) // undefined=loading, null=none
  const [sessions, setSessions] = useState([])
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [showRecovery, setShowRecovery] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [starting, setStarting] = useState(false)
  const [discarding, setDiscarding] = useState(false)

  useEffect(() => {
    fetchPlans()
    fetchTemplates()

    // Reset userExitedWorkout only when HOME is mounted (coming back from nav)
    // This ensures we allow auto-open once per return
    if (userExitedWorkout) {
      setUserExitedWorkout(false)
    }

    // Check for in_progress session
    gymApi.fetchInProgressSession()
      .then(({ data }) => {
        const sess = data.data
        setInProgressSession(sess)
        // Só auto-navegar se voltou de outra página E não saiu voluntariamente do workout
        if (sess && canGoBack && !userExitedWorkout) {
          // Se voltou de outra página e há treino em andamento, ir direto
          navigate(`/workout/${sess.id}`)
        } else if (sess && !canGoBack && !userExitedWorkout) {
          // Primeira vez: mostra modal
          setShowRecovery(true)
        }
        // Se userExitedWorkout = true: não faz nada, deixa user na HOME
      })
      .catch(() => setInProgressSession(null))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canGoBack])

  // Separate effect to reset the flag AFTER checking navigation
  useEffect(() => {
    if (userExitedWorkout) {
      const timer = setTimeout(() => {
        setUserExitedWorkout(false)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [userExitedWorkout, setUserExitedWorkout])

  useEffect(() => {
    let isMounted = true

    gymApi.fetchSessions()
      .then(({ data }) => {
        if (isMounted) {
          setSessions(data.data || [])
          setSessionsLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) {
          setSessions([])
          setSessionsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
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

  // Filter templates to only those in active plan
  const activePlanTemplateIds = getActivePlanTemplateIds(activePlan)
  const planTemplates = templates.filter((t) => activePlanTemplateIds.includes(t.id))

  // Sort templates by last completion date
  const sortedTemplates = [...planTemplates].sort((a, b) => {
    const lastDateA = getLastCompletedDate(sessions, a.id)
    const lastDateB = getLastCompletedDate(sessions, b.id)
    
    // If both have completion dates, sort by date (newest first)
    if (lastDateA && lastDateB) {
      return new Date(lastDateB) - new Date(lastDateA)
    }
    
    // If only one has a date, it comes first
    if (lastDateA) return -1
    if (lastDateB) return 1
    
    // Otherwise maintain original order
    return planTemplates.indexOf(a) - planTemplates.indexOf(b)
  })

  const monthStats = getMonthStats(sessions)
  const yearStats = getYearStats(sessions)
  const weekActivityMap = getWeekActivityMap(sessions)

  const isLoading = inProgressSession === undefined || plansLoading || sessionsLoading

  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  const todayCapital = today.charAt(0).toUpperCase() + today.slice(1)

  return (
    <>
      <Greeting>Olá, {firstName}! 💪</Greeting>
      <Sub>{todayCapital}</Sub>

      {/* Active workout indicator */}
      {inProgressSession && !isLoading && (
        <ActiveWorkoutCard>
          <ActiveWorkoutInfo>
            <p>⏱️ Treino em andamento</p>
            <h3>Continuar de onde parou</h3>
          </ActiveWorkoutInfo>
          <ActiveWorkoutBtn onClick={() => navigate(`/workout/${inProgressSession.id}`)}>
            Entrar
          </ActiveWorkoutBtn>
        </ActiveWorkoutCard>
      )}

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
            <Button onClick={() => navigate('/training/plans')}>
              Configurar plano
            </Button>
          </NoPlanBox>
        </Card>
      ) : (
        <>

                  {/* Statistics */}
          <StatsContainer>
            <StatCard>
              <StatValue>{monthStats.completedCount}/{monthStats.daysInMonth}</StatValue>
              <StatLabel>Este mês</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{yearStats.completedCount}/{yearStats.daysInYear}</StatValue>
              <StatLabel>Este ano</StatLabel>
            </StatCard>
          </StatsContainer>

          {/* Week Activity */}
          <WeekContainer>
            <WeekTitle>Semana atual</WeekTitle>
            <WeekGrid>
              {Object.entries(weekActivityMap).map(([dayIndex, day]) => (
                <WeekDay key={dayIndex}>
                  <DayLabel>{WEEKDAY_NAMES[dayIndex]}</DayLabel>
                  <DayCircle $active={day.hasWorkout}>
                    {day.hasWorkout ? '✓' : ''}
                  </DayCircle>
                </WeekDay>
              ))}
            </WeekGrid>
          </WeekContainer>

          {todayTemplate ? (
            <Card>
              <CardTitle>Treino de hoje</CardTitle>
              <WorkoutName>{todayTemplate.name}</WorkoutName>
              <WorkoutMeta>{todayTemplate.exercises.length} exercícios</WorkoutMeta>
              <MuscleChips>
                {getTemplateMuscleGroups(todayTemplate).map((name) => (
                  <Chip key={name}>{name}</Chip>
                ))}
              </MuscleChips>
              <Button $variant="ghost" $fullWidth  onClick={() => navigate(`/templates/${todayTemplate.id}`)}>
                Ver treino
              </Button>
              <Button $fullWidth onClick={() => startWorkout(todayTemplate)} disabled={starting} style={{ marginTop: 8 }}>
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

          {/* All Workouts */}
          {sortedTemplates.length > 0 && (
            <WorkoutsSection>
              <SectionTitle>Todos os treinos do plano</SectionTitle>
              {sortedTemplates.map((template) => {
                const lastDate = getLastCompletedDate(sessions, template.id)
                return (
                  <Card key={template.id}>
                    <CardTitle>Treino</CardTitle>
                    <WorkoutName>{template.name}</WorkoutName>
                    <WorkoutMeta>{template.exercises.length} exercícios</WorkoutMeta>
                    <MuscleChips>
                      {getTemplateMuscleGroups(template).map((name) => (
                        <Chip key={name}>{name}</Chip>
                      ))}
                    </MuscleChips>
                    {lastDate && (
                      <LastCompletedDate>
                        Última realização: {formatDateBr(lastDate)}
                      </LastCompletedDate>
                    )}
                    <ButtonGroup>
                      <Button $variant="ghost" onClick={() => navigate(`/templates/${template.id}`)}>
                        Ver treino
                      </Button>
                      <Button onClick={() => startWorkout(template)}>
                        Iniciar
                      </Button>
                    </ButtonGroup>
                  </Card>
                )
              })}
            </WorkoutsSection>
          )}

          {/* Quick access to plan setup */}
          <button
            style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', width: '100%', minHeight: 44 }}
            onClick={() => navigate('/training/plans')}
          >
            Gerenciar plano de treino →
          </button>
        </>
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
