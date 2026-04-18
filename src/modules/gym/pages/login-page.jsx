import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAuthStore } from '../../../store/auth-store'
import * as gymApi from '../api'
import { Button } from '../../../components/button'
import { Input, InputGroup, Label, ErrorText } from '../../../components/input'

const Page = styled.div`
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 24px 20px;
  background: var(--bg-primary);
  max-width: 420px;
  margin: 0 auto;
`

const LogoArea = styled.div`
  text-align: center;
  margin-bottom: 40px;
`

const Logo = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-primary);
  letter-spacing: -1px;
`

const Subtitle = styled.p`
  color: var(--text-secondary);
  font-size: 0.9375rem;
  margin-top: 4px;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Footer = styled.p`
  text-align: center;
  margin-top: 24px;
  font-size: 0.875rem;
  color: var(--text-secondary);

  a { color: var(--color-primary); font-weight: 600; }
`

const GlobalError = styled.div`
  background: color-mix(in srgb, var(--color-danger) 12%, transparent);
  color: var(--color-danger);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  font-size: 0.875rem;
`

export const LoginPage = () => {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [globalError, setGlobalError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setErrors((er) => ({ ...er, [name]: '' }))
    setGlobalError('')
  }

  const validate = () => {
    const errs = {}
    if (!form.email) errs.email = 'E-mail obrigatório'
    if (!form.password) errs.password = 'Senha obrigatória'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const { data } = await gymApi.logIn({ email: form.email, password: form.password })
      setAuth(data.data.token, data.data.user)
      navigate('/', { replace: true })
    } catch (err) {
      setGlobalError(err.response?.data?.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Page>
      <LogoArea>
        <Logo>SyncLife</Logo>
        <Subtitle>Seus treinos, no seu ritmo.</Subtitle>
      </LogoArea>

      <Form onSubmit={handleSubmit} noValidate>
        {globalError && <GlobalError>{globalError}</GlobalError>}

        <InputGroup>
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="seu@email.com"
            value={form.email}
            onChange={handleChange}
          />
          {errors.email && <ErrorText>{errors.email}</ErrorText>}
        </InputGroup>

        <InputGroup>
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
          />
          {errors.password && <ErrorText>{errors.password}</ErrorText>}
        </InputGroup>

        <Button type="submit" $fullWidth disabled={loading}>
          {loading ? 'Entrando…' : 'Entrar'}
        </Button>
      </Form>

      <Footer>
        Não tem conta? <Link to="/signup">Criar conta</Link>
      </Footer>
    </Page>
  )
}
