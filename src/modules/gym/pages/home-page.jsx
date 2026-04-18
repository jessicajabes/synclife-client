import styled from 'styled-components'
import { useAuthStore } from '../../../store/auth-store'

const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Greeting = styled.h2`
  font-size: 1.375rem;
  font-weight: 700;
`

const Sub = styled.p`
  color: var(--text-secondary);
  font-size: 0.9375rem;
  margin-top: -8px;
`

const ComingSoon = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 32px 16px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9375rem;
`

export const HomePage = () => {
  const user = useAuthStore((s) => s.user)
  const firstName = user?.name?.split(' ')[0] || 'Atleta'

  return (
    <Page>
      <div>
        <Greeting>Olá, {firstName}! 💪</Greeting>
        <Sub>Treino de hoje</Sub>
      </div>

      <ComingSoon>
        <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: 8 }}>🏗️</span>
        Tela de treino do dia chegando na Fase 5.<br />
        Por enquanto, acesse <strong>Exercícios</strong> para gerenciar o catálogo.
      </ComingSoon>
    </Page>
  )
}
