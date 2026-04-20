import styled from 'styled-components'

const Badge = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 99px;
  font-size: 0.6875rem;
  font-weight: 600;
  background: color-mix(in srgb, var(--color-primary) 15%, transparent);
  color: var(--color-primary-dark);
  white-space: nowrap;
`

export const MuscleGroupBadge = ({ name }) => <Badge>{name}</Badge>
