import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import styled from 'styled-components'
import { useGymStore } from '../store'
import { Button } from '../../../components/button'
import { Input, InputGroup, Label, ErrorText } from '../../../components/input'
import { Skeleton } from '../../../components/skeleton'

// ── Styles ────────────────────────────────────────────────────────────────────

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
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

const PageTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
`

const SectionLabel = styled.p`
  font-size: 0.8125rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  margin: 20px 0 8px;
`

const ExerciseItem = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  margin-bottom: 8px;
  overflow: hidden;
`

const ExerciseHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
`

const ExerciseInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const ExerciseName = styled.p`
  font-weight: 600;
  font-size: 0.9375rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ExMeta = styled.p`
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 2px;
`

const IconBtn = styled.button`
  width: 36px;
  height: 36px;
  min-height: 36px;
  border-radius: var(--radius-md);
  font-size: 1rem;
  color: var(--text-secondary);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  &:active { background: var(--bg-secondary); }
  &[data-danger] { color: var(--color-danger); }
`

const ExerciseBody = styled.div`
  border-top: 1px solid var(--border);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const SectionInput = styled(Input)`
  font-size: 0.875rem;
  min-height: 40px;
  padding: 0 10px;
`

const SetsTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const SetRow = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`

const TypeSelect = styled.select`
  min-height: 38px;
  padding: 0 8px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.8125rem;
  flex: 0 0 96px;
  outline: none;
  &:focus { border-color: var(--color-primary); }
`

const SmallInput = styled(Input)`
  min-height: 38px;
  font-size: 0.875rem;
  padding: 0 10px;
  text-align: center;
`

const AddSetBtn = styled.button`
  font-size: 0.8125rem;
  color: var(--color-primary-dark);
  font-weight: 600;
  min-height: 32px;
  padding: 0;
  text-align: left;
`

const RemoveSetBtn = styled.button`
  width: 28px;
  height: 28px;
  min-height: 28px;
  border-radius: var(--radius-sm);
  font-size: 1rem;
  color: var(--color-danger);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  &:active { opacity: 1; }
`

const AddExerciseBtn = styled.button`
  width: 100%;
  min-height: 48px;
  border: 2px dashed var(--border);
  border-radius: var(--radius-lg);
  font-size: 0.9375rem;
  color: var(--text-secondary);
  font-weight: 500;
  margin-top: 4px;
  &:active { background: var(--bg-secondary); }
`

const GlobalError = styled.div`
  background: color-mix(in srgb, var(--color-danger) 12%, transparent);
  color: var(--color-danger);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  font-size: 0.875rem;
`

// ── Exercise Picker ────────────────────────────────────────────────────────────

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`

const Sheet = styled.div`
  background: var(--bg-primary);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  max-height: 80dvh;
  display: flex;
  flex-direction: column;
`

const SheetHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 10px;
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
  display: flex;
  align-items: center;
  justify-content: center;
`

const SearchWrapper = styled.div`
  padding: 0 16px 10px;
`

const PickerList = styled.ul`
  list-style: none;
  overflow-y: auto;
  flex: 1;
`

const PickerItem = styled.li`
  padding: 12px 16px;
  border-top: 1px solid var(--border);
  cursor: pointer;
  &:active { background: var(--bg-secondary); }
`

const PickerName = styled.p`
  font-size: 0.9375rem;
  font-weight: 500;
`

const PickerMeta = styled.p`
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 2px;
`

// ── Helpers ───────────────────────────────────────────────────────────────────

const makeSet = () => ({ uid: uuidv4(), type: 'working', quantity: 3, repsRange: '8-12' })

const setsSummary = (sets) => {
  if (sets.length === 0) return 'Sem séries'
  const warmup = sets.filter((s) => s.type === 'warmup')
  const working = sets.filter((s) => s.type === 'working')
  const parts = []
  if (warmup.length) parts.push(`Aquec. ${warmup.map((s) => `${s.quantity}×${s.repsRange}`).join(', ')}`)
  if (working.length) parts.push(working.map((s) => `${s.quantity}×${s.repsRange}`).join(' + '))
  return parts.join(' | ')
}

