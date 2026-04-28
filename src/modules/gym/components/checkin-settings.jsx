import { useState, useEffect } from 'react'
import styled from 'styled-components'
import api from '../../../lib/axios'
import { useConfirm } from '../../../components/confirm-dialog'
import { toast } from '../../../lib/toast'
import * as gymApi from '../api'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
`

const QuestionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const QuestionItem = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: space-between;
`

const QuestionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`

const DragHandle = styled.span`
  color: var(--text-secondary);
  cursor: grab;
  &:active {
    cursor: grabbing;
  }
`

const QuestionMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`

const QuestionLabel = styled.span`
  font-weight: 600;
  color: var(--text-primary);
`

const QuestionUnit = styled.span`
  font-size: 0.8125rem;
  color: var(--text-secondary);
`

const BadgeGroup = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`

const TypeBadge = styled.span`
  font-size: 0.75rem;
  padding: 3px 8px;
  background: var(--color-primary-alpha);
  color: var(--color-primary);
  border-radius: 4px;
  font-weight: 600;
`

const ActionButtons = styled.div`
  display: flex;
  gap: 6px;
`

const IconButton = styled.button`
  padding: 6px 10px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.15s;

  &:hover, &:active {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }

  &.delete {
    color: #ef4444;
    &:hover {
      border-color: #ef4444;
    }
  }
`

const Form = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
`

const FormLabel = styled.label`
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-primary);
`

const FormInput = styled.input`
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }
`

const FormSelect = styled.select`
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }
`

const AutocompleteList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-top: none;
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`

const AutocompleteItem = styled.button`
  width: 100%;
  padding: 10px 10px;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border);
  transition: background 0.15s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--bg-secondary);
  }

  &.inactive {
    color: var(--text-secondary);
    opacity: 0.7;
  }
`

const FormActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`

const Button = styled.button`
  flex: 1;
  padding: 10px 12px;
  background: ${props => props.primary ? 'var(--color-primary)' : 'transparent'};
  color: ${props => props.primary ? 'white' : 'var(--text-primary)'};
  border: ${props => props.primary ? 'none' : '1px solid var(--border)'};
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;

  &:hover, &:active {
    ${props => props.primary
      ? 'opacity: 0.9;'
      : 'background: var(--bg-secondary);'}
  }
`

