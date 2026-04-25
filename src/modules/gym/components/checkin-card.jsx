import { useState } from 'react'
import styled from 'styled-components'
import api from '../../../lib/axios'
import { toast } from '../../../lib/toast'
import { useConfirm } from '../../../components/confirm-dialog'

const CardContainer = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  margin-bottom: 10px;
  overflow: hidden;
`

const CardTop = styled.button`
  width: 100%;
  text-align: left;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  &:active {
    background: var(--bg-secondary);
  }
`

const DateBadge = styled.div`
  flex-shrink: 0;
  width: 44px;
  text-align: center;

  span:first-child {
    display: block;
    font-size: 1.25rem;
    font-weight: 800;
    line-height: 1;
    color: var(--color-primary-dark);
  }

  span:last-child {
    display: block;
    font-size: 0.6875rem;
    text-transform: uppercase;
    color: var(--text-secondary);
    font-weight: 600;
  }
`

const CardInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const Title = styled.p`
  font-weight: 700;
  font-size: 0.9375rem;
  color: var(--text-primary);
  margin: 0;
`

const MetaRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 3px;
  flex-wrap: wrap;
`

const MetaItem = styled.span`
  font-size: 0.75rem;
  color: var(--text-secondary);
`

const TypeBadge = styled.span`
  display: inline-block;
  font-size: 0.75rem;
  padding: 4px 8px;
  background: #e0f2fe;
  color: #0369a1;
  border-radius: 4px;
  font-weight: 600;
`

const ChevronIcon = styled.span`
  font-size: 0.875rem;
  color: var(--text-secondary);
  transition: transform 0.2s;
  transform: ${({ $open }) => ($open ? 'rotate(180deg)' : 'rotate(0deg)')};
  flex-shrink: 0;
`

const CardContent = styled.div`
  border-top: 1px solid var(--border);
  padding: 12px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const AnswerRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 0.9375rem;

  strong {
    color: var(--text-primary);
    font-weight: 600;
    min-width: 120px;
    flex-shrink: 0;
  }

  span {
    color: var(--text-secondary);
  }

  &.inactive {
    opacity: 0.7;

    strong {
      text-decoration: line-through;
    }
  }
`

const NotesText = styled.p`
  margin: 8px 0 0;
  padding-top: 8px;
  border-top: 1px solid var(--border);
  font-size: 0.8125rem;
  color: var(--text-secondary);
  line-height: 1.5;
  font-style: italic;
`

const CardActions = styled.div`
  display: flex;
  gap: 6px;
  padding: 8px 14px;
  border-top: 1px solid var(--border);
  background: var(--bg-secondary);
`

const ActionBtn = styled.button`
  flex: 1;
  min-height: 36px;
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  font-weight: 600;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: ${({ $danger }) =>
    $danger ? 'var(--color-danger)' : 'var(--text-primary)'};
  cursor: pointer;
  transition: all 0.15s;
  
  &:active {
    opacity: 0.7;
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`


const formatDate = (dateString) => {
  // Parse date string in local timezone (YYYY-MM-DD format from backend)
  const [year, month, day] = dateString.split('T')[0].split('-')
  const monthName = new Date(year, month - 1, day).toLocaleDateString('pt-BR', { month: 'short' })
  return { day: parseInt(day, 10), month: monthName }
}

const formatAnswer = (answer) => {
  const { question, value_number, value_text, value_boolean, value_scale, value_time } = answer
  const { label, field_type, unit, is_active } = question

  let displayValue = ''

  if (field_type === 'number' && value_number !== null) {
    displayValue = `${parseFloat(value_number).toFixed(2)}${unit ? ` ${unit}` : ''}`
  } else if (field_type === 'text' && value_text !== null) {
    displayValue = `${value_text}${unit ? ` ${unit}` : ''}`
  } else if (field_type === 'boolean' && value_boolean !== null) {
    displayValue = value_boolean ? 'Sim' : 'Não'
  } else if (field_type === 'scale' && value_scale !== null) {
    displayValue = `${value_scale} / 5`
  } else if (field_type === 'time' && value_time !== null) {
    displayValue = value_time
  }

  return { label, displayValue, is_active }
}

export function CheckinCard({ data, onEdit, onDelete }) {
  const { confirm, ConfirmDialog } = useConfirm()
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { date, answers, notes, id } = data
  const { day, month } = formatDate(date)

  const handleDelete = async () => {
    const confirmed = await confirm(
      'Tem certeza que deseja excluir este check-in? Esta ação não pode ser desfeita.',
      'Excluir Check-in'
    )

    if (!confirmed) return

    try {
      setIsDeleting(true)
      await api.delete(`/checkin/entries/${id}`)
      toast.success('✓ Check-in excluído!')
      onDelete?.(id)
    } catch (error) {
      toast.error(error.message || 'Erro ao excluir check-in')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <CardContainer>
      {ConfirmDialog}
      <CardTop onClick={() => setIsOpen(!isOpen)}>
        <DateBadge>
          <span>{day}</span>
          <span>{month}</span>
        </DateBadge>
        <CardInfo>
          <Title>Check-in de saúde</Title>
          <MetaRow>
            {answers.length > 0 && (
              <MetaItem>{answers.length} respost{answers.length === 1 ? 'a' : 'as'}</MetaItem>
            )}
          </MetaRow>
        </CardInfo>
        <ChevronIcon $open={isOpen}>▼</ChevronIcon>
      </CardTop>

      {isOpen && answers.length > 0 && (
        <CardContent>
          {answers.map((answer, idx) => {
            const { label, displayValue, is_active } = formatAnswer(answer)
            return (
              <AnswerRow key={idx} className={!is_active ? 'inactive' : ''}>
                <strong>{label}:</strong>
                <span>{displayValue}</span>
              </AnswerRow>
            )
          })}

          {notes && <NotesText>📝 {notes}</NotesText>}
        </CardContent>
      )}

      <CardActions>
        <ActionBtn onClick={() => onEdit?.(data)}>
          ✏️ Editar
        </ActionBtn>
        <ActionBtn $danger onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? '...' : '🗑 Excluir'}
        </ActionBtn>
      </CardActions>
    </CardContainer>
  )
}
