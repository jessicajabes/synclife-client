import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.95);
  transition: all 0.3s;

  [data-theme="dark"] & {
    background-color: rgba(15, 23, 42, 0.95);
  }

  &.scrolled {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }
`

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Logo = styled.div`
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.5px;
`

const LogoIcon = styled.span`
  color: var(--color-primary);
  display: inline-block;
  margin-right: 4px;
`

const NavLinks = styled.nav`
  display: flex;
  gap: 32px;
  align-items: center;

  @media (max-width: 768px) {
    display: none;
  }

  a {
    font-size: 0.9375rem;
    font-weight: 500;
    color: var(--text-secondary);
    transition: color 0.2s;
    cursor: pointer;

    &:hover {
      color: var(--text-primary);
    }
  }
`

const BtnCta = styled.button`
  background: var(--color-primary);
  color: #1a2e0a;
  padding: 10px 20px;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.9375rem;
  transition: all 0.2s;
  border: none;
  cursor: pointer;

  &:hover {
    background: var(--color-primary-light);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(76, 222, 59, 0.3);
  }
`

const Hero = styled.section`
  margin-top: 80px;
  padding: 80px 20px;
  text-align: center;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 60px 20px;
    margin-top: 100px;
  }

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -10%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, var(--color-primary) 0%, transparent 70%);
    opacity: 0.1;
    pointer-events: none;
    border-radius: 50%;
  }
