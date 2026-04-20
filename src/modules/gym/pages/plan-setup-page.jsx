import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import styled from 'styled-components'
import { useGymStore } from '../store'
import { Button } from '../../../components/button'
import { Input, InputGroup, Label } from '../../../components/input'
import { toast } from '../../../lib/toast'
import { useConfirm } from '../../../components/confirm-dialog'

// ── Styles ────────────────────────────────────────────────────────────────────

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
`

const BackButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  &:active { background: var(--bg-secondary); }
`

const PageTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
`

const ModeToggle = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
`

const ModeBtn = styled.button`
  flex: 1;
  min-height: 44px;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  border: 2px solid ${({ $active }) => ($active ? 'var(--color-primary)' : 'var(--border)')};
  background: ${({ $active }) => ($active ? 'color-mix(in srgb, var(--color-primary) 15%, transparent)' : 'var(--bg-secondary)')};
  color: ${({ $active }) => ($active ? 'var(--color-primary-dark)' : 'var(--text-secondary)')};
  transition: all 0.15s;
`

const SectionLabel = styled.p`
  font-size: 0.8125rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  margin: 16px 0 10px;
`

const DayRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
`

const DayLabel = styled.span`
  font-size: 0.9375rem;
  font-weight: 500;
  width: 52px;
  flex-shrink: 0;
`

const TemplateSelect = styled.select`
  flex: 1;
  min-height: 44px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.9375rem;
  outline: none;
  &:focus { border-color: var(--color-primary); }
`

const SequenceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const SequenceItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 10px 12px;
`

const SeqNum = styled.span`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--bg-secondary);
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--text-secondary);
`

const RemoveBtn = styled.button`
  width: 32px;
  height: 32px;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-danger);
  font-size: 1rem;
  flex-shrink: 0;
`

const AddSeqBtn = styled.button`
  width: 100%;
  min-height: 44px;
  border: 2px dashed var(--border);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
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
  margin-bottom: 16px;
`

// ── Constants ─────────────────────────────────────────────────────────────────

const DAYS = [
  { key: 'monday',    label: 'Seg' },
  { key: 'tuesday',   label: 'Ter' },
  { key: 'wednesday', label: 'Qua' },
  { key: 'thursday',  label: 'Qui' },
  { key: 'friday',    label: 'Sex' },
  { key: 'saturday',  label: 'Sáb' },
  { key: 'sunday',    label: 'Dom' },
]

// ── Component ─────────────────────────────────────────────────────────────────

