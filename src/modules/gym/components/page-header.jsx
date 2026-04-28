import styled from 'styled-components'

const HeaderContainer = styled.div`
  margin-bottom: 24px;
`

const Title = styled.h2`
  font-size: 1.375rem;
  font-weight: 700;
  margin-bottom: 4px;
`

const Subtitle = styled.p`
  color: var(--text-secondary);
  font-size: 0.9375rem;
`

export const PageHeader = ({ title, subtitle }) => (
  <HeaderContainer>
    <Title>{title}</Title>
    {subtitle && <Subtitle>{subtitle}</Subtitle>}
  </HeaderContainer>
)
