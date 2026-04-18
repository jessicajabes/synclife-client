import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useGymStore } from '../store'
import { MuscleGroupBadge } from '../components/muscle-group-badge'
import { Button } from '../../../components/button'
import { Input } from '../../../components/input'
import { Skeleton } from '../../../components/skeleton'

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

const Filters = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
`

const SearchInput = styled(Input)`
  flex: 1;
`

const FilterSelect = styled.select`
  min-height: 48px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.9375rem;
  outline: none;
  flex-shrink: 0;
  max-width: 150px;

  &:focus { border-color: var(--color-primary); }
`

const ExerciseList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const ExerciseCard = styled.li`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
`

const ExerciseInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const ExerciseName = styled.p`
  font-weight: 600;
  font-size: 0.9375rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
`

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`

const ActionBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  font-size: 1rem;
  color: var(--text-secondary);
  flex-shrink: 0;
  &:active { background: var(--bg-secondary); }
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

// ── Component ─────────────────────────────────────────────────────────────────

export const ExerciseListPage = () => {
  const navigate = useNavigate()
  const {
    exercises, exercisesLoading, exercisesError,
    muscleGroups, fetchExercises, fetchMuscleGroups, deleteExercise,
  } = useGymStore()

  const [search, setSearch] = useState('')
  const [muscleFilter, setMuscleFilter] = useState('')

  useEffect(() => {
    fetchMuscleGroups()
    fetchExercises()
  }, [])

  const handleFilter = (mgId) => {
    setMuscleFilter(mgId)
    fetchExercises(mgId ? { muscleGroupId: mgId } : undefined)
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Excluir "${name}"?`)) return
    try {
      await deleteExercise(id)
    } catch {
      alert('Erro ao excluir exercício')
    }
  }

  const filtered = exercises.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  )

  if (exercisesError) {
    return (
      <EmptyState>
        <span style={{ fontSize: '2rem' }}>⚠️</span>
        <p>{exercisesError}</p>
      </EmptyState>
    )
  }

  return (
    <>
      <PageHeader>
        <Title>Exercícios</Title>
        <AddButton onClick={() => navigate('/exercises/new')}>+ Novo</AddButton>
      </PageHeader>

      <Filters>
        <SearchInput
          placeholder="Buscar exercício…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <FilterSelect
          value={muscleFilter}
          onChange={(e) => handleFilter(e.target.value)}
        >
          <option value="">Todos</option>
          {muscleGroups.map((mg) => (
            <option key={mg.id} value={mg.id}>{mg.name}</option>
          ))}
        </FilterSelect>
      </Filters>

      {exercisesLoading ? (
        <ExerciseList>
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i}>
              <Skeleton $height="18px" $width="60%" />
              <Skeleton $height="14px" $width="40%" />
            </SkeletonCard>
          ))}
        </ExerciseList>
      ) : filtered.length === 0 ? (
        <EmptyState>
          <span style={{ fontSize: '2.5rem' }}>💪</span>
          <p>{search || muscleFilter ? 'Nenhum exercício encontrado.' : 'Nenhum exercício ainda. Crie o primeiro!'}</p>
        </EmptyState>
      ) : (
        <ExerciseList>
          {filtered.map((exercise) => (
            <ExerciseCard key={exercise.id}>
              <ExerciseInfo>
                <ExerciseName>{exercise.name}</ExerciseName>
                <BadgeRow>
                  {exercise.muscleGroups.map((mg) => (
                    <MuscleGroupBadge key={mg.id} name={mg.name} />
                  ))}
                </BadgeRow>
              </ExerciseInfo>

              {exercise.youtubeUrl && (
                <ActionBtn
                  as="a"
                  href={exercise.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Ver vídeo"
                >
                  ▶️
                </ActionBtn>
              )}

              <ActionBtn
                onClick={() => navigate(`/exercises/${exercise.id}/edit`)}
                aria-label="Editar"
              >
                ✏️
              </ActionBtn>

              <ActionBtn
                onClick={() => handleDelete(exercise.id, exercise.name)}
                aria-label="Excluir"
              >
                🗑️
              </ActionBtn>
            </ExerciseCard>
          ))}
        </ExerciseList>
      )}
    </>
  )
}
