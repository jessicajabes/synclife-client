import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import * as gymApi from "../api";
import { Skeleton } from "../../../components/skeleton";

// ── Styles ────────────────────────────────────────────────────────────────────

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
`;

const BackBtn = styled.button`
  width: 36px;
  height: 36px;
  min-height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  color: var(--text-secondary);
  flex-shrink: 0;
  &:active {
    background: var(--bg-secondary);
  }
`;

const PageTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 700;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Sub = styled.p`
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 20px;
  padding-left: 46px;
`;

const SessionCard = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  margin-bottom: 10px;
  overflow: hidden;
`;

const CardTop = styled.button`
  width: 100%;
  text-align: left;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  &:active {
    background: var(--bg-secondary);
  }
`;

const DateBadge = styled.div`
  flex-shrink: 0;
  width: 44px;
  text-align: center;
  span:first-child {
    display: block;
    font-size: 1.25rem;
    font-weight: 800;
    line-height: 1;
    color: var(--color-primary-dark);
  }
  span:last-child {
    display: block;
    font-size: 0.6875rem;
    text-transform: uppercase;
    color: var(--text-secondary);
    font-weight: 600;
  }
`;

const MetaRow = styled.div`
  flex: 1;
  min-width: 0;
`;

const MetaMain = styled.p`
  font-weight: 700;
  font-size: 0.9375rem;
`;

const MetaSub = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 3px;
  flex-wrap: wrap;
`;

const MetaItem = styled.span`
  font-size: 0.75rem;
  color: var(--text-secondary);
`;

const ChevronIcon = styled.span`
  font-size: 0.875rem;
  color: var(--text-secondary);
  transition: transform 0.2s;
  transform: ${({ $open }) => ($open ? "rotate(180deg)" : "rotate(0deg)")};
  flex-shrink: 0;
`;

const Detail = styled.div`
  border-top: 1px solid var(--border);
  padding: 0 0 8px;
`;

const ExRow = styled.div`
  padding: 10px 16px;
  border-bottom: 1px solid var(--border);
  &:last-child {
    border-bottom: none;
  }
`;

const ExName = styled.p`
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 6px;
`;

const SetsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const SetLine = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8125rem;
`;

const SetBadge = styled.span`
  font-size: 0.6875rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 99px;
  flex-shrink: 0;
  min-width: 48px;
  text-align: center;
  background: ${({ $type }) =>
    $type === "warmup"
      ? "color-mix(in srgb, #f59e0b 15%, transparent)"
      : "var(--bg-secondary)"};
  color: ${({ $type }) =>
    $type === "warmup" ? "#92670a" : "var(--text-secondary)"};
  border: 1px solid
    ${({ $type }) =>
      $type === "warmup"
        ? "color-mix(in srgb, #f59e0b 25%, transparent)"
        : "var(--border)"};
`;

const SetValue = styled.span`
  color: var(--text-primary);
  font-weight: 600;
`;

const SetVol = styled.span`
  color: var(--text-secondary);
  font-size: 0.75rem;
`;

const FeelingDot = styled.span`
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  margin-left: 3px;
  vertical-align: middle;
  flex-shrink: 0;
  background: ${({ $f }) =>
    $f === "light"
      ? "var(--color-success)"
      : $f === "heavy"
        ? "var(--color-danger)"
        : "var(--text-secondary)"};
`;

const FeelingTag = styled.span`
  font-size: 0.6875rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 99px;
  margin-left: 4px;
  background: ${({ $f }) =>
    $f === "light"
      ? "color-mix(in srgb, var(--color-success) 15%, transparent)"
      : $f === "heavy"
        ? "color-mix(in srgb, var(--color-danger) 15%, transparent)"
        : "var(--bg-secondary)"};
  color: ${({ $f }) =>
    $f === "light"
      ? "var(--color-success)"
      : $f === "heavy"
        ? "var(--color-danger)"
        : "var(--text-secondary)"};
`;

const FEELING_LABEL = { light: "Leve", normal: "Normal", heavy: "Pesado" };

// ── Helpers ───────────────────────────────────────────────────────────────────

const parseLocalDate = (dateStr) => {
  const [y, m, d] = dateStr.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
};

const formatDate = (dateStr) => {
  const d = parseLocalDate(dateStr);
  return {
    day: d.getDate(),
    month: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
    weekday: d.toLocaleDateString("pt-BR", { weekday: "long" }),
  };
};

const formatDuration = (startedAt, finishedAt) => {
  if (!startedAt || !finishedAt) return null;
  const mins = Math.round((new Date(finishedAt) - new Date(startedAt)) / 60000);
  if (mins < 60) return `${mins}min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h${m}min` : `${h}h`;
};

