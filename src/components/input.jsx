import styled from 'styled-components'

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

export const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
`

export const Input = styled.input`
  width: 100%;
  min-height: 48px;
  padding: 0 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  outline: none;
  transition: border-color 0.15s;

  &:focus {
    border-color: var(--color-primary);
  }

  &::placeholder {
    color: var(--text-secondary);
  }
`

export const ErrorText = styled.span`
  font-size: 0.8125rem;
  color: var(--color-danger);
`