// ── Component ─────────────────────────────────────────────────────────────────

export const TemplateFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)

  const { templates, fetchTemplates, exercises, fetchExercises, createTemplate, updateTemplate } = useGymStore()

  const [name, setName] = useState('')
  const [items, setItems] = useState([])
  const [nameError, setNameError] = useState('')
  const [globalError, setGlobalError] = useState('')
  const [saving, setSaving] = useState(false)
  const [expandedUid, setExpandedUid] = useState(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerSearch, setPickerSearch] = useState('')
  const [initLoading, setInitLoading] = useState(isEditing)
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    fetchExercises()
    if (isEditing) {
      const load = async () => {
        if (templates.length === 0) await fetchTemplates()
        const existing = useGymStore.getState().templates.find((t) => t.id === id)
        if (existing) {
          setName(existing.name)
          setItems(
            existing.exercises.map((ex) => ({
              uid: uuidv4(),
              exerciseId: ex.exerciseId,
              exercise: ex.exercise,
              sectionTitle: ex.sectionTitle || '',
              defaultRestSeconds: ex.defaultRestSeconds || 120,
              sets: ex.sets.map((s) => ({
                uid: uuidv4(),
                type: s.type,
                quantity: s.quantity,
                repsRange: s.repsRange,
              })),
            }))
          )
        }
        setInitLoading(false)
      }
      load()
    }
  }, [id, isEditing, templates.length, fetchExercises, fetchTemplates])

  // ── Item mutations ──────────────────────────────────────────────────────────

  const addExercise = (exercise) => {
    setItems((prev) => [
      ...prev,
      { uid: uuidv4(), exerciseId: exercise.id, exercise, sectionTitle: '', defaultRestSeconds: 120, sets: [makeSet()] },
    ])
    setPickerOpen(false)
    setPickerSearch('')
  }

  const removeItem = (uid) => setItems((prev) => prev.filter((i) => i.uid !== uid))

  const updateItemField = (uid, field, value) =>
    setItems((prev) => prev.map((i) => (i.uid === uid ? { ...i, [field]: value } : i)))

  const addSet = (uid) =>
    setItems((prev) =>
      prev.map((i) => (i.uid === uid ? { ...i, sets: [...i.sets, makeSet()] } : i))
    )

  const removeSet = (uid, setUid) =>
    setItems((prev) =>
      prev.map((i) =>
        i.uid === uid ? { ...i, sets: i.sets.filter((s) => s.uid !== setUid) } : i
      )
    )

  const updateSet = (uid, setUid, field, value) =>
    setItems((prev) =>
      prev.map((i) =>
        i.uid === uid
          ? { ...i, sets: i.sets.map((s) => (s.uid === setUid ? { ...s, [field]: value } : s)) }
          : i
      )
    )

  const moveItem = (uid, direction) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.uid === uid)
      const next = idx + direction
      if (next < 0 || next >= prev.length) return prev
      const arr = [...prev]
      ;[arr[idx], arr[next]] = [arr[next], arr[idx]]
      return arr
    })
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) { setNameError('Nome é obrigatório'); return }
    if (items.length === 0) { setGlobalError('Adicione pelo menos um exercício'); return }

    setSaving(true)
    setGlobalError('')
    try {
      const payload = {
        name: name.trim(),
        exercises: items.map((item, idx) => ({
          id: uuidv4(),
          exerciseId: item.exerciseId,
          order: idx,
          sectionTitle: item.sectionTitle.trim() || null,
          defaultRestSeconds: item.defaultRestSeconds || 120,
          sets: item.sets.map((s) => ({
            id: uuidv4(),
            type: s.type,
            quantity: parseInt(s.quantity) || 1,
            repsRange: String(s.repsRange).trim() || '??',
          })),
        })),
      }

      if (isEditing) {
        await updateTemplate(id, payload)
      } else {
        await createTemplate({ id: uuidv4(), ...payload })
      }

      navigate('/training/templates')
    } catch (err) {
      setGlobalError(err.response?.data?.message || 'Erro ao salvar template')
    } finally {
      setSaving(false)
    }
  }

  // ── Picker ──────────────────────────────────────────────────────────────────

  const filteredExercises = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(pickerSearch.toLowerCase())
  )

  // ── Loading ─────────────────────────────────────────────────────────────────

  if (initLoading) {
    return (
      <>
        <PageHeader>
          <BackButton onClick={() => navigate(-1)}>←</BackButton>
          <Skeleton $height="28px" $width="200px" />
        </PageHeader>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Skeleton $height="48px" />
          <Skeleton $height="80px" />
          <Skeleton $height="80px" />
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader>
        <BackButton onClick={() => navigate(-1)} aria-label="Voltar">←</BackButton>
        <PageTitle>{isEditing ? 'Editar template' : 'Novo template'}</PageTitle>
      </PageHeader>

      <form onSubmit={handleSubmit} noValidate>
        {globalError && <GlobalError style={{ marginBottom: 16 }}>{globalError}</GlobalError>}

        <InputGroup>
          <Label htmlFor="tname">Nome do template</Label>
          <Input
            id="tname"
            placeholder="Ex: Mesociclo A"
            value={name}
            onChange={(e) => { setName(e.target.value); setNameError('') }}
            autoFocus={!isEditing}
          />
          {nameError && <ErrorText>{nameError}</ErrorText>}
        </InputGroup>

        <SectionLabel>Exercícios ({items.length})</SectionLabel>

        {items.map((item, idx) => {
          const isExpanded = expandedUid === item.uid
          const primaryMuscle = item.exercise?.muscleGroups?.[0]?.name
          return (
            <ExerciseItem key={item.uid}>
              <ExerciseHeader>
                <ExerciseInfo>
                  <ExerciseName>{item.exercise?.name}</ExerciseName>
                  <ExMeta>
                    {primaryMuscle && `${primaryMuscle} · `}{setsSummary(item.sets)}
                  </ExMeta>
                </ExerciseInfo>
                <IconBtn
                  type="button"
                  onClick={() => moveItem(item.uid, -1)}
                  disabled={idx === 0}
                  aria-label="Mover para cima"
                  title="Mover para cima"
                >
                  ↑
                </IconBtn>
                <IconBtn
                  type="button"
                  onClick={() => moveItem(item.uid, 1)}
                  disabled={idx === items.length - 1}
                  aria-label="Mover para baixo"
                  title="Mover para baixo"
                >
                  ↓
                </IconBtn>
                <IconBtn
                  type="button"
                  onClick={() => setExpandedUid(isExpanded ? null : item.uid)}
                  aria-label="Editar"
                  title="Editar séries"
                >
                  {isExpanded ? '▲' : '▼'}
                </IconBtn>
                <IconBtn
                  type="button"
                  data-danger
                  onClick={() => { removeItem(item.uid); if (isExpanded) setExpandedUid(null) }}
                  aria-label="Remover"
                >
                  ✕
                </IconBtn>
              </ExerciseHeader>

              {isExpanded && (
                <ExerciseBody>
                  <InputGroup style={{ gap: 4 }}>
                    <Label style={{ fontSize: '0.75rem' }}>Seção (ex: "Posterior")</Label>
                    <SectionInput
                      placeholder="Sem seção"
                      value={item.sectionTitle}
                      onChange={(e) => updateItemField(item.uid, 'sectionTitle', e.target.value)}
                    />
                  </InputGroup>

                  <InputGroup style={{ gap: 4 }}>
                    <Label style={{ fontSize: '0.75rem' }}>Tempo de descanso (segundos)</Label>
                    <SectionInput
                      type="text"
                      inputMode="numeric"
                      value={item.defaultRestSeconds === '' ? '' : String(item.defaultRestSeconds ?? 120)}
                      onChange={(e) => {
                        const val = e.target.value.trim()
                        if (val === '') {
                          updateItemField(item.uid, 'defaultRestSeconds', '')
                        } else {
                          const num = parseInt(val)
                          if (!isNaN(num) && num > 0) {
                            updateItemField(item.uid, 'defaultRestSeconds', num)
                          }
                        }
                      }}
                      placeholder="120"
                    />
                  </InputGroup>

                  <div>
                    <Label style={{ fontSize: '0.75rem', marginBottom: 6 }}>Séries</Label>
                    <SetsTable>
                      {item.sets.map((s) => (
                        <SetRow key={s.uid}>
                          <TypeSelect
                            value={s.type}
                            onChange={(e) => updateSet(item.uid, s.uid, 'type', e.target.value)}
                          >
                            <option value="warmup">Aquec.</option>
                            <option value="working">Trabalho</option>
                          </TypeSelect>
                          <SmallInput
                            type="number"
                            inputMode="numeric"
                            min="1"
                            max="20"
                            value={s.quantity}
                            onChange={(e) => updateSet(item.uid, s.uid, 'quantity', e.target.value)}
                            placeholder="Qtd"
                            style={{ flex: '0 0 56px' }}
                          />
                          <SmallInput
                            value={s.repsRange}
                            onChange={(e) => updateSet(item.uid, s.uid, 'repsRange', e.target.value)}
                            placeholder="8-12"
                            style={{ flex: 1 }}
                          />
                          <RemoveSetBtn
                            type="button"
                            onClick={() => removeSet(item.uid, s.uid)}
                            disabled={item.sets.length === 1}
                            aria-label="Remover série"
                          >
                            −
                          </RemoveSetBtn>
                        </SetRow>
                      ))}
                    </SetsTable>
                    <AddSetBtn type="button" onClick={() => addSet(item.uid)} style={{ marginTop: 8 }}>
                      + Adicionar série
                    </AddSetBtn>
                  </div>
                </ExerciseBody>
              )}
            </ExerciseItem>
          )
        })}

        <AddExerciseBtn type="button" onClick={() => setPickerOpen(true)}>
          + Adicionar exercício
        </AddExerciseBtn>

        <Button type="submit" $fullWidth disabled={saving} style={{ marginTop: 20 }}>
          {saving ? 'Salvando…' : isEditing ? 'Salvar alterações' : 'Criar template'}
        </Button>
      </form>

      {/* ── Exercise Picker ── */}
      {pickerOpen && (
        <Overlay onClick={() => { setPickerOpen(false); setPickerSearch('') }}>
          <Sheet onClick={(e) => e.stopPropagation()}>
            <SheetHeader>
              <SheetTitle>Adicionar exercício</SheetTitle>
              <CloseBtn onClick={() => { setPickerOpen(false); setPickerSearch('') }}>×</CloseBtn>
            </SheetHeader>
            <SearchWrapper>
              <Input
                placeholder="Buscar exercício…"
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                autoFocus
              />
            </SearchWrapper>
            <PickerList>
              {filteredExercises.length === 0 ? (
                <li style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Nenhum exercício encontrado
                </li>
              ) : (
                filteredExercises.map((ex) => (
                  <PickerItem key={ex.id} onClick={() => addExercise(ex)}>
                    <PickerName>{ex.name}</PickerName>
                    {ex.muscleGroups?.[0] && (
                      <PickerMeta>{ex.muscleGroups[0].name}</PickerMeta>
                    )}
                  </PickerItem>
                ))
              )}
            </PickerList>
          </Sheet>
        </Overlay>
      )}
    </>
  )
}
