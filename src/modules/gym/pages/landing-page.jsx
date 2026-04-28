import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import React, { useEffect } from 'react';

const LandingWrapper = styled.div`
  background: linear-gradient(135deg, #0f172a 0%, #1a2844 100%);
  color: #f1f5f9;
  overflow-x: hidden;
`;

const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
  background: rgba(15, 23, 42, 0.8);
  border-bottom: 1px solid rgba(71, 85, 105, 0.2);
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #4cde3b;
  letter-spacing: -1px;
`;

const CtaHeader = styled.button`
  background: #4cde3b;
  color: #000;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(76, 222, 59, 0.3);
  }
`;

const Hero = styled.section`
  margin-top: 80px;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 4rem 2rem;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 800px;
    height: 800px;
    background: radial-gradient(circle, rgba(76, 222, 59, 0.1) 0%, transparent 70%);
    animation: pulse-slow 8s ease-in-out infinite;
  }

  @keyframes pulse-slow {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
  }
`;

const HeroContent = styled.div`
  max-width: 900px;
  z-index: 10;
  text-align: center;
  animation: fade-in 1s ease-out;

  @keyframes fade-in {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  h1 {
    font-size: clamp(2.5rem, 8vw, 4.5rem);
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: 1.5rem;
    letter-spacing: -2px;
  }

  p {
    font-size: 1.25rem;
    color: #94a3b8;
    margin-bottom: 3rem;
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.8;
  }
`;

const Highlight = styled.span`
  background: linear-gradient(90deg, #4cde3b, #7aed6d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const HeroCta = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 4rem;
`;

const BtnPrimary = styled.button`
  background: #4cde3b;
  color: #000;
  border: none;
  padding: 1rem 2.5rem;
  border-radius: 0.75rem;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 40px rgba(76, 222, 59, 0.2);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 60px rgba(76, 222, 59, 0.4);
  }
`;

const BtnSecondary = styled.button`
  background: transparent;
  color: #4cde3b;
  border: 2px solid #4cde3b;
  padding: 1rem 2.5rem;
  border-radius: 0.75rem;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(76, 222, 59, 0.1);
    transform: translateY(-4px);
  }
`;

const Section = styled.section`
  max-width: 1400px;
  margin: 0 auto;
  padding: 6rem 2rem;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 4rem;

  h2 {
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 800;
    margin-bottom: 1rem;
    letter-spacing: -1px;
  }

  p {
    font-size: 1.2rem;
    color: #94a3b8;
    max-width: 600px;
    margin: 0 auto;
  }
`;

const DemoTabs = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;
  flex-wrap: wrap;
`;

const TabBtn = styled.button`
  background: #1e293b;
  border: 2px solid #334155;
  color: #94a3b8;
  padding: 0.875rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 0.95rem;

  &.active {
    background: #4cde3b !important;
    border-color: #4cde3b !important;
    color: #000 !important;
  }

  &:hover {
    border-color: #4cde3b;
    color: #4cde3b;
  }
`;

const DemoContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  margin-bottom: 6rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DemoDescription = styled.div`
  animation: slide-in-left 0.6s ease-out;

  @keyframes slide-in-left {
    from { opacity: 0; transform: translateX(-30px); }
    to { opacity: 1; transform: translateX(0); }
  }

  h3 {
    font-size: 2rem;
    margin-bottom: 1.5rem;
    color: #4cde3b;
  }

  ul {
    list-style: none;
    margin-bottom: 2rem;
  }

  li {
    padding: 0.75rem 0;
    padding-left: 2rem;
    position: relative;
    color: #94a3b8;
    line-height: 1.7;

    &::before {
      content: '✓';
      position: absolute;
      left: 0;
      color: #4cde3b;
      font-weight: 700;
      font-size: 1.2rem;
    }
  }

  p {
    color: #94a3b8;
    margin-top: 1.5rem;
    font-size: 0.9rem;
  }
`;

