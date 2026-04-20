import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useGymStore } from '../store'
import { Button } from '../../../components/button'
import { Skeleton } from '../../../components/skeleton'
import { toast } from '../../../lib/toast'
import { useConfirm } from '../../../components/confirm-dialog'

// ── Styles ────────────────────────────────────────────────────────────────────

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
`

const AddButton = styled(Button)`
  min-height: 40px;
  padding: 0 14px;
  font-size: 0.875rem;
`

const TemplateList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const TemplateCard = styled.li`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
`

const CardBody = styled.button`
  width: 100%;
  text-align: left;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: auto;
  &:active { background: var(--bg-secondary); }
`

const TemplateName = styled.p`
  font-weight: 600;
  font-size: 0.9375rem;
`

const TemplateMeta = styled.p`
  font-size: 0.8125rem;
  color: var(--text-secondary);
`

const MuscleChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
`

const Chip = styled.span`
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 99px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border);
`

const CardActions = styled.div`
  display: flex;
  border-top: 1px solid var(--border);
`

const ActionBtn = styled.button`
  flex: 1;
  padding: 10px 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
  min-height: auto;
  &:not(:last-child) { border-right: 1px solid var(--border); }
  &:active { background: var(--bg-secondary); }
  &[data-danger] { color: var(--color-danger); }
`

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 16px;
  color: var(--text-secondary);
  p { margin-top: 8px; font-size: 0.9375rem; }
`

const SkeletonCard = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

// ── Helpers ───────────────────────────────────────────────────────────────────

const getTemplateMuscleGroups = (template) => {
  const seen = new Set()
  const result = []
  for (const ex of template.exercises) {
    const primary = ex.exercise?.muscleGroups?.[0]
    if (primary && !seen.has(primary.id)) {
      seen.add(primary.id)
      result.push(primary.name)
    }
  }
  return result.slice(0, 4)
}

// ── Component ─────────────────────────────────────────────────────────────────

export const TemplateListPage = () => {
  const navigate = useNavigate()
  const { templates, templatesLoading, templatesError, fetchTemplates, deleteTemplate } = useGymStore()
  const { confirm, ConfirmDialog } = useConfirm()
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    fetchTemplates()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDelete = async (id, name) => {
    const ok = await confirm(`Excluir "${name}"? As sessões históricas serão mantidas.`)
    if (!ok) return
    setDeleting(id)
    try {
      await deleteTemplate(id)
      toast.success('Template excluído')
    } catch {
      toast.error('Erro ao excluir template')
    } finally {
      setDeleting(null)
    }
  }

  if (templatesError) {
    return (
      <EmptyState>
        <span style={{ fontSize: '2rem' }}>⚠️</span>
        <p>{templatesError}</p>
      </EmptyState>
    )
  }

  return (
    <>
      <PageHeader>
        <Title>Templates</Title>
        <AddButton onClick={() => navigate('/templates/new')}>+ Novo</AddButton>
      </PageHeader>

      {templatesLoading ? (
        <TemplateList>
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i}>
              <Skeleton $height="18px" $width="55%" />
              <Skeleton $height="13px" $width="35%" />
            </SkeletonCard>
          ))}
        </TemplateList>
      ) : templates.length === 0 ? (
        <EmptyState>
          <span style={{ fontSize: '2.5rem' }}>📋</span>
          <p>Nenhum template ainda. Crie o primeiro!</p>
        </EmptyState>
      ) : (
        <TemplateList>
          {templates.map((template) => {
            const muscleGroups = getTemplateMuscleGroups(template)
            const exCount = template.exercises.length
            return (
              <TemplateCard key={template.id}>
                <CardBody onClick={() => navigate(`/templates/${template.id}`)}>
                  <TemplateName>{template.name}</TemplateName>
                  <TemplateMeta>
                    {exCount} exercício{exCount !== 1 ? 's' : ''} · v{template.version}
                  </TemplateMeta>
                  {muscleGroups.length > 0 && (
                    <MuscleChips>
                      {muscleGroups.map((name) => (
                        <Chip key={name}>{name}</Chip>
                      ))}
                    </MuscleChips>
                  )}
                </CardBody>
                <CardActions>
                  <ActionBtn onClick={() => navigate(`/templates/${template.id}`)}>
                    Ver
                  </ActionBtn>
                  <ActionBtn onClick={() => navigate(`/templates/${template.id}/history`)}>
                    Histórico
                  </ActionBtn>
                  <ActionBtn onClick={() => navigate(`/templates/${template.id}/edit`)}>
                    Editar
                  </ActionBtn>
                  <ActionBtn
                    data-danger
                    onClick={() => handleDelete(template.id, template.name)}
                    disabled={deleting === template.id}
                  >
                    {deleting === template.id ? '…' : 'Excluir'}
                  </ActionBtn>
                </CardActions>
              </TemplateCard>
            )
          })}
        </TemplateList>
      )}
      {ConfirmDialog}
    </>
  )
}
