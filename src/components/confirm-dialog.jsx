import { useState, useCallback } from 'react'
import styled from 'styled-components'
import { Button } from './button'

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`

const Box = styled.div`
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 24px 20px;
  width: 100%;
  max-width: 340px;
  border: 1px solid var(--border);
`

const Title = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 8px;
`

const Message = styled.p`
  font-size: 0.9375rem;
  color: var(--text-secondary);
  margin-bottom: 20px;
`

const Actions = styled.div`
  display: flex;
  gap: 10px;
`

export const useConfirm = () => {
  const [state, setState] = useState(null)

  const confirm = useCallback((message, title = 'Confirmar') => {
    return new Promise((resolve) => {
      setState({ message, title, resolve })
    })
  }, [])

  const handleConfirm = () => {
    state?.resolve(true)
    setState(null)
  }

  const handleCancel = () => {
    state?.resolve(false)
    setState(null)
  }

  const ConfirmDialog = state ? (
    <Overlay onClick={handleCancel}>
      <Box onClick={(e) => e.stopPropagation()}>
        <Title>{state.title}</Title>
        <Message>{state.message}</Message>
        <Actions>
          <Button $variant="ghost" $fullWidth onClick={handleCancel}>
            Cancelar
          </Button>
          <Button $variant="danger" $fullWidth onClick={handleConfirm}>
            Confirmar
          </Button>
        </Actions>
      </Box>
    </Overlay>
  ) : null

  return { confirm, ConfirmDialog }
}
