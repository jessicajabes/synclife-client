import styled, { css } from 'styled-components'

const variants = {
  primary: css`
    background: var(--color-primary);
    color: #000;
    font-weight: 700;
    &:active { background: var(--color-primary-dark); }
  `,
  ghost: css`
    background: transparent;
    color: var(--text-primary);
    border: 1px solid var(--border);
    &:active { background: var(--bg-secondary); }
  `,
  danger: css`
    background: var(--color-danger);
    color: #fff;
    font-weight: 600;
    &:active { opacity: 0.85; }
  `,
}

export const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
  min-height: 48px;
  padding: 0 20px;
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  transition: opacity 0.15s;

  ${({ $variant = 'primary' }) => variants[$variant]}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`
