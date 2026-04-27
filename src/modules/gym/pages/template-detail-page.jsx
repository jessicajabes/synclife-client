import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import styled from 'styled-components'
import { useGymStore } from '../store'
import * as gymApi from '../api'
import { Button } from '../../../components/button'
import { Skeleton } from '../../../components/skeleton'
import { toast } from '../../../lib/toast'

// ── Styles ────────────────────────────────────────────────────────────────────

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
`

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 1.25rem;
  flex-shrink: 0;
  &:active { background: var(--bg-secondary); }
`

const HeaderInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const TemplateName = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Meta = styled.p`
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin-top: 2px;
`

const EditButton = styled.button`
  font-size: 0.875rem;
  color: var(--color-primary-dark);
  font-weight: 600;
  min-height: 40px;
  padding: 0 4px;
  flex-shrink: 0;
`

const SectionGroup = styled.div`
  margin-top: 16px;
`

const SectionTitle = styled.div`
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  padding: 0 4px;
  margin-bottom: 6px;
`

const ExerciseCard = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 12px 14px;
  margin-bottom: 6px;
`

const ExName = styled.p`
  font-weight: 600;
  font-size: 0.9375rem;
  margin-bottom: 4px;
`

const MuscleTag = styled.span`
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 6px;
  display: block;
`

const SetsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
`

const SetPill = styled.span`
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: 99px;
  font-weight: 500;
  background: ${({ $type }) =>
    $type === 'warmup'
      ? 'color-mix(in srgb, var(--color-warmup) 18%, transparent)'
      : 'color-mix(in srgb, var(--color-primary) 15%, transparent)'};
  color: ${({ $type }) =>
    $type === 'warmup' ? '#92670a' : 'var(--color-primary-dark)'};
  border: 1px solid ${({ $type }) =>
    $type === 'warmup'
      ? 'color-mix(in srgb, var(--color-warmup) 40%, transparent)'
      : 'color-mix(in srgb, var(--color-primary) 30%, transparent)'};
`

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 16px;
  color: var(--text-secondary);
  p { margin-top: 8px; font-size: 0.9375rem; }
`

const ActionButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  margin-top: 20px;
`

// ── Helpers ───────────────────────────────────────────────────────────────────

const groupBySection = (exercises) => {
  const sections = []
  const seenTitles = new Map()

  for (const ex of exercises) {
    const title = ex.sectionTitle || 'Geral'
    if (!seenTitles.has(title)) {
      const section = { title, exercises: [] }
      sections.push(section)
      seenTitles.set(title, section)
    }
    seenTitles.get(title).exercises.push(ex)
  }

  return sections
}

const setLabel = (set) => `${set.quantity}×${set.repsRange}`

// ── Component ─────────────────────────────────────────────────────────────────

export const TemplateDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { templates, templatesLoading, fetchTemplates } = useGymStore()
  const [loading, setLoading] = useState(false)
  const [starting, setStarting] = useState(false)
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (hasInitialized.current || templates.length > 0) return
    hasInitialized.current = true
    
    setLoading(true)
    fetchTemplates().finally(() => setLoading(false))
  }, [templates.length, fetchTemplates])

  const template = templates.find((t) => t.id === id)

  const startWorkout = async () => {
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

  if (templatesLoading || loading) {
    return (
      <>
        <PageHeader>
          <BackButton onClick={() => navigate(-1)}>←</BackButton>
          <Skeleton $height="26px" $width="180px" />
        </PageHeader>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} $height="80px" />
          ))}
        </div>
      </>
    )
  }

  if (!template) {
    return (
      <EmptyState>
        <span style={{ fontSize: '2rem' }}>🔍</span>
        <p>Template não encontrado.</p>
        <Button onClick={() => navigate('/templates')} style={{ marginTop: 16 }}>
          Voltar
        </Button>
      </EmptyState>
    )
  }

  const sections = groupBySection(template.exercises)
  const exCount = template.exercises.length

  return (
    <>
      <PageHeader>
        <BackButton onClick={() => navigate(-1)} aria-label="Voltar">←</BackButton>
        <HeaderInfo>
          <TemplateName>{template.name}</TemplateName>
          <Meta>{exCount} exercício{exCount !== 1 ? 's' : ''} · v{template.version}</Meta>
        </HeaderInfo>
        <EditButton onClick={() => navigate(`/templates/${id}/edit`)}>Editar</EditButton>
      </PageHeader>

      {sections.map((section) => (
        <SectionGroup key={section.title}>
          <SectionTitle>{section.title}</SectionTitle>
          {section.exercises.map((ex) => {
            const primaryMuscle = ex.exercise?.muscleGroups?.[0]?.name
            const warmupSets = ex.sets.filter((s) => s.type === 'warmup')
            const workingSets = ex.sets.filter((s) => s.type === 'working')
            return (
              <ExerciseCard key={ex.id}>
                <ExName>{ex.exercise?.name}</ExName>
                {primaryMuscle && <MuscleTag>{primaryMuscle}</MuscleTag>}
                <SetsRow>
                  {warmupSets.map((s) => (
                    <SetPill key={s.id} $type="warmup">
                      Aquec. {setLabel(s)}
                    </SetPill>
                  ))}
                  {workingSets.map((s) => (
                    <SetPill key={s.id} $type="working">
                      {setLabel(s)}
                    </SetPill>
                  ))}
                </SetsRow>
              </ExerciseCard>
            )
          })}
        </SectionGroup>
      ))}

      {template.exercises.length === 0 && (
        <EmptyState>
          <span style={{ fontSize: '2rem' }}>📋</span>
          <p>Este template não tem exercícios.</p>
        </EmptyState>
      )}

      <ActionButtons>
        <Button $fullWidth onClick={startWorkout} disabled={starting}>
          {starting ? 'Iniciando…' : '🚀 Iniciar treino'}
        </Button>
      </ActionButtons>
    </>
  )
}
