import styled, { keyframes } from 'styled-components'

const shimmer = keyframes`
  0%   { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`

export const Skeleton = styled.div`
  background: linear-gradient(
    90deg,
    var(--bg-secondary) 25%,
    var(--border) 50%,
    var(--bg-secondary) 75%
  );
  background-size: 200px 100%;
  animation: ${shimmer} 1.4s ease infinite;
  border-radius: var(--radius-sm);
  width: ${({ $width }) => $width || '100%'};
  height: ${({ $height }) => $height || '16px'};
`