const LoadingContainer = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
`

const fieldTypeLabels = {
  number: 'Número',
  text: 'Texto',
  boolean: 'Sim / Não',
  scale: 'Escala 1–5',
  time: 'Hora',
}

export function CheckinSettings() {
  const { confirm, ConfirmDialog } = useConfirm()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [newQuestion, setNewQuestion] = useState({
    label: '',
    field_type: 'number',
    unit: '',
  })
  const [creating, setCreating] = useState(false)

  // Load questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true)
        const res = await api.get('/checkin/questions')
        const data = res.data
        setQuestions(data)
      } catch (error) {
        toast.error(error.message || 'Erro ao carregar perguntas')
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [])

  const handleSearchSuggestions = async (value) => {
    setNewQuestion((prev) => ({ ...prev, label: value }))

    if (value.trim().length < 1) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      const res = await gymApi.searchCheckinQuestions(value)
      setSuggestions(res.data)
      setShowSuggestions(true)
    } catch (error) {
      console.error(error)
    }
  }

  const handleSelectSuggestion = async (suggestion) => {
    if (suggestion.is_active) {
      toast.error('Esta pergunta já está ativa')
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    // Activate the question
    try {
      await gymApi.activateCheckinQuestion(suggestion.id)
      toast.success('✓ Pergunta ativada com sucesso!')
      
      // Reload questions
      const questionsRes = await api.get('/checkin/questions')
      setQuestions(questionsRes.data)
      
      setNewQuestion({ label: '', field_type: 'number', unit: '' })
      setSuggestions([])
      setShowSuggestions(false)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao ativar pergunta')
    }
  }

  const handleCreateQuestion = async () => {
    if (!newQuestion.label.trim()) {
      toast.error('Digite o texto da pergunta')
      return
    }

    try {
      setCreating(true)
      const res = await api.post('/checkin/questions', {
        label: newQuestion.label.trim(),
        field_type: newQuestion.field_type,
        unit: newQuestion.unit.trim() || null,
      })

      const created = res.data
      setQuestions((prev) => [...prev, created])
      setNewQuestion({ label: '', field_type: 'number', unit: '' })
      setSuggestions([])
      setShowSuggestions(false)
      toast.success('✓ Pergunta criada!')
    } catch (error) {
      toast.error(error.message || 'Erro ao criar pergunta')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteQuestion = async (id) => {
    const confirmed = await confirm(
      'Esta pergunta não aparecerá mais no check-in diário. As respostas anteriores serão mantidas no histórico.',
      'Desativar pergunta'
    )

    if (!confirmed) return

    try {
      await api.delete(`/checkin/questions/${id}`)
      setQuestions((prev) => prev.filter((q) => q.id !== id))
      toast.success('✓ Pergunta desativada!')
    } catch (error) {
      toast.error(error.message || 'Erro ao desativar pergunta')
    }
  }

  const handleMoveUp = async (index) => {
    if (index === 0) return
    const newOrder = [...questions]
    const temp = newOrder[index - 1]
    newOrder[index - 1] = newOrder[index]
    newOrder[index] = temp
    
    const orders = newOrder.map((q, i) => ({
      id: q.id,
      order: i,
    }))

    try {
      await api.patch('/checkin/questions/reorder', orders)
      setQuestions(newOrder)
      toast.success('✓ Ordem atualizada!')
    } catch (error) {
      toast.error(error.message || 'Erro ao reordenar')
    }
  }

  const handleMoveDown = async (index) => {
    if (index === questions.length - 1) return
    const newOrder = [...questions]
    const temp = newOrder[index]
    newOrder[index] = newOrder[index + 1]
    newOrder[index + 1] = temp
    
    const orders = newOrder.map((q, i) => ({
      id: q.id,
      order: i,
    }))

    try {
      await api.patch('/checkin/questions/reorder', orders)
      setQuestions(newOrder)
      toast.success('✓ Ordem atualizada!')
    } catch (error) {
      toast.error(error.message || 'Erro ao reordenar')
    }
  }

  if (loading) {
    return <LoadingContainer>Carregando...</LoadingContainer>
  }

  return (
    <Container>
      <Section>
        <SectionTitle>Criar pergunta</SectionTitle>
        <Form>
          <FormGroup>
            <FormLabel>Texto da pergunta *</FormLabel>
            <FormInput
              type="text"
              placeholder="Ex: Peso, Humor, Qualidade do sono"
              value={newQuestion.label}
              onChange={(e) => handleSearchSuggestions(e.target.value)}
              onFocus={() => newQuestion.label && setShowSuggestions(true)}
            />
            {showSuggestions && suggestions.length > 0 && (
              <AutocompleteList>
                {suggestions.map((s) => (
                  <AutocompleteItem
                    key={s.id}
                    className={!s.is_active ? 'inactive' : ''}
                    onClick={() => handleSelectSuggestion(s)}
                  >
                    <strong>{s.label}</strong>
                    {s.unit && <span> ({s.unit})</span>}
                    {!s.is_active && <span style={{ marginLeft: '8px', opacity: 0.6 }}>— desativada</span>}
                  </AutocompleteItem>
                ))}
              </AutocompleteList>
            )}
          </FormGroup>

          <FormRow>
            <FormGroup>
              <FormLabel>Tipo *</FormLabel>
              <FormSelect
                value={newQuestion.field_type}
                onChange={(e) =>
                  setNewQuestion((prev) => ({ ...prev, field_type: e.target.value }))
                }
              >
                <option value="number">Número</option>
                <option value="text">Texto</option>
                <option value="boolean">Sim / Não</option>
                <option value="scale">Escala 1–5</option>
                <option value="time">Hora</option>
              </FormSelect>
            </FormGroup>

            {(newQuestion.field_type === 'number' ||
              newQuestion.field_type === 'text') && (
              <FormGroup>
                <FormLabel>Unidade (opcional)</FormLabel>
                <FormInput
                  type="text"
                  placeholder="Ex: kg, h, %"
                  value={newQuestion.unit}
                  onChange={(e) =>
                    setNewQuestion((prev) => ({ ...prev, unit: e.target.value }))
                  }
                />
              </FormGroup>
            )}
          </FormRow>

          <FormActions>
            <Button primary onClick={handleCreateQuestion} disabled={creating}>
              {creating ? 'Criando...' : '+ Criar pergunta'}
            </Button>
          </FormActions>
        </Form>
      </Section>

      <Section>
        <SectionTitle>
          {questions.length > 0
            ? `Suas perguntas (${questions.length})`
            : 'Nenhuma pergunta configurada'}
        </SectionTitle>

        {questions.length > 0 && (
          <QuestionList>
            {questions.map((q, idx) => (
              <QuestionItem key={q.id}>
                <QuestionInfo>
                  <DragHandle>⋮</DragHandle>
                  <QuestionMeta>
                    <QuestionLabel>{q.label}</QuestionLabel>
                    <BadgeGroup>
                      <TypeBadge>{fieldTypeLabels[q.field_type]}</TypeBadge>
                      {q.unit && <QuestionUnit>{q.unit}</QuestionUnit>}
                    </BadgeGroup>
                  </QuestionMeta>
                </QuestionInfo>

                <ActionButtons>
                  <IconButton onClick={() => handleMoveUp(idx)}>↑</IconButton>
                  <IconButton onClick={() => handleMoveDown(idx)}>↓</IconButton>
                  <IconButton
                    className="delete"
                    onClick={() => handleDeleteQuestion(q.id)}
                  >
                    🗑
                  </IconButton>
                </ActionButtons>
              </QuestionItem>
            ))}
          </QuestionList>
        )}
      </Section>
      {ConfirmDialog}
    </Container>
  )
}