const PhoneMockup = styled.div`
  position: relative;
  max-width: 380px;
  margin: 0 auto;
  animation: slide-in-right 0.6s ease-out;

  @keyframes slide-in-right {
    from { opacity: 0; transform: translateX(30px); }
    to { opacity: 1; transform: translateX(0); }
  }
`;

const PhoneFrame = styled.div`
  background: #000;
  border-radius: 3rem;
  padding: 12px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
  position: relative;
  z-index: 2;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 40%;
    height: 30px;
    background: #000;
    border-radius: 0 0 2rem 2rem;
    z-index: 10;
  }
`;

const PhoneScreen = styled.div`
  width: 100%;
  aspect-ratio: 9/19.5;
  border-radius: 2.5rem;
  overflow: hidden;
  background: linear-gradient(135deg, #0f172a 0%, #1a2844 100%);
  position: relative;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
`;

const ExerciseCard = styled.div`
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 1rem;
  padding: 1.25rem;
  margin-bottom: 1rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: #4cde3b;
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
  margin-top: 3rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const FeatureCard = styled.div`
  background: linear-gradient(135deg, rgba(76, 222, 59, 0.05) 0%, rgba(71, 85, 105, 0.05) 100%);
  border: 1px solid rgba(76, 222, 59, 0.1);
  border-radius: 1.5rem;
  padding: 2.5rem;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  animation: fade-up 0.6s ease-out forwards;
  opacity: 0;

  @keyframes fade-up {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 480px) {
    padding: 1.5rem;
  }

  &:nth-child(1) { animation-delay: 0.1s; }
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.3s; }
  &:nth-child(4) { animation-delay: 0.4s; }
  &:nth-child(5) { animation-delay: 0.5s; }
  &:nth-child(6) { animation-delay: 0.6s; }

  &:hover {
    border-color: rgba(76, 222, 59, 0.3);
    transform: translateY(-8px);
  }

  h3 {
    font-size: 1.3rem;
    margin-bottom: 1rem;
    position: relative;
    z-index: 2;
  }

  p {
    color: #94a3b8;
    line-height: 1.8;
    margin-bottom: 1.5rem;
    position: relative;
    z-index: 2;
  }
`;

const FeatureIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 2;
`;

const FeatureDetail = styled.div`
  font-size: 0.9rem;
  color: #4cde3b;
  font-weight: 600;
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FlowTimeline = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
`;

const FlowStep = styled.div`
  position: relative;
  padding: 2.5rem;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 1rem;
  animation: fade-up 0.6s ease-out forwards;
  opacity: 0;

  &:nth-child(1) { animation-delay: 0.1s; }
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.3s; }
  &:nth-child(4) { animation-delay: 0.4s; }
  &:nth-child(5) { animation-delay: 0.5s; }

  h4 {
    font-size: 1.2rem;
    margin-bottom: 1rem;
    margin-top: 1.5rem;
  }

  p {
    color: #94a3b8;
    font-size: 0.95rem;
    line-height: 1.7;
    margin-bottom: 1rem;
  }
`;

const FlowNumber = styled.div`
  position: absolute;
  top: -20px;
  left: 2.5rem;
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #4cde3b, #7aed6d);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.5rem;
  color: #000;
  box-shadow: 0 10px 30px rgba(76, 222, 59, 0.3);
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
`;

const MetricCard = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, rgba(76, 222, 59, 0.1) 0%, rgba(71, 85, 105, 0.05) 100%);
  border: 1px solid rgba(76, 222, 59, 0.2);
  border-radius: 1.5rem;
  animation: fade-up 0.6s ease-out forwards;
  opacity: 0;

  &:nth-child(1) { animation-delay: 0.1s; }
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.3s; }
`;

const MetricNumber = styled.div`
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  color: #4cde3b;
  margin-bottom: 0.5rem;
  font-variant-numeric: tabular-nums;
