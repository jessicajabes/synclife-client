import { useCallback, useEffect, useRef, useState } from 'react'
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
  &:active { background: var(--bg-secondary); }
`

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
`

const MuscleGroupGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const MuscleGroupChip = styled.button`
  padding: 6px 14px;
  border-radius: 99px;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid ${({ $selected }) => ($selected ? 'var(--color-primary)' : 'var(--border)')};
  background: ${({ $selected }) => ($selected ? 'color-mix(in srgb, var(--color-primary) 15%, transparent)' : 'var(--bg-secondary)')};
  color: ${({ $selected }) => ($selected ? 'var(--color-primary-dark)' : 'var(--text-secondary)')};
  min-height: 36px;
  transition: all 0.15s;
`

const HelpText = styled.p`
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin-top: -8px;
`

const GlobalError = styled.div`
  background: color-mix(in srgb, var(--color-danger) 12%, transparent);
  color: var(--color-danger);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  font-size: 0.875rem;
`

// ── Component ─────────────────────────────────────────────────────────────────

const INITIAL_FORM = { name: '', youtubeUrl: '', notes: '' }

export const ExerciseFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)

  const { muscleGroups, fetchMuscleGroups, exercises, createExercise, updateExercise } = useGymStore()

  const [form, setForm] = useState(INITIAL_FORM)
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState([])
  const [errors, setErrors] = useState({})
  const [globalError, setGlobalError] = useState('')
  const [loading, setLoading] = useState(false)
  const hasInitialized = useRef(false)

  // Memoize initial form setup to avoid setState in effect
  const initializeForm = useCallback(() => {
    if (isEditing && exercises.length > 0) {
      const existing = exercises.find((e) => e.id === id)
      if (existing) {
        setForm({
          name: existing.name,
          youtubeUrl: existing.youtubeUrl || '',
          notes: existing.notes || '',
        })
        setSelectedMuscleGroups(existing.muscleGroups.map((mg) => mg.id))
      }
    }
  }, [id, isEditing, exercises])

  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    fetchMuscleGroups()
    initializeForm()
  }, [initializeForm, fetchMuscleGroups])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setErrors((er) => ({ ...er, [name]: '' }))
    setGlobalError('')
  }

  const toggleMuscleGroup = (mgId) => {
    setSelectedMuscleGroups((prev) =>
      prev.includes(mgId) ? prev.filter((x) => x !== mgId) : [...prev, mgId]
    )
    setErrors((er) => ({ ...er, muscleGroups: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Nome é obrigatório'
    if (selectedMuscleGroups.length === 0) errs.muscleGroups = 'Selecione pelo menos um grupo muscular'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const payload = {
        name: form.name.trim(),
        muscleGroupIds: selectedMuscleGroups,
        ...(form.youtubeUrl && { youtubeUrl: form.youtubeUrl }),
        ...(form.notes && { notes: form.notes }),
      }

      if (isEditing) {
        await updateExercise(id, payload)
      } else {
        await createExercise({ id: uuidv4(), ...payload })
      }

      navigate('/exercises')
    } catch (err) {
      setGlobalError(err.response?.data?.message || 'Erro ao salvar exercício')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageHeader>
        <BackButton onClick={() => navigate(-1)} aria-label="Voltar">←</BackButton>
        <Title>{isEditing ? 'Editar exercício' : 'Novo exercício'}</Title>
      </PageHeader>

      <Form onSubmit={handleSubmit} noValidate>
        {globalError && <GlobalError>{globalError}</GlobalError>}

        <InputGroup>
          <Label htmlFor="name">Nome do exercício</Label>
          <Input
            id="name"
            name="name"
            placeholder="Ex: Stiff com barra livre"
            value={form.name}
            onChange={handleChange}
            autoFocus={!isEditing}
          />
          {errors.name && <ErrorText>{errors.name}</ErrorText>}
        </InputGroup>

        <InputGroup>
          <Label>Grupos musculares</Label>
          <HelpText>O primeiro selecionado será o primário (usado para substituição rápida).</HelpText>
          {muscleGroups.length === 0 ? (
            <Skeleton $height="36px" />
          ) : (
            <MuscleGroupGrid>
              {muscleGroups.map((mg) => (
                <MuscleGroupChip
                  key={mg.id}
                  type="button"
                  $selected={selectedMuscleGroups.includes(mg.id)}
                  onClick={() => toggleMuscleGroup(mg.id)}
                >
                  {mg.name}
                </MuscleGroupChip>
              ))}
            </MuscleGroupGrid>
          )}
          {errors.muscleGroups && <ErrorText>{errors.muscleGroups}</ErrorText>}
        </InputGroup>

        <InputGroup>
          <Label htmlFor="youtubeUrl">
            Link do YouTube <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>(opcional)</span>
          </Label>
          <Input
            id="youtubeUrl"
            name="youtubeUrl"
            type="url"
            inputMode="url"
            placeholder="https://youtube.com/watch?v=…"
            value={form.youtubeUrl}
            onChange={handleChange}
          />
        </InputGroup>

        <InputGroup>
          <Label htmlFor="notes">
            Observações <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>(opcional)</span>
          </Label>
          <Input
            as="textarea"
            id="notes"
            name="notes"
            placeholder="Dicas de execução, variações…"
            value={form.notes}
            onChange={handleChange}
            style={{ minHeight: 80, padding: '12px 14px', resize: 'vertical' }}
          />
        </InputGroup>

        <Button type="submit" $fullWidth disabled={loading} style={{ marginTop: 8 }}>
          {loading ? 'Salvando…' : isEditing ? 'Salvar alterações' : 'Criar exercício'}
        </Button>
      </Form>
    </>
  )
}