// ── Component ─────────────────────────────────────────────────────────────────

export const TemplateHistoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [templateName, setTemplateName] = useState("");
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    Promise.all([
      gymApi.fetchTemplate(id),
      gymApi.fetchSessions({ templateId: id, status: "completed" }),
    ])
      .then(([tplRes, sessRes]) => {
        setTemplateName(tplRes.data.data?.name ?? "");
        setSessions(sessRes.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const toggle = (sid) => setOpenId((prev) => (prev === sid ? null : sid));

  if (loading) {
    return (
      <>
        <Header>
          <BackBtn onClick={() => navigate(-1)}>←</BackBtn>
          <Skeleton $height="18px" $width="50%" />
        </Header>
        {[1, 2, 3].map((i) => (
          <Skeleton
            key={i}
            $height="72px"
            style={{ borderRadius: 12, marginBottom: 10 }}
          />
        ))}
      </>
    );
  }

  return (
    <>
      <Header>
        <BackBtn onClick={() => navigate(-1)}>←</BackBtn>
        <PageTitle>{templateName}</PageTitle>
      </Header>
      <Sub>
        {sessions.length === 0
          ? "Nenhuma sessão registrada ainda"
          : `${sessions.length} sessão${sessions.length !== 1 ? "ões" : ""} concluída${sessions.length !== 1 ? "s" : ""}`}
      </Sub>

      {sessions.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "40px 16px",
            color: "var(--text-secondary)",
          }}
        >
          <span
            style={{ fontSize: "2.5rem", display: "block", marginBottom: 8 }}
          >
            📭
          </span>
          <strong style={{ color: "var(--text-primary)" }}>
            Sem histórico
          </strong>
          <p style={{ marginTop: 4, fontSize: "0.875rem" }}>
            Complete um treino com este template para ver o histórico aqui.
          </p>
        </div>
      )}

      {sessions.map((session) => {
        const { day, month, weekday } = formatDate(session.date);
        const duration = formatDuration(session.startedAt, session.finishedAt);
        const isOpen = openId === session.id;

        return (
          <SessionCard key={session.id}>
            <CardTop type="button" onClick={() => toggle(session.id)}>
              <DateBadge>
                <span>{day}</span>
                <span>{month}</span>
              </DateBadge>

              <MetaRow>
                <MetaMain style={{ textTransform: "capitalize" }}>
                  {weekday}
                </MetaMain>
                <MetaSub>
                  {duration && <MetaItem>⏱ {duration}</MetaItem>}
                  {session.totalVolume > 0 && (
                    <MetaItem>
                      🏋️{" "}
                      {session.totalVolume.toLocaleString("pt-BR", {
                        maximumFractionDigits: 0,
                      })}
                      kg vol
                    </MetaItem>
                  )}
                  <MetaItem>{session.exerciseLogs.length} ex</MetaItem>
                </MetaSub>
              </MetaRow>

              <ChevronIcon $open={isOpen}>▾</ChevronIcon>
            </CardTop>

            {isOpen && (
              <Detail>
                {session.exerciseLogs.map((log) => {
                  const name =
                    log.substitutedExercise?.name ?? log.exercise?.name ?? "—";
                  const allSets = log.sets.filter(
                    (s) => s.weight > 0 || s.reps > 0,
                  );

                  return (
                    <ExRow key={log.id}>
                      <ExName>
                        {name}
                        {log.feeling && (
                          <FeelingTag $f={log.feeling}>
                            {FEELING_LABEL[log.feeling]}
                          </FeelingTag>
                        )}
                      </ExName>

                      {allSets.length === 0 ? (
                        <MetaItem>sem dados registrados</MetaItem>
                      ) : (
                        <SetsGrid>
                          {allSets.map((s, idx) => {
                            return (
                              <SetLine key={s.id ?? idx}>
                                <SetBadge $type={s.type}>
                                  {s.type === "warmup"
                                    ? "Aquec"
                                    : `Série ${s.setNumber}`}
                                </SetBadge>
                                <SetValue>
                                  {s.weight > 0 ? `${s.weight}kg` : "—"}
                                  {s.weightFeeling && (
                                    <FeelingDot $f={s.weightFeeling} />
                                  )}
                                  {s.weight > 0 && s.reps > 0 ? " × " : ""}
                                  {s.reps > 0 ? `${s.reps} rep` : ""}
                                  {s.repsFeeling && (
                                    <FeelingDot $f={s.repsFeeling} />
                                  )}
                                </SetValue>
                              </SetLine>
                            );
                          })}
                        </SetsGrid>
                      )}
                    </ExRow>
                  );
                })}
              </Detail>
            )}
          </SessionCard>
        );
      })}
    </>
  );
};