`;

const MetricLabel = styled.div`
  font-size: 1.1rem;
  color: #94a3b8;
  margin-bottom: 0.5rem;
`;

const MetricDescription = styled.div`
  font-size: 0.9rem;
  color: #94a3b8;
`;

const CtaFinal = styled.section`
  max-width: 1400px;
  margin: 0 auto;
  padding: 6rem 2rem;
  text-align: center;
  background: linear-gradient(135deg, rgba(76, 222, 59, 0.1) 0%, rgba(76, 222, 59, 0.05) 100%);
  border-radius: 2rem;
  border: 1px solid rgba(76, 222, 59, 0.2);

  h2 {
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 800;
    margin-bottom: 1.5rem;
    letter-spacing: -1px;
  }

  p {
    font-size: 1.2rem;
    color: #94a3b8;
    margin-bottom: 3rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }
`;

const CtaButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const Footer = styled.footer`
  background: #1e293b;
  border-top: 1px solid #334155;
  padding: 3rem 2rem;
  text-align: center;
`;

const FooterContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const FooterLogo = styled.div`
  font-size: 1.3rem;
  font-weight: 700;
  color: #4cde3b;
  margin-bottom: 1rem;
`;

const FooterText = styled.div`
  color: #94a3b8;
  font-size: 0.95rem;