export const PlanSetupPage = () => {
  const navigate = useNavigate()
  const { templates, fetchTemplates, activePlan, fetchPlans, createPlan, updatePlan, deletePlan } = useGymStore()
  const { confirm, ConfirmDialog } = useConfirm()

  const [mode, setMode] = useState('weekly')
  const [name, setName] = useState('Meu Plano')
  const [weekMap, setWeekMap] = useState({})
  const [sequence, setSequence] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTemplates()
    fetchPlans()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (activePlan) {
      setMode(activePlan.mode)
      setName(activePlan.name)
      setWeekMap(activePlan.weekMap || {})
      setSequence(
        (activePlan.sequence || []).map((item) => ({
          uid: uuidv4(),
          rest: item.rest ?? false,
          templateId: item.templateId ?? '',
        }))
      )
    }
  }, [activePlan])
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleWeekDay = (day, value) => {
    setWeekMap((prev) => ({ ...prev, [day]: value || undefined }))
  }

  const addToSequence = (templateId) => {
    setSequence((prev) => [...prev, { uid: uuidv4(), rest: false, templateId }])
  }

  const addRestToSequence = () => {
    setSequence((prev) => [...prev, { uid: uuidv4(), rest: true, templateId: '' }])
  }

  const removeFromSequence = (uid) => {
    setSequence((prev) => prev.filter((s) => s.uid !== uid))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) { setError('Nome é obrigatório'); return }

    const weekMapClean = Object.fromEntries(
      Object.entries(weekMap).filter(([, v]) => v)
    )
    const sequenceClean = sequence.map((s) =>
      s.rest ? { rest: true } : { templateId: s.templateId }
    )

    if (mode === 'weekly' && Object.keys(weekMapClean).length === 0) {
      setError('Configure pelo menos um dia na semana')
      return
    }
    if (mode === 'sequential' && sequenceClean.length === 0) {
      setError('Adicione pelo menos um treino na sequência')
      return
    }

    setSaving(true)
    setError('')
    try {
      const payload = {
        name: name.trim(),
        mode,
        startDate: new Date().toISOString(),
        ...(mode === 'weekly' && { weekMap: weekMapClean }),
        ...(mode === 'sequential' && { sequence: sequenceClean }),
      }

      if (activePlan) {
        await updatePlan(activePlan.id, payload)
      } else {
        await createPlan({ id: uuidv4(), ...payload })
      }

      toast.success('Plano salvo!')
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar plano')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!activePlan) return
    const ok = await confirm('Excluir plano ativo? Esta ação não pode ser desfeita.')
    if (!ok) return
    try {
      await deletePlan(activePlan.id)
      toast.success('Plano excluído')
      navigate('/')
    } catch {
      toast.error('Erro ao excluir plano')
    }
  }

  return (
    <>
      <PageHeader>
        <BackButton onClick={() => navigate('/')} aria-label="Voltar">←</BackButton>
        <PageTitle>Plano de treino</PageTitle>
      </PageHeader>

      <form onSubmit={handleSubmit} noValidate>
        {error && <GlobalError>{error}</GlobalError>}

        <InputGroup>
          <Label htmlFor="pname">Nome do plano</Label>
          <Input
            id="pname"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Mesociclo A"
          />
        </InputGroup>

        <SectionLabel>Modo</SectionLabel>
        <ModeToggle>
          <ModeBtn type="button" $active={mode === 'weekly'} onClick={() => setMode('weekly')}>
            Semanal fixo
          </ModeBtn>
          <ModeBtn type="button" $active={mode === 'sequential'} onClick={() => setMode('sequential')}>
            Sequência cíclica
          </ModeBtn>
        </ModeToggle>

        {mode === 'weekly' && (
          <>
            <SectionLabel>Treino por dia da semana</SectionLabel>
            {DAYS.map(({ key, label }) => (
              <DayRow key={key}>
                <DayLabel>{label}</DayLabel>
                <TemplateSelect
                  value={weekMap[key] || ''}
                  onChange={(e) => handleWeekDay(key, e.target.value)}
                >
                  <option value="">Descanso</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </TemplateSelect>
              </DayRow>
            ))}
          </>
        )}

        {mode === 'sequential' && (
          <>
            <SectionLabel>Sequência ({sequence.length} etapas)</SectionLabel>
            <SequenceList>
              {sequence.map((item, idx) => (
                <SequenceItem key={item.uid}>
                  <SeqNum>{idx + 1}</SeqNum>
                  {item.rest ? (
                    <span style={{ flex: 1, color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                      💤 Descanso
                    </span>
                  ) : (
                    <TemplateSelect
                      style={{ border: 'none', background: 'transparent', padding: '0' }}
                      value={item.templateId}
                      onChange={(e) =>
                        setSequence((prev) =>
                          prev.map((s) => s.uid === item.uid ? { ...s, templateId: e.target.value } : s)
                        )
                      }
                    >
                      <option value="">Selecionar treino…</option>
                      {templates.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </TemplateSelect>
                  )}
                  <RemoveBtn type="button" onClick={() => removeFromSequence(item.uid)}>✕</RemoveBtn>
                </SequenceItem>
              ))}
            </SequenceList>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <AddSeqBtn
                type="button"
                style={{ flex: 2 }}
                onClick={() => addToSequence(templates[0]?.id || '')}
              >
                + Treino
              </AddSeqBtn>
              <AddSeqBtn type="button" style={{ flex: 1 }} onClick={addRestToSequence}>
                + Descanso
              </AddSeqBtn>
            </div>
          </>
        )}

        <Button type="submit" $fullWidth disabled={saving} style={{ marginTop: 24 }}>
          {saving ? 'Salvando…' : activePlan ? 'Salvar alterações' : 'Criar plano'}
        </Button>

        {activePlan && (
          <Button
            type="button"
            $variant="danger"
            $fullWidth
            onClick={handleDelete}
            style={{ marginTop: 8 }}
          >
            Excluir plano
          </Button>
        )}
      </form>
      {ConfirmDialog}
    </>
  )
}
