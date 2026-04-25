import { useState, useEffect } from 'react'
import styled from 'styled-components'
import api from '../../../lib/axios'
import { toast } from '../../../lib/toast'

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

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px var(--color-primary-alpha);
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

const FieldValue = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const NumberInput = styled(Input)`
  flex: 1;
`

const Unit = styled.span`
  font-size: 0.8125rem;
  color: var(--text-secondary);
  font-weight: 500;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`

const Button = styled.button`
  flex: 1;
  padding: 5px 6px;
  border: 1px solid ${props => props.selected ? 'var(--color-primary)' : 'var(--border)'};
  border-radius: var(--radius-md);
  background: ${props => props.selected ? 'var(--color-primary)' : 'var(--bg-card)'};
  color: ${props => props.selected ? 'white' : 'var(--text-primary)'};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;

  &:hover, &:active {
    background: ${props => props.selected ? 'var(--color-primary-dark)' : 'var(--bg-secondary)'};
  }
`

const ScaleButton = styled(Button)`
  flex: 0 1 calc(20% - 6.4px);
`

const SaveButton = styled.button`
  padding: 12px 16px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;

  &:hover, &:active {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);

  p {
    margin: 12px 0 20px;
    line-height: 1.5;
  }
`

const Button2 = styled.button`
  padding: 5px 6px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;

  &:hover, &:active {
    opacity: 0.9;
  }
`

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  color: var(--text-secondary);
`

export function DailyCheckinForm({ onConfigure }) {
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Get today's date in local timezone (not UTC)
  const today = (() => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })()

  // Load questions and existing responses
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch active questions
        const questionsRes = await api.get('/checkin/questions')
        const questionsData = questionsRes.data
        setQuestions(questionsData)

        // Fetch today's entry
        const entryRes = await api.get(`/checkin/entries/${today}`)
        const entryData = entryRes.data

        if (entryData) {
          // Pre-fill answers
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
      } catch (error) {
        toast.error(error.message || 'Erro ao carregar dados')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [today])

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      const payload = {
        date: today,
        notes: notes.trim() || null,
        answers: Object.entries(answers)
          .filter(([, value]) => value !== null && value !== undefined && value !== '')
          .map(([questionId, value]) => ({
            question_id: questionId,
            value,
          })),
      }

      await api.post('/checkin/entries', payload)
      toast.success('✓ Check-in salvo com sucesso!')
    } catch (error) {
      toast.error(error.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <LoadingContainer>Carregando...</LoadingContainer>
  }

  if (questions.length === 0) {
    return (
      <EmptyState>
        <span style={{ fontSize: '3rem' }}>📋</span>
        <p>Você ainda não tem perguntas configuradas.</p>
        <Button2 onClick={onConfigure}>Criar perguntas</Button2>
      </EmptyState>
    )
  }

  return (
    <FormContainer>
      {questions.map((question) => (
        <FieldGroup key={question.id}>
          <Label>{question.label}</Label>

          {question.field_type === 'number' && (
            <FieldValue>
              <NumberInput
                type="number"
                step="0.01"
                placeholder="0"
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              />
              {question.unit && <Unit>{question.unit}</Unit>}
            </FieldValue>
          )}

          {question.field_type === 'text' && (
            <FieldValue>
              <Input
                type="text"
                placeholder="Digite sua resposta"
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              />
              {question.unit && <Unit>{question.unit}</Unit>}
            </FieldValue>
          )}

          {question.field_type === 'boolean' && (
            <ButtonGroup>
              <Button
                selected={answers[question.id] === true}
                onClick={() => handleAnswerChange(question.id, true)}
              >
                Sim
              </Button>
              <Button
                selected={answers[question.id] === false}
                onClick={() => handleAnswerChange(question.id, false)}
              >
                Não
              </Button>
            </ButtonGroup>
          )}

          {question.field_type === 'scale' && (
            <ButtonGroup>
              {[1, 2, 3, 4, 5].map((value) => (
                <ScaleButton
                  key={value}
                  selected={answers[question.id] === value}
                  onClick={() => handleAnswerChange(question.id, value)}
                >
                  {value}
                </ScaleButton>
              ))}
            </ButtonGroup>
          )}

          {question.field_type === 'time' && (
            <FieldValue>
              <Input
                type="time"
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              />
            </FieldValue>
          )}
        </FieldGroup>
      ))}

      <FieldGroup>
        <Label>Notas (opcional)</Label>
        <Textarea
          placeholder="Adicione observações sobre seu dia..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </FieldGroup>

      <SaveButton onClick={handleSave} disabled={saving}>
        {saving ? 'Salvando...' : '💾 Salvar'}
      </SaveButton>
    </FormContainer>
  )
}