`;

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('workout');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.animation = 'fade-up 0.6s ease-out forwards';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.scroll-animation').forEach((el) => {
      observer.observe(el);
    });
  }, []);

  const handleCta = () => {
    navigate('/login');
  };

  return (
    <LandingWrapper>
      <Header>
        <HeaderContent>
          <Logo>SincroLife</Logo>
          <CtaHeader onClick={handleCta}>Começar Agora</CtaHeader>
        </HeaderContent>
      </Header>

      <Hero>
        <HeroContent>
          <h1>
            Treine com <Highlight>Precisão</Highlight>,<br />
            Evolua com <Highlight>Dados</Highlight>
          </h1>
          <p>A plataforma completa que transforma seus treinos em dados científicos. Do descanso cronometrado à calculadora de anilhas inteligente — tudo sincronizado em tempo real.</p>
          <HeroCta>
            <BtnPrimary onClick={handleCta}>Comece seu Treino</BtnPrimary>
            <BtnSecondary onClick={() => document.querySelector('.demo-section')?.scrollIntoView({ behavior: 'smooth' })}>
              Ver Demo
            </BtnSecondary>
          </HeroCta>
        </HeroContent>
      </Hero>

      <Section className="demo-section">
        <SectionHeader>
          <h2>A Experiência Real do SincroLife</h2>
          <p>Explore cada recurso funcionando exatamente como você vai usar no seu treino</p>
        </SectionHeader>

        <DemoTabs>
          {[
            { id: 'workout', label: '🏋️ Treino' },
            { id: 'history', label: '📈 Evolução' },
            { id: 'timer', label: '⏱️ Descanso' },
            { id: 'trophies', label: '🏆 Troféus' },
          ].map((tab) => (
            <TabBtn
              key={tab.id}
              className={activeTab === tab.id ? 'active' : ''}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </TabBtn>
          ))}
        </DemoTabs>

        {activeTab === 'workout' && (
          <DemoContainer>
            <DemoDescription className="scroll-animation">
              <h3>Execute seu Treino em Tempo Real</h3>
              <ul>
                <li>Visualize todos os exercícios da sessão</li>
                <li>Registre séries, repetições e cargas</li>
                <li>Sinta-se livre para substituir exercícios</li>
                <li>Cronômetro de descanso entre séries</li>
                <li>Feedback visual de performance</li>
              </ul>
              <p>Cada série sincroniza automaticamente com seu histórico, garantindo dados precisos para análise de evolução.</p>
            </DemoDescription>
            <PhoneMockup>
              <PhoneFrame>
                <PhoneScreen>
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(76, 222, 59, 0.1)', borderRadius: '0.75rem', border: '1px solid rgba(76, 222, 59, 0.2)' }}>
                    <h4 style={{ color: '#4cde3b', fontWeight: 700, marginBottom: '0.25rem', fontSize: '0.95rem' }}>Treino de Peito</h4>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>4 exercícios • 12 séries</p>
                  </div>
                  <ExerciseCard>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.75rem' }}>Supino Reto</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8' }}>
                      <span>4x8</span>
                      <span>90kg</span>
                    </div>
                  </ExerciseCard>
                  <ExerciseCard>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.75rem' }}>Supino Inclinado</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8' }}>
                      <span>3x10</span>
                      <span>75kg</span>
                    </div>
                  </ExerciseCard>
                  <ExerciseCard>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.75rem' }}>Rosca Direta</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8' }}>
                      <span>3x12</span>
                      <span>50kg</span>
                    </div>
                  </ExerciseCard>
                </PhoneScreen>
              </PhoneFrame>
            </PhoneMockup>
          </DemoContainer>
        )}

        {activeTab === 'history' && (
          <DemoContainer>
            <DemoDescription className="scroll-animation">
              <h3>Veja sua Evolução em Gráficos</h3>
              <ul>
                <li>Histórico completo de cada exercício</li>
                <li>Análise de progresso semana a semana</li>
                <li>Identifique seus plateaus e picos</li>
                <li>Comparação de períodos</li>
                <li>Exportar dados para análise</li>
              </ul>
              <p>Todos os seus treinos ficam registrados permanentemente, criando um histórico científico do seu progresso físico.</p>
            </DemoDescription>
            <PhoneMockup>
              <PhoneFrame>
                <PhoneScreen>
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#4cde3b', fontWeight: 700, fontSize: '0.95rem' }}>
                    Evolução • Supino Reto
                  </div>
                  <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '0.75rem', padding: '1.5rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'flex-end', gap: '0.4rem', justifyContent: 'center', minHeight: '120px' }}>
                    {[40, 55, 65, 70, 85].map((h, i) => (
                      <div key={i} style={{ width: '8px', height: `${h}%`, background: 'linear-gradient(180deg, #4cde3b 0%, #2ea821 100%)', borderRadius: '4px 4px 0 0' }} />
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {[
                      { value: '92kg', label: 'Máximo' },
                      { value: '+15kg', label: 'Progresso' },
                      { value: '34', label: 'Séries' },
                      { value: '78%', label: 'Consistência' },
                    ].map((stat, i) => (
                      <div key={i} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '0.75rem', padding: '1rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#4cde3b', marginBottom: '0.25rem' }}>{stat.value}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </PhoneScreen>
              </PhoneFrame>
            </PhoneMockup>
          </DemoContainer>
        )}

        {activeTab === 'timer' && (
          <DemoContainer>
            <DemoDescription className="scroll-animation">
              <h3>Descanso Cronometrado Inteligente</h3>
              <ul>
                <li>Cronômetro que persiste entre páginas</li>
                <li>Continue navegando sem perder a contagem</li>
                <li>Notificação quando tempo encerrar</li>
                <li>Ajuste manual a qualquer momento</li>
                <li>Histórico de tempos de descanso</li>
              </ul>
              <p>O timer continua rodando mesmo que você navegue para check-in ou histórico. Seu descanso é prioridade.</p>
            </DemoDescription>
            <PhoneMockup>
              <PhoneFrame>
                <PhoneScreen style={{ justifyContent: 'center', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '2rem' }}>Descanso entre séries</div>
                    <div style={{ width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(251, 191, 36, 0.1)', border: '3px solid #fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', fontSize: '3rem', fontWeight: 800, color: '#fbbf24', animation: 'pulse-ring 2s ease-in-out infinite' }}>45</div>
                    <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1rem' }}>segundos</div>
                    <button style={{ background: '#fbbf24', color: '#000', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>Terminar Agora</button>
                  </div>
                </PhoneScreen>
              </PhoneFrame>
            </PhoneMockup>
          </DemoContainer>
        )}

        {activeTab === 'trophies' && (
          <DemoContainer>
            <DemoDescription className="scroll-animation">
              <h3>Ganhe Troféus Reais de Performance</h3>
              <ul>
                <li>Conquistas desbloqueadas ao atingir metas</li>
                <li>Podium visível de seus melhores exercícios</li>
                <li>Compartilhe suas conquistas</li>
                <li>Celebração visual ao superar recorde</li>
                <li>Motivação para treinar consistentemente</li>
              </ul>
              <p>Cada progresso significativo desbloqueia uma conquista. Sua performance SincroLifeféu permanente no app.</p>
            </DemoDescription>
            <PhoneMockup>
              <PhoneFrame>
                <PhoneScreen style={{ justifyContent: 'center', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Seus Recordes</div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', marginBottom: '2rem' }}>
                      {[{ icon: '🥈', height: '60px' }, { icon: '🥇', height: '80px' }, { icon: '🥉', height: '40px' }].map((pos, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{pos.icon}</div>
                          <div style={{ width: '50px', height: pos.height, background: 'rgba(76, 222, 59, 0.1)', border: '1px solid rgba(76, 222, 59, 0.3)', borderRadius: '4px 4px 0 0' }} />
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2rem' }}>Supino Reto 92kg</div>
                    <div style={{ fontSize: '0.75rem', color: '#4cde3b', fontWeight: 700 }}>3º mês consecutivo no pódio</div>
                  </div>
                </PhoneScreen>
              </PhoneFrame>
            </PhoneMockup>
          </DemoContainer>
        )}
      </Section>

      <Section>
        <SectionHeader>
          <h2>Recursos Profundos que Fazem a Diferença</h2>
          <p>Cada funcionalidade é construída com precisão científica para sua evolução</p>
        </SectionHeader>

        <FeaturesGrid>
          {[
            { icon: '⏱️', title: 'Cronômetro Persistente', description: 'O timer de descanso continua rodando mesmo se você navegar. Tecnologia de sincronização garante que você nunca perca um intervalo.', detail: '→ Repouso respeitado em 100% dos treinos' },
            { icon: '📊', title: 'Análise de Evolução', description: 'Cada série fica registrada permanentemente. Veja em gráficos seu progresso semana a semana, mês a mês.', detail: '→ Histórico completo sincronizado na nuvem' },
            { icon: '🎯', title: 'Calculadora de Anilhas', description: 'Digite o peso desejado e o app calcula a melhor combinação de placas. Sem erros, sem desperdício de tempo.', detail: '→ Funciona offline com sugestões inteligentes' },
            { icon: '🏆', title: 'Sistema de Troféus', description: 'Conquistas são desbloqueadas quando você atinge metas reais. Seu pódio de recordes fica visível e motivador.', detail: '→ Gamificação científica de performance' },
            { icon: '💭', title: 'Check-in Diário Customizado', description: 'Pergunte ao corpo como está: dor muscular, energia, sono. Correlacione com sua performance no treino.', detail: '→ Dados bio comportamentais que importam' },
            { icon: '📱', title: 'PWA Offline-First', description: 'Funciona na academia sem internet. Todos os treinos sincronizam automaticamente quando conectar.', detail: '→ Confiabilidade 99.8% em qualquer rede' },
          ].map((feature, idx) => (
            <FeatureCard key={idx}>
              <FeatureIcon>{feature.icon}</FeatureIcon>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <FeatureDetail>{feature.detail}</FeatureDetail>
            </FeatureCard>
          ))}
        </FeaturesGrid>
      </Section>

      <Section>
        <SectionHeader>
          <h2>Seu Fluxo Completo de Treino</h2>
          <p>Do planejamento até a avaliação — como funciona do começo ao fim</p>
        </SectionHeader>

        <FlowTimeline>
          {[
            { number: 1, title: 'Criar Treino', description: 'Planeje sua sessão: escolha exercícios, sets e repetições. O app sincroniza com seu histórico para sugerir cargas baseadas em performance anterior.', detail: 'Recomendação: Comece com sobrecarga progressiva' },
            { number: 2, title: 'Executar Séries', description: 'Na academia, abra o treino e execute cada série. Se um exercício não der, substitua em tempo real. O app recalcula tudo automaticamente.', detail: 'Vídeo do exercício integrado para forma correta' },
            { number: 3, title: 'Avaliar Feeling', description: 'Após cada série, dê seu feedback: como se sentiu? Muito fácil? Limite? Dados comportamentais que identificam seus verdadeiros limites.', detail: 'Cores visuais: 🟢 Fácil 🟡 Médio 🔴 Difícil' },
            { number: 4, title: 'Descanso Cronometrado', description: 'Inicie o timer automático (configurable por exercício). Continue navegando — o timer persiste em qualquer página até o tempo encerrar.', detail: 'Notificação quando descanso terminar' },
            { number: 5, title: 'Resumo com Troféus', description: 'Após o treino, veja o resumo completo: volume total, peso médio, troféus desbloqueados. Pronto para celebrar sua performance.', detail: 'Compartilhe seus troféus nas redes sociais' },
          ].map((step) => (
            <FlowStep key={step.number}>
              <FlowNumber>{step.number}</FlowNumber>
              <h4>{step.title}</h4>
              <p>{step.description}</p>
              <div style={{ background: 'rgba(76, 222, 59, 0.05)', borderLeft: '3px solid #4cde3b', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.85rem', color: '#94a3b8' }}>{step.detail}</div>
            </FlowStep>
          ))}
        </FlowTimeline>
      </Section>

      <Section>
        <SectionHeader>
          <h2>Resultados Reais, Números Reais</h2>
          <p>Usuários confiam em SincroLife porque os números comprovam</p>
        </SectionHeader>

        <MetricsGrid>
          {[
            { number: '50K+', label: 'Treinos Registrados', description: 'Dados reais de usuários que rastreiam cada série' },
            { number: '12.5K', label: 'Usuários Ativos', description: 'Comunidade crescendo 15% mês a mês' },
            { number: '99.8%', label: 'Uptime', description: 'Infraestrutura confiável que você pode confiar' },
          ].map((metric, idx) => (
            <MetricCard key={idx}>
              <MetricNumber>{metric.number}</MetricNumber>
              <MetricLabel>{metric.label}</MetricLabel>
              <MetricDescription>{metric.description}</MetricDescription>
            </MetricCard>
          ))}
        </MetricsGrid>
      </Section>

      <CtaFinal>
        <h2>Comece sua Transformação Hoje</h2>
        <p>Junte-se a milhares de pessoas que transformaram seu treino em ciência. Sem pagamentos até você ter certeza que adora.</p>
        <CtaButtons>
          <BtnPrimary onClick={handleCta}>Criar Conta Grátis</BtnPrimary>
          <BtnSecondary onClick={handleCta}>Agendar Demo</BtnSecondary>
        </CtaButtons>
      </CtaFinal>

      <Footer>
        <FooterContent>
          <FooterLogo>SincroLife</FooterLogo>
          <FooterText>© 2024 SincroLife. Seus dados, seu treino, sua evolução. Feito com ❤️ para atletas que medem tudo.</FooterText>
        </FooterContent>
      </Footer>
      <style>{`
        @keyframes pulse-ring {
          0%, 100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.7); }
          50% { box-shadow: 0 0 0 15px rgba(251, 191, 36, 0); }
        }
      `}</style>
    </LandingWrapper>
  );
}