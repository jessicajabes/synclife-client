import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import styled from 'styled-components'
import api from '../../../lib/axios'
import { toast } from '../../../lib/toast'
import { Button } from '../../../components/button'

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const PageTitle = styled.h2`
  font-size: 1.375rem;
  font-weight: 700;
  margin: 0 0 4px;
`

const Sub = styled.p`
  color: var(--text-secondary);
  font-size: 0.9375rem;
  margin: 0 0 20px;
`

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
`

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9375rem;
  box-sizing: border-box;
  width: 100%;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px var(--color-primary-alpha);
  }
`

const DateInput = styled(Input)`
  width: 100%;
  box-sizing: border-box;
  
  @media (max-width: 480px) {
    font-size: 16px;
    padding: 12px 12px;
    min-height: 44px;
    height: auto;
  }
`

const Textarea = styled.textarea`
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9375rem;
  resize: vertical;
  min-height: 80px;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px var(--color-primary-alpha);
  }
`

const QuestionContainer = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const QuestionLabel = styled.label`
  font-weight: 600;
  font-size: 0.9375rem;
  color: var(--text-primary);
  display: block;
`

const QuestionInput = styled(Input)`
  width: 100%;
`

const QuestionTextarea = styled(Textarea)`
  width: 100%;
`

const BooleanOptions = styled.div`
  display: flex;
  gap: 8px;
`

const BooleanButton = styled.button`
  flex: 1;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: ${props => props.selected ? 'var(--color-primary)' : 'var(--bg-secondary)'};
  color: ${props => props.selected ? 'white' : 'var(--text-primary)'};
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s;

  &:active {
    opacity: 0.7;
  }
`

const ScaleContainer = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-start;
`

const ScaleButton = styled.button`
  width: 36px;
  height: 36px;
  min-height: 36px;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: ${props => props.selected ? 'var(--color-primary)' : 'var(--bg-secondary)'};
  color: ${props => props.selected ? 'white' : 'var(--text-primary)'};
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s;

  &:active {
    opacity: 0.7;
  }
`

const TimeInput = styled(Input)`
  width: 100%;
  box-sizing: border-box;
  
  @media (max-width: 480px) {
    font-size: 16px;
    padding: 12px 12px;
    min-height: 44px;
    height: auto;
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
`

const CancelButton = styled.button`
  flex: 1;
  min-height: 44px;
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.9375rem;
  border: none;
  cursor: pointer;

  &:active {
    opacity: 0.7;
  }
`

export function CheckinEditPage() {
  const { entryId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const initialDate = searchParams.get('date')
  const isNew = !entryId
  
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [notes, setNotes] = useState('')
  const [selectedDate, setSelectedDate] = useState(initialDate || getTodayDate())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Get today's date in YYYY-MM-DD format
  function getTodayDate() {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch questions
        const questionsRes = await api.get('/checkin/questions')
        setQuestions(questionsRes.data)

        // If editing (not creating new), fetch existing entry
        if (!isNew && selectedDate) {
          try {
            const entryRes = await api.get(`/checkin/entries/${selectedDate}`)
            const entryData = entryRes.data

            if (entryData) {
              const answerMap = {}
              entryData.answers.forEach((answer) => {
                const value =
                  answer.value_number ||
                  answer.value_text ||
                  answer.value_boolean ||
                  answer.value_scale ||
                  answer.value_time
                answerMap[answer.question_id] = value
              })
              setAnswers(answerMap)
              setNotes(entryData.notes || '')
            }
          } catch {
            // Entry doesn't exist yet for this date, start with empty form
            setAnswers({})
            setNotes('')
          }
        }
      } catch (error) {
        toast.error(error.message || 'Erro ao carregar dados')
        navigate('/history')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isNew, selectedDate, navigate])

  const handleSave = async () => {
    if (!selectedDate) {
      toast.error('Selecione uma data')
      return
    }

    try {
      setSaving(true)

      const payload = {
        date: selectedDate,
        answers: questions.map((q) => ({
          question_id: q.id,
          value: answers[q.id] ?? null,
        })),
        notes: notes.trim(),
      }

      await api.post('/checkin/entries', payload)
      toast.success('Check-in salvo!')
      navigate('/history')
    } catch (error) {
      toast.error(error.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <PageTitle>{isNew ? 'Novo Check-in' : 'Editar Check-in'}</PageTitle>
        <Sub>Carregando...</Sub>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageTitle>{isNew ? 'Novo Check-in' : 'Editar Check-in'}</PageTitle>
      <Sub>{isNew ? 'Registre um check-in' : 'Atualize suas respostas'}</Sub>

      <FormContainer>
        <FieldGroup>
          <Label>Data *</Label>
          <DateInput
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </FieldGroup>

        {questions.map((question) => {
          const { id, label, field_type, unit } = question
          const value = answers[id] ?? ''

          return (
            <QuestionContainer key={id}>
              <QuestionLabel>{label}</QuestionLabel>

              {field_type === 'number' && (
                <QuestionInput
                  type="number"
                  step="0.01"
                  value={value}
                  onChange={(e) => setAnswers({ ...answers, [id]: e.target.value })}
                  placeholder={`Digite um número${unit ? ` (${unit})` : ''}`}
                />
              )}

              {field_type === 'text' && (
                <QuestionTextarea
                  value={value}
                  onChange={(e) => setAnswers({ ...answers, [id]: e.target.value })}
                  placeholder="Digite sua resposta"
                />
              )}

              {field_type === 'boolean' && (
                <BooleanOptions>
                  <BooleanButton
                    selected={value === true || value === 'true'}
                    onClick={() => setAnswers({ ...answers, [id]: true })}
                  >
                    Sim
                  </BooleanButton>
                  <BooleanButton
                    selected={value === false || value === 'false'}
                    onClick={() => setAnswers({ ...answers, [id]: false })}
                  >
                    Não
                  </BooleanButton>
                </BooleanOptions>
              )}

              {field_type === 'scale' && (
                <ScaleContainer>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <ScaleButton
                      key={num}
                      selected={value === num || value === String(num)}
                      onClick={() => setAnswers({ ...answers, [id]: num })}
                    >
                      {num}
                    </ScaleButton>
                  ))}
                </ScaleContainer>
              )}

              {field_type === 'time' && (
                <TimeInput
                  type="time"
                  value={value}
                  onChange={(e) => setAnswers({ ...answers, [id]: e.target.value })}
                />
              )}
            </QuestionContainer>
          )
        })}

        <FieldGroup>
          <Label>Notas</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Adicione observações sobre seu dia (opcional)"
          />
        </FieldGroup>

        <ButtonGroup>
          <CancelButton onClick={() => navigate('/history')}>
            Cancelar
          </CancelButton>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? '...' : '✓ Salvar'}
          </Button>
        </ButtonGroup>
      </FormContainer>
    </PageContainer>
  )
}
