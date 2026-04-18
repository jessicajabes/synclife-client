import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
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
  padding: 32px 20px;
  background: var(--bg-primary);
  max-width: 420px;
  margin: 0 auto;
`

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
`

const Subtitle = styled.p`
  color: var(--text-secondary);
  font-size: 0.9375rem;
  margin-bottom: 28px;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 14px;
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
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

const OptionalLabel = styled.span`
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-left: 4px;
`

const INITIAL = {
  name: '', email: '', password: '',
  birthDate: '', height: '', weight: '',
}

export const SignupPage = () => {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const [form, setForm] = useState(INITIAL)
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
    if (!form.name.trim()) errs.name = 'Nome obrigatório'
    if (!form.email) errs.email = 'E-mail obrigatório'
    if (form.password.length < 8) errs.password = 'Mínimo 8 caracteres'
    if (!form.birthDate) errs.birthDate = 'Data de nascimento obrigatória'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const payload = {
        id: uuidv4(),
        name: form.name.trim(),
        email: form.email,
        password: form.password,
        birthDate: form.birthDate,
        ...(form.height && { height: parseFloat(form.height) }),
        ...(form.weight && { weight: parseFloat(form.weight) }),
      }
      const { data } = await gymApi.signUp(payload)
      setAuth(data.data.token, data.data.user)
      navigate('/', { replace: true })
    } catch (err) {
      setGlobalError(err.response?.data?.message || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Page>
      <Title>Criar conta</Title>
      <Subtitle>Comece a acompanhar seus treinos.</Subtitle>

      <Form onSubmit={handleSubmit} noValidate>
        {globalError && <GlobalError>{globalError}</GlobalError>}

        <InputGroup>
          <Label htmlFor="name">Nome</Label>
          <Input id="name" name="name" autoComplete="name" placeholder="Seu nome"
            value={form.name} onChange={handleChange} />
          {errors.name && <ErrorText>{errors.name}</ErrorText>}
        </InputGroup>

        <InputGroup>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" inputMode="email"
            autoComplete="email" placeholder="seu@email.com"
            value={form.email} onChange={handleChange} />
          {errors.email && <ErrorText>{errors.email}</ErrorText>}
        </InputGroup>

        <InputGroup>
          <Label htmlFor="password">Senha</Label>
          <Input id="password" name="password" type="password"
            autoComplete="new-password" placeholder="Mínimo 8 caracteres"
            value={form.password} onChange={handleChange} />
          {errors.password && <ErrorText>{errors.password}</ErrorText>}
        </InputGroup>

        <InputGroup>
          <Label htmlFor="birthDate">Data de nascimento</Label>
          <Input id="birthDate" name="birthDate" type="date"
            value={form.birthDate} onChange={handleChange} />
          {errors.birthDate && <ErrorText>{errors.birthDate}</ErrorText>}
        </InputGroup>

        <Row>
          <InputGroup>
            <Label htmlFor="height">
              Altura <OptionalLabel>(cm, opcional)</OptionalLabel>
            </Label>
            <Input id="height" name="height" type="number" inputMode="decimal"
              placeholder="170" value={form.height} onChange={handleChange} />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="weight">
              Peso <OptionalLabel>(kg, opcional)</OptionalLabel>
            </Label>
            <Input id="weight" name="weight" type="number" inputMode="decimal"
              placeholder="65" value={form.weight} onChange={handleChange} />
          </InputGroup>
        </Row>

        <Button type="submit" $fullWidth disabled={loading} style={{ marginTop: 8 }}>
          {loading ? 'Criando conta…' : 'Criar conta'}
        </Button>
      </Form>

      <Footer>
        Já tem conta? <Link to="/login">Entrar</Link>
      </Footer>
    </Page>
  )
}