`

const HeroContent = styled.div`
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`

const H1 = styled.h1`
  font-size: clamp(2rem, 8vw, 3.5rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 24px;
  letter-spacing: -1px;
  animation: fadeInUp 0.8s ease-out;
`

const Highlight = styled.span`
  background: linear-gradient(120deg, var(--color-primary), var(--color-primary-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

const HeroSubtitle = styled.p`
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  color: var(--text-secondary);
  margin-bottom: 40px;
  animation: fadeInUp 0.8s ease-out 0.1s both;
`

const HeroCta = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  animation: fadeInUp 0.8s ease-out 0.2s both;

  @media (max-width: 768px) {
    flex-direction: column;

    button {
      width: 100%;
    }
  }
`

const BtnPrimary = styled.button`
  background: var(--color-primary);
  color: #1a2e0a;
  padding: 16px 32px;
  border-radius: var(--radius-lg);
  font-weight: 700;
  font-size: 1rem;
  transition: all 0.3s;
  cursor: pointer;
  border: none;
  min-height: 48px;

  &:hover {
    background: var(--color-primary-light);
    transform: translateY(-4px);
    box-shadow: 0 16px 40px rgba(76, 222, 59, 0.4);
  }
`

const BtnSecondary = styled.button`
  background: var(--bg-secondary);
  color: var(--text-primary);
  padding: 16px 32px;
  border-radius: var(--radius-lg);
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s;
  border: 1px solid var(--border);
  cursor: pointer;

  &:hover {
    background: var(--border);
    transform: translateY(-4px);
  }
`

const HeroDemo = styled.div`
  margin-top: 60px;
  animation: fadeIn 1s ease-out 0.4s both;
`

const DeviceMockup = styled.div`
  max-width: 400px;
  margin: 0 auto;
  background: var(--bg-card);
  border-radius: 40px;
  border: 12px solid var(--text-primary);
  overflow: hidden;
  box-shadow: 0 40px 60px rgba(0, 0, 0, 0.1);
  aspect-ratio: 9/19;
  position: relative;

  @media (max-width: 768px) {
    max-width: 300px;
  }
`

const MockupScreen = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
  display: flex;
  flex-direction: column;
  padding: 12px;
  gap: 12px;
  overflow: hidden;
`

const StatusBar = styled.div`
  height: 24px;
  background: var(--text-primary);
  border-radius: 8px;
  opacity: 0.1;
`

const AppHeader = styled.div`
  padding: 16px;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  text-align: left;

  h3 {
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 4px;
  }

  p {
    font-size: 12px;
    color: var(--text-secondary);
  }
`

const AppContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 4px;
`

const CardSkeleton = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 12px;
  display: flex;
  gap: 8px;
  animation: pulse 2s infinite;
`

const SkeletonBar = styled.div`
  height: 8px;
  background: var(--border);
  border-radius: 4px;
  animation: pulse 2s infinite;
`

const RestTimerBanner = styled.div`
  padding: 12px;
  background: var(--color-warmup);
  border-radius: var(--radius-lg);
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: #7c2d12;
`

const TabBar = styled.div`
  display: flex;
  gap: 4px;
  height: 32px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 4px;
`

const Tab = styled.div`
  flex: 1;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  font-size: 10px;
  font-weight: 600;

  ${props => props.active && `
    background: var(--color-primary);
  `}
`

const Features = styled.section`
  padding: 100px 20px;
  background: var(--bg-secondary);
  margin-top: 40px;

  @media (max-width: 768px) {
    padding: 60px 20px;
  }
`

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 60px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;

  h2 {
    font-size: clamp(1.75rem, 5vw, 2.5rem);
    font-weight: 800;
    margin-bottom: 12px;
    line-height: 1.2;
  }

  p {
    font-size: 1.0625rem;
    color: var(--text-secondary);
  }
`

const FeaturesGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
`

const FeatureCard = styled.div`
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 32px;
  border: 1px solid var(--border);
  transition: all 0.3s;
  animation: fadeInUp 0.6s ease-out;
  animation-delay: ${props => props.delay}s;
  animation-fill-mode: both;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
    border-color: var(--color-primary);
  }

  h3 {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 8px;
  }

  p {
    color: var(--text-secondary);
    font-size: 0.9375rem;
    line-height: 1.6;
  }
`

const FeatureIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 16px;
  display: inline-block;
`

const Timeline = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  position: relative;

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 0;

    &::before {
      content: '';
      position: absolute;
      top: 60px;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--color-primary), var(--color-primary), transparent);
      z-index: 0;
    }
  }
`

const TimelineStep = styled.div`
  position: relative;
  padding-bottom: 24px;
`

const StepNumber = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #1a2e0a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.5rem;
  margin: 0 auto 16px;
  z-index: 1;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: var(--color-primary);
    opacity: 0.2;
    animation: pulse-ring 2s infinite;
  }

  @keyframes pulse-ring {
    from {
      transform: scale(1);
      opacity: 0.2;
    }
    to {
      transform: scale(1.4);
      opacity: 0;
    }
  }
`

const StepTitle = styled.div`
  font-size: 1.0625rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 8px;
`

const StepDesc = styled.p`
  font-size: 0.9375rem;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.5;
`

const Stats = styled.section`
  padding: 80px 20px;
  background: var(--bg-secondary);
  margin-top: 60px;

  @media (max-width: 768px) {
    padding: 60px 20px;
  }
`

const StatsGrid = styled.div`
  max-width: 900px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
  text-align: center;
`

const StatItem = styled.div`
  animation: fadeInUp 0.6s ease-out;
  animation-delay: ${props => props.delay}s;
  animation-fill-mode: both;
`

const StatNumber = styled.div`
  font-size: clamp(2.5rem, 8vw, 3.5rem);
  font-weight: 800;
  color: var(--color-primary);
  margin-bottom: 8px;
`

const StatLabel = styled.p`
  font-size: 0.9375rem;
  color: var(--text-secondary);
  font-weight: 500;
`

const CtaSection = styled.section`
  padding: 100px 20px;
  text-align: center;
  max-width: 900px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 60px 20px;
  }

  h2 {
    font-size: clamp(1.75rem, 5vw, 2.5rem);
    font-weight: 800;
    margin-bottom: 24px;
    line-height: 1.2;
  }

  p {
    font-size: 1.0625rem;
    color: var(--text-secondary);
    margin-bottom: 40px;
  }
`

const CtaButtons = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;

    button {
      width: 100%;
    }
  }
`

const Footer = styled.footer`
  padding: 40px 20px;
  text-align: center;
  border-top: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: 0.9375rem;

  a {
    color: var(--color-primary);

    &:hover {
      text-decoration: underline;
    }
  }
`

const GlobalStyle = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
`

const features = [
  { icon: '⏱️', title: 'Cronômetro Inteligente', desc: 'Tempo de descanso que continua rodando mesmo quando você sai do treino. Nunca mais perca o timer.' },
  { icon: '📊', title: 'Evolução Rastreada', desc: 'Veja seu progresso com gráficos detalhados. Compare força, volume e performance ao longo do tempo.' },
  { icon: '✅', title: 'Check-in Diário', desc: 'Registre como você se sente, qualidade do sono e forma física. Correlacione com seu desempenho.' },
  { icon: '🎯', title: 'Planos Customizados', desc: 'Modo semanal ou sequencial. Crie templates de treino e reutilize. Flexibilidade total.' },
  { icon: '⚖️', title: 'Calculadora de Anilhas', desc: 'Calcula automaticamente quais anilhas usar. Ganhe tempo entre séries. Treina, não calcula.' },
  { icon: '📱', title: 'PWA Offline-First', desc: 'Funciona sem internet. Sincroniza automático quando volta online. Treina em qualquer lugar.' },
]

const timeline = [
  { title: 'Crie Sua Conta', desc: 'Signup rápido. Email ou Google. Nunca precisa de dados pessoais além do necessário.' },
  { title: 'Customize Treinos', desc: 'Crie planos semanais ou sequenciais. Adicione exercícios. Defina series e peso.' },
  { title: 'Execute com Sincro', desc: 'Marca cada série. Cronômetro smart para descanso. Anota como você se sente.' },
  { title: 'Acompanhe Progresso', desc: 'Veja gráficos de força, volume e consistência. Evolua cientificamente.' },
]

export function LandingPage() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const headerRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      <style>{GlobalStyle}</style>
      
      <Header ref={headerRef} className={scrolled ? 'scrolled' : ''}>
        <HeaderContent>
          <Logo>
            <LogoIcon>⚡</LogoIcon> SincroLife
          </Logo>
          <NavLinks>
            <a onClick={() => scrollToSection('features')}>Features</a>
            <a onClick={() => scrollToSection('how-it-works')}>Como Funciona</a>
            <a onClick={() => scrollToSection('benefits')}>Benefícios</a>
            <BtnCta onClick={() => navigate('/login')}>Login</BtnCta>
          </NavLinks>
        </HeaderContent>
      </Header>

      <Hero>
        <HeroContent>
          <H1>Treino sincronizado, <Highlight>progresso exponencial</Highlight></H1>
          <HeroSubtitle>
            Monitore cada série, controle o tempo de descanso e veja seu evolução em tempo real. O cronômetro que continua mesmo quando você sai.
          </HeroSubtitle>

          <HeroCta>
            <BtnPrimary onClick={() => navigate('/signup')}>Começar Grátis</BtnPrimary>
            <BtnSecondary onClick={() => navigate('/login')}>Já tenho conta</BtnSecondary>
          </HeroCta>

          <HeroDemo>
            <DeviceMockup>
              <MockupScreen>
                <StatusBar />
                <AppHeader>
                  <h3>💪 Treino de Hoje</h3>
                  <p>Série 3 de 4 - Supino Reto</p>
                </AppHeader>
                <AppContent>
                  <CardSkeleton>
                    <div style={{ flex: 1 }}>
                      <SkeletonBar style={{ width: '60%', marginBottom: '4px' }} />
                      <SkeletonBar style={{ width: '80%' }} />
                    </div>
                  </CardSkeleton>
                  <CardSkeleton>
                    <div style={{ flex: 1 }}>
                      <SkeletonBar style={{ width: '70%', marginBottom: '4px' }} />
                      <SkeletonBar style={{ width: '50%' }} />
                    </div>
                  </CardSkeleton>
                  <RestTimerBanner>⏱️ Descanso: 45s</RestTimerBanner>
                </AppContent>
                <div style={{ height: '20px' }} />
                <TabBar>
                  <Tab active />
                  <Tab />
                  <Tab />
                  <Tab />
                </TabBar>
              </MockupScreen>
            </DeviceMockup>
          </HeroDemo>
        </HeroContent>
      </Hero>

      <Features id="features">
        <SectionHeader>
          <h2>Funcionalidades que <Highlight>mudam o jogo</Highlight></h2>
          <p>Tudo que você precisa para dominar seus treinos, em um app mobile</p>
        </SectionHeader>

        <FeaturesGrid>
          {features.map((f, i) => (
            <FeatureCard key={i} delay={i * 0.1}>
              <FeatureIcon>{f.icon}</FeatureIcon>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </FeatureCard>
          ))}
        </FeaturesGrid>
      </Features>

      <section id="how-it-works" style={{ padding: '100px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <SectionHeader>
          <h2>Como funciona em 4 passos</h2>
          <p>Do zero ao seu primeiro treino sincronizado em minutos</p>
        </SectionHeader>

        <Timeline>
          {timeline.map((t, i) => (
            <TimelineStep key={i}>
              <StepNumber>{i + 1}</StepNumber>
              <StepTitle>{t.title}</StepTitle>
              <StepDesc>{t.desc}</StepDesc>
            </TimelineStep>
          ))}
        </Timeline>
      </section>

      <Stats>
        <StatsGrid>
          <StatItem delay={0}>
            <StatNumber>50K+</StatNumber>
            <StatLabel>Treinos Executados</StatLabel>
          </StatItem>
          <StatItem delay={0.1}>
            <StatNumber>12.5K</StatNumber>
            <StatLabel>Atletas Ativos</StatLabel>
          </StatItem>
          <StatItem delay={0.2}>
            <StatNumber>99.8%</StatNumber>
            <StatLabel>Uptime</StatLabel>
          </StatItem>
        </StatsGrid>
      </Stats>

      <CtaSection id="cta-section">
        <h2>Pronto para sincronizar seu progresso?</h2>
        <p>Comece agora, totalmente grátis. Seu primeiro mês sem limite. Depois, apenas R$9,90.</p>
        
        <CtaButtons>
          <BtnPrimary onClick={() => navigate('/signup')}>Criar Conta Grátis</BtnPrimary>
          <BtnSecondary onClick={() => navigate('/login')}>Já tenho conta</BtnSecondary>
        </CtaButtons>
      </CtaSection>

      <Footer>
        <p>&copy; 2026 SincroLife. Construído para quem leva treino a sério. <a href="#">Privacy Policy</a> | <a href="#">Terms</a></p>
      </Footer>
    </>
  )
}
