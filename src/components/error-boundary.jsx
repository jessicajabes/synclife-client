import { Component } from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  padding: 24px;
  text-align: center;
  background: var(--bg-primary);
  color: var(--text-primary);
`

const Title = styled.h1`
  font-size: 1.25rem;
  margin-bottom: 8px;
`

const Message = styled.p`
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 24px;
`

const Button = styled.button`
  background: var(--color-primary);
  color: #000;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
`

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary capturou:', error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <Wrapper>
          <Title>Algo deu errado</Title>
          <Message>{this.state.error?.message || 'Erro inesperado'}</Message>
          <Button onClick={this.handleReset}>Voltar ao início</Button>
        </Wrapper>
      )
    }
    return this.props.children
  }
}
