import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { DailyCheckinForm } from '../components/daily-checkin-form'
import { CheckinSettings } from '../components/checkin-settings'
import { CheckinQuestionsList } from '../components/checkin-questions-list'

const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
`

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const PageTitle = styled.h2`
  font-size: 1.375rem;
  font-weight: 700;
  margin: 0;
`

const ToggleButtons = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
`

const ToggleButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 12px;
  background: ${props => props.active ? 'var(--color-primary)' : 'transparent'};
  color: ${props => props.active ? 'white' : 'var(--text-primary)'};
  border: ${props => props.active ? 'none' : '1px solid var(--border)'};
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;

  &:hover, &:active {
    opacity: 0.9;
  }
`

const NewCheckInBtn = styled.button`
  min-height: 40px;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: all 0.15s;

  &:active {
    opacity: 0.8;
  }
`

export function CheckinPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('checkin') // 'checkin' | 'settings' | 'history'

  return (
    <div>
      <PageHeader>
        <HeaderTop>
          <PageTitle>
            {mode === 'checkin' ? '✅ Check-in de hoje' : mode === 'settings' ? '⚙ Configurar perguntas' : '📊 Evolução'}
          </PageTitle>
        </HeaderTop>
        <ToggleButtons>
          <ToggleButton active={mode === 'checkin'} onClick={() => setMode('checkin')}>
            ✅ Check-in
          </ToggleButton>
          <ToggleButton active={mode === 'history'} onClick={() => setMode('history')}>
            📊 Evolução
          </ToggleButton>
          <ToggleButton active={mode === 'settings'} onClick={() => setMode('settings')}>
            ⚙ Configurar
          </ToggleButton>
        </ToggleButtons>
        {mode === 'checkin' && (
          <NewCheckInBtn onClick={() => navigate('/checkin/new')}>
            + Novo Check-in
          </NewCheckInBtn>
        )}
      </PageHeader>

      {mode === 'checkin' && <DailyCheckinForm onConfigure={() => setMode('settings')} />}
      {mode === 'settings' && <CheckinSettings />}
      {mode === 'history' && <CheckinQuestionsList />}
    </div>
  )
}
