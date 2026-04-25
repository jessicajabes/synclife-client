import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import api from '../../../lib/axios'
import { toast } from '../../../lib/toast'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const QuestionCard = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: var(--color-primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &:active {
    background: var(--bg-secondary);
  }
`

const QuestionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`

const QuestionLabel = styled.h3`
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`

const QuestionMeta = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 0.75rem;
  color: var(--text-secondary);
`

const TypeBadge = styled.span`
  font-size: 0.75rem;
  padding: 3px 8px;
  background: var(--color-primary-alpha);
  color: var(--color-primary);
  border-radius: 4px;
  font-weight: 600;
`

const ArrowIcon = styled.span`
  font-size: 1.25rem;
  color: var(--text-secondary);
`

const LoadingContainer = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
`

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);

  p {
    margin: 12px 0;
    line-height: 1.5;
  }
`

const fieldTypeLabels = {
  number: 'Número',
  text: 'Texto',
  boolean: 'Sim / Não',
  scale: 'Escala 1–5',
}

export function CheckinQuestionsList() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true)
        const res = await api.get('/checkin/questions')
        setQuestions(res.data)
      } catch (error) {
        toast.error(error.message || 'Erro ao carregar perguntas')
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [])

  const handleViewEvolution = (questionId) => {
    navigate(`/checkin/questions/${questionId}/evolution`)
  }

  if (loading) {
    return <LoadingContainer>Carregando...</LoadingContainer>
  }

  if (questions.length === 0) {
    return (
      <EmptyState>
        <span style={{ fontSize: '3rem' }}>📋</span>
        <p>Você ainda não tem perguntas configuradas.</p>
      </EmptyState>
    )
  }

  return (
    <Container>
      {questions.map((q) => (
        <QuestionCard
          key={q.id}
          onClick={() => handleViewEvolution(q.id)}
          title="Ver evolução"
        >
          <QuestionInfo>
            <QuestionLabel>{q.label}</QuestionLabel>
            <QuestionMeta>
              <TypeBadge>{fieldTypeLabels[q.field_type]}</TypeBadge>
              {q.unit && <span>{q.unit}</span>}
            </QuestionMeta>
          </QuestionInfo>
          <ArrowIcon>→</ArrowIcon>
        </QuestionCard>
      ))}
    </Container>
  )
}
