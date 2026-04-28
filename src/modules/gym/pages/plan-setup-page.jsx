import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import styled from 'styled-components'
import { useGymStore } from '../store'
import { Button } from '../../../components/button'
import { Input, InputGroup, Label } from '../../../components/input'
import { toast } from '../../../lib/toast'
import { useConfirm } from '../../../components/confirm-dialog'
import { PageHeader } from '../components/page-header'

// ── Styles ────────────────────────────────────────────────────────────────────

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const PlansListSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const PlanCard = styled.div`
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const PlanHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
`

const PlanInfo = styled.div`
  flex: 1;
`

const PlanName = styled.strong`
  font-size: 1rem;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 6px;
`

const ActiveBadge = styled.span`
  background: var(--color-success, #10b981);
  color: white;
  font-size: 0.65rem;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 700;
  text-transform: uppercase;
`

const PlanMeta = styled.small`
  color: var(--text-secondary);
  font-size: 0.8125rem;
  margin-top: 2px;
  display: block;
`

const PlanActions = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`

const ActionBtn = styled.button`
  flex: 1;
  min-width: 70px;
  min-height: 32px;
  font-size: 0.75rem;
  border-radius: 4px;
  border: 1px solid ${(props) => {
    if (props.$variant === 'danger') return 'var(--color-danger)';
    if (props.$variant === 'primary') return 'var(--color-primary)';
    return 'var(--border-color)';
  }};
  background: ${(props) => {
    if (props.$variant === 'danger') return 'transparent';
    if (props.$variant === 'primary') return 'color-mix(in srgb, var(--color-primary) 15%, transparent)';
    return 'transparent';
  }};
  color: ${(props) => {
    if (props.$variant === 'danger') return 'var(--color-danger)';
    if (props.$variant === 'primary') return 'var(--color-primary)';
    return 'var(--text-secondary)';
  }};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: scale(0.97);
  }
`

const NewPlanBtn = styled(Button)`
  margin-bottom: 16px;
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

const FormSection = styled.div`
  background: var(--card-bg);
  border: 2px solid var(--color-primary);
  border-radius: 8px;
  padding: 16px;
  display: ${(props) => props.$show ? 'block' : 'none'};
  max-width: 100%;
  overflow-x: hidden;
  animation: slideDown 0.3s ease-out;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`

const FormHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
  
  h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-primary);
  }
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
  const { templates, plans, fetchTemplates, activePlan, fetchPlans, createPlan, updatePlan, deletePlan, setActivePlan } = useGymStore()
  const { confirm, ConfirmDialog } = useConfirm()

  const [editingPlanId, setEditingPlanId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [mode, setMode] = useState('weekly')
  const [name, setName] = useState('Meu Plano')
  const [weekMap, setWeekMap] = useState({})
  const [sequence, setSequence] = useState([])
  const [saving, setSaving] = useState(false)
  const [activating, setActivating] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTemplates()
    fetchPlans()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const resetForm = () => {
    setEditingPlanId(null)
    setShowForm(false)
    setMode('weekly')
    setName('Meu Plano')
    setWeekMap({})
    setSequence([])
    setError('')
  }

  const handleEditPlan = (plan) => {
    setEditingPlanId(plan.id)
    setShowForm(true)
    setMode(plan.mode)
    setName(plan.name)
    setWeekMap(plan.weekMap || {})
    setSequence(
      (plan.sequence || []).map((item) => ({
        uid: uuidv4(),
        rest: item.rest ?? false,
        templateId: item.templateId ?? '',
      }))
    )
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }

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

      if (editingPlanId) {
        await updatePlan(editingPlanId, payload)
      } else {
        const newPlan = await createPlan({ id: uuidv4(), ...payload })
        // Auto-activate new plan
        await setActivePlan(newPlan.id)
      }

      toast.success(editingPlanId ? 'Plano atualizado!' : 'Plano criado e ativado!')
      resetForm()
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar plano')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!editingPlanId) return
    const ok = await confirm('Excluir este plano? Esta ação não pode ser desfeita.')
    if (!ok) return
    try {
      await deletePlan(editingPlanId)
      toast.success('Plano excluído')
      resetForm()
    } catch {
      toast.error('Erro ao excluir plano')
    }
  }

  const handleActivatePlan = async (planId) => {
    setActivating(planId)
    try {
      await setActivePlan(planId)
      toast.success('Plano ativado!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao ativar plano')
    } finally {
      setActivating(null)
    }
  }

  return (
    <>
      <PageHeader title="Gerenciar Planos" subtitle="Crie, edite e ative seus planos de treino" />
      <Container>
        {/* List of existing plans */}
        <PlansListSection>
          <NewPlanBtn $fullWidth onClick={() => setShowForm(true)} style={{ marginBottom: 8 }}>
            + Novo Plano
          </NewPlanBtn>

          {plans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--text-secondary)' }}>
              <p>Nenhum plano criado ainda.</p>
              <small>Clique em "+ Novo Plano" para começar.</small>
            </div>
          ) : (
            plans.map((plan) => (
              <PlanCard key={plan.id}>
                <PlanHeader>
                  <PlanInfo>
                    <PlanName>
                      {plan.isActive && '✅'} {plan.name}
                      {plan.isActive && <ActiveBadge>Ativo</ActiveBadge>}
                    </PlanName>
                    <PlanMeta>
                      {plan.mode === 'weekly' ? `Semanal • ${Object.keys(plan.weekMap || {}).length} dias` : `Sequencial • ${(plan.sequence || []).length} etapas`}
                    </PlanMeta>
                    {plan.startDate && (
                      <PlanMeta>
                        Criado em: {new Date(plan.startDate).toLocaleDateString('pt-BR')}
                      </PlanMeta>
                    )}
                  </PlanInfo>
                </PlanHeader>
                <PlanActions>
                  <ActionBtn type="button" onClick={() => handleEditPlan(plan)}>
                    Editar
                  </ActionBtn>
                  {!plan.isActive && (
                    <ActionBtn
                      type="button"
                      $variant="primary"
                      onClick={() => handleActivatePlan(plan.id)}
                      disabled={activating === plan.id}
                    >
                      {activating === plan.id ? '…' : 'Ativar'}
                    </ActionBtn>
                  )}
                  <ActionBtn
                    type="button"
                    $variant="danger"
                    onClick={() => {
                      handleEditPlan(plan)
                      setTimeout(() => document.querySelector('[data-delete-btn]')?.focus(), 100)
                    }}
                  >
                    Deletar
                  </ActionBtn>
                </PlanActions>
              </PlanCard>
            ))
          )}
        </PlansListSection>

        {/* Form for creating/editing plan */}
        {showForm && (
          <FormSection $show={true}>
            <FormHeader>
              <h3>{editingPlanId ? '✏️ Editar Plano' : '➕ Novo Plano'}</h3>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  padding: 0,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Fechar"
              >
                ✕
              </button>
            </FormHeader>
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
              {saving ? 'Salvando…' : editingPlanId ? 'Salvar alterações' : 'Criar plano'}
            </Button>

            <Button
              type="button"
              $variant="ghost"
              $fullWidth
              onClick={resetForm}
              style={{ marginTop: 8 }}
            >
              Cancelar
            </Button>

            {editingPlanId && (
              <Button
                type="button"
                $variant="danger"
                $fullWidth
                onClick={handleDelete}
                style={{ marginTop: 8 }}
                data-delete-btn
              >
                Excluir plano
              </Button>
            )}
          </form>
        </FormSection>
        )}
      </Container>
      {ConfirmDialog}
    </>
  )
}
