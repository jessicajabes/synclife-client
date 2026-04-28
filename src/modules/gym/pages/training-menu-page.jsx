import { useNavigate } from 'react-router-dom'
import { useGymStore } from '../store'
import { PageHeader } from '../components/page-header'
import styled from 'styled-components'

const Container = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const MenuGrid = styled.div`
  display: grid;
  gap: 12px;
`

const MenuCard = styled.button`
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px 16px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 8px;

  &:hover {
    background: var(--card-bg-hover, var(--card-bg));
    border-color: var(--color-primary);
  }

  &:active {
    transform: scale(0.98);
  }
`

const MenuIcon = styled.span`
  font-size: 1.75rem;
`

const MenuTitle = styled.strong`
  font-size: 1rem;
  color: var(--text-primary);
  display: block;
`

const MenuSubtitle = styled.small`
  font-size: 0.8125rem;
  color: var(--text-secondary);
`

const ActivePlanSection = styled.div`
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const ActivePlanLabel = styled.small`
  color: var(--text-secondary);
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
`

const ActivePlanName = styled.strong`
  font-size: 1rem;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
`

const ActiveBadge = styled.span`
  background: var(--color-success, #10b981);
  color: white;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
`

const ActivePlanInfo = styled.small`
  color: var(--text-secondary);
  font-size: 0.8125rem;
  margin-top: 4px;
`

const NoPlanMessage = styled.div`
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
  padding: 16px;
`

export const TrainingMenuPage = () => {
  const navigate = useNavigate()
  const activePlan = useGymStore((s) => s.activePlan)

  return (
    <>
      <PageHeader title="Treinos" subtitle="Gerencie exercícios, templates e planos" />
      <Container>
        <MenuGrid>
          <MenuCard onClick={() => navigate('/training/exercises')}>
            <MenuIcon>💪</MenuIcon>
            <MenuTitle>Exercícios</MenuTitle>
            <MenuSubtitle>Gerenciar exercícios disponíveis</MenuSubtitle>
          </MenuCard>

          <MenuCard onClick={() => navigate('/training/templates')}>
            <MenuIcon>🎯</MenuIcon>
            <MenuTitle>Templates de Treino</MenuTitle>
            <MenuSubtitle>Criar e editar treinos</MenuSubtitle>
          </MenuCard>

          <MenuCard onClick={() => navigate('/training/plans')}>
            <MenuIcon>⚙️</MenuIcon>
            <MenuTitle>Plano de Treino</MenuTitle>
            <MenuSubtitle>Múltiplos planos e ativar um</MenuSubtitle>
          </MenuCard>
        </MenuGrid>

        <ActivePlanSection>
          <ActivePlanLabel>Plano Ativo</ActivePlanLabel>
          {activePlan ? (
            <>
              <ActivePlanName>
                ✅ {activePlan.name}
                <ActiveBadge>ativo</ActiveBadge>
              </ActivePlanName>
              <ActivePlanInfo>
                {activePlan.mode === 'weekly' ? `Semanal • ${activePlan.weekMap?.days?.join('-')}` : 'Sequencial'}
              </ActivePlanInfo>
              {activePlan.startDate && (
                <ActivePlanInfo>
                  Início: {new Date(activePlan.startDate).toLocaleDateString('pt-BR')}
                </ActivePlanInfo>
              )}
            </>
          ) : (
            <NoPlanMessage>
              Nenhum plano configurado. Clique em "Plano de Treino" para criar um.
            </NoPlanMessage>
          )}
        </ActivePlanSection>
      </Container>
    </>
  )
}
