import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import * as gymApi from "../api";
import { Skeleton } from "../../../components/skeleton";
import { toast } from "../../../lib/toast";
import { useConfirm } from "../../../components/confirm-dialog";

// ── Styles ────────────────────────────────────────────────────────────────────

const PageTitle = styled.h2`
  font-size: 1.375rem;
  font-weight: 700;
  margin-bottom: 4px;
`;

const Sub = styled.p`
  color: var(--text-secondary);
  font-size: 0.9375rem;
  margin-bottom: 20px;
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

const CardInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const TemplateName = styled.p`
  font-weight: 700;
  font-size: 0.9375rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MetaRow = styled.div`
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

const CardActions = styled.div`
  display: flex;
  gap: 6px;
  padding: 8px 14px;
  border-top: 1px solid var(--border);
  background: var(--bg-secondary);
`;

const ActionBtn = styled.button`
  flex: 1;
  min-height: 36px;
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  font-weight: 600;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: ${({ $danger }) =>
    $danger ? "var(--color-danger)" : "var(--text-primary)"};
  &:active {
    opacity: 0.7;
  }
  &:disabled {
    opacity: 0.4;
  }
`;

// ── Detail ────────────────────────────────────────────────────────────────────

const Detail = styled.div`
  border-top: 1px solid var(--border);
  padding: 12px 16px 16px;
`;

const ExRow = styled.div`
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
  &:last-child {
    border-bottom: none;
  }
`;

const ExName = styled.p`
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 4px;
`;

const SetsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const SetPill = styled.span`
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 99px;
  background: ${({ $type, $wf }) => {
    if ($type === "warmup")
      return "color-mix(in srgb, #f59e0b 15%, transparent)";
    if ($wf === "heavy")
      return "color-mix(in srgb, var(--color-danger) 12%, transparent)";
    if ($wf === "light")
      return "color-mix(in srgb, var(--color-success) 12%, transparent)";
    return "var(--bg-secondary)";
  }};
  color: ${({ $type, $wf }) => {
    if ($type === "warmup") return "#92670a";
    if ($wf === "heavy") return "var(--color-danger)";
    if ($wf === "light") return "var(--color-success)";
    return "var(--text-secondary)";
  }};
  border: 1px solid
    ${({ $type, $wf }) => {
      if ($type === "warmup")
        return "color-mix(in srgb, #f59e0b 30%, transparent)";
      if ($wf === "heavy")
        return "color-mix(in srgb, var(--color-danger) 30%, transparent)";
      if ($wf === "light")
        return "color-mix(in srgb, var(--color-success) 30%, transparent)";
      return "var(--border)";
    }};
`;

const FeelingTag = styled.span`
  font-size: 0.6875rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 99px;
  margin-left: 6px;
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

const ExerciseEvolutionBtn = styled.button`
  font-size: 0.75rem;
  color: var(--color-primary-dark);
  font-weight: 600;
  padding: 2px 0;
  margin-left: 4px;
  min-height: 0;
`;

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
    weekday: d
      .toLocaleDateString("pt-BR", { weekday: "short" })
      .replace(".", ""),
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

export const HistoryPage = () => {
  const navigate = useNavigate();
  const { confirm, ConfirmDialog } = useConfirm();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    gymApi
      .fetchSessions({ status: "completed" })
      .then(({ data }) => setSessions(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // exerciseId → top-3 unique max weights (desc) across all sessions
  const exercisePodium = useMemo(() => {
    const map = {};
    for (const sess of sessions) {
      for (const log of sess.exerciseLogs) {
        const exId = log.exerciseId;
        const ws = log.sets.filter((s) => s.type === "working" && s.weight > 0);
        if (ws.length === 0) continue;
        const maxW = Math.max(...ws.map((s) => s.weight));
        if (!map[exId]) map[exId] = [];
        map[exId].push(maxW);
      }
    }
    const result = {};
    for (const exId in map) {
      result[exId] = [...new Set(map[exId])].sort((a, b) => b - a).slice(0, 3);
    }
    return result;
  }, [sessions]);

  const getTrophy = (log) => {
    const ws = log.sets.filter((s) => s.type === "working" && s.weight > 0);
    if (ws.length === 0) return null;
    const maxW = Math.max(...ws.map((s) => s.weight));
    const podium = exercisePodium[log.exerciseId] ?? [];
    const rank = podium.indexOf(maxW);
    if (rank === 0) return "🥇";
    if (rank === 1) return "🥈";
    if (rank === 2) return "🥉";
    return null;
  };

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

  const handleDelete = async (session) => {
    const label = session.templateName ?? "este treino";
    const ok = await confirm(
      `Excluir "${label}" do dia ${formatDate(session.date).day}/${parseLocalDate(session.date).getMonth() + 1}? Esta ação não pode ser desfeita.`,
    );
    if (!ok) return;
    setDeletingId(session.id);
    try {
      await gymApi.deleteSession(session.id);
      setSessions((prev) => prev.filter((s) => s.id !== session.id));
      toast.success("Sessão excluída");
    } catch {
      toast.error("Erro ao excluir sessão");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <>
        <PageTitle>Histórico</PageTitle>
        <Sub>Seus treinos concluídos</Sub>
        {[1, 2, 3].map((i) => (
          <SessionCard key={i} style={{ padding: 16, marginBottom: 10 }}>
            <Skeleton $height="16px" $width="40%" style={{ marginBottom: 8 }} />
            <Skeleton $height="13px" $width="60%" />
          </SessionCard>
        ))}
      </>
    );
  }

  if (sessions.length === 0) {
    return (
      <>
        <PageTitle>Histórico</PageTitle>
        <Sub>Seus treinos concluídos</Sub>
        <div
          style={{
            textAlign: "center",
            padding: "48px 16px",
            color: "var(--text-secondary)",
          }}
        >
          <span
            style={{ fontSize: "2.5rem", display: "block", marginBottom: 8 }}
          >
            📭
          </span>
          <strong style={{ color: "var(--text-primary)" }}>
            Nenhum treino ainda
          </strong>
          <p style={{ marginTop: 4, fontSize: "0.875rem" }}>
            Complete seu primeiro treino para ver o histórico aqui.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageTitle>Histórico</PageTitle>
      <Sub>
        {sessions.length} treino{sessions.length !== 1 ? "s" : ""} concluído
        {sessions.length !== 1 ? "s" : ""}
      </Sub>

      {sessions.map((session) => {
        const { day, month, weekday } = formatDate(session.date);
        const duration = formatDuration(session.startedAt, session.finishedAt);
        const isOpen = openId === session.id;
        const sessionTrophies = session.exerciseLogs
          .map((log) => getTrophy(log))
          .filter(Boolean);

        return (
          <SessionCard key={session.id}>
            <CardTop type="button" onClick={() => toggle(session.id)}>
              <DateBadge>
                <span>{day}</span>
                <span>{month}</span>
              </DateBadge>

              <CardInfo>
                <TemplateName>{session.templateName ?? "Treino"}</TemplateName>
                <MetaRow>
                  <MetaItem>{weekday}</MetaItem>
                  {duration && <MetaItem>⏱ {duration}</MetaItem>}
                  {session.totalVolume > 0 && (
                    <MetaItem>
                      🏋️{" "}
                      {session.totalVolume.toLocaleString("pt-BR", {
                        maximumFractionDigits: 0,
                      })}
                      kg
                    </MetaItem>
                  )}
                  {sessionTrophies.length > 0 && (
                    <MetaItem>{sessionTrophies.join("")}</MetaItem>
                  )}
                </MetaRow>
              </CardInfo>

              <ChevronIcon $open={isOpen}>▾</ChevronIcon>
            </CardTop>

            {isOpen && (
              <Detail>
                {session.exerciseLogs.map((log) => {
                  const name =
                    log.substitutedExercise?.name ?? log.exercise?.name ?? "—";
                  const workingSets = log.sets.filter(
                    (s) => s.type === "working" && (s.weight > 0 || s.reps > 0),
                  );
                  const warmupSets = log.sets.filter(
                    (s) => s.type === "warmup" && (s.weight > 0 || s.reps > 0),
                  );

                  const trophy = getTrophy(log);

                  return (
                    <ExRow key={log.id}>
                      <ExName>
                        {trophy && (
                          <span style={{ marginRight: 4 }}>{trophy}</span>
                        )}
                        {name}
                        {log.feeling && (
                          <FeelingTag $f={log.feeling}>
                            {FEELING_LABEL[log.feeling]}
                          </FeelingTag>
                        )}
                        <ExerciseEvolutionBtn
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/history/exercise/${log.exerciseId}`);
                          }}
                        >
                          ver evolução →
                        </ExerciseEvolutionBtn>
                      </ExName>
                      <SetsList>
                        {warmupSets.map((s) => (
                          <SetPill key={s.id} $type="warmup">
                            aquec {s.weight > 0 ? `${s.weight}kg` : ""}
                            {s.reps > 0 ? ` ×${s.reps}` : ""}
                          </SetPill>
                        ))}
                        {workingSets.map((s, i) => (
                          <SetPill
                            key={s.id}
                            $type="working"
                            $wf={s.weightFeeling}
                          >
                            S{i + 1} {s.weight > 0 ? `${s.weight}kg` : ""}
                            {s.weight > 0 && s.reps > 0 ? "×" : ""}
                            {s.reps > 0 ? s.reps : ""}
                            {s.repsFeeling === "heavy" && " 🔁🔴"}
                            {s.repsFeeling === "light" && " 🔁🟢"}
                          </SetPill>
                        ))}
                        {workingSets.length === 0 &&
                          warmupSets.length === 0 && (
                            <MetaItem style={{ fontSize: "0.75rem" }}>
                              sem dados registrados
                            </MetaItem>
                          )}
                      </SetsList>
                    </ExRow>
                  );
                })}
              </Detail>
            )}

            <CardActions>
              <ActionBtn
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/history/${session.id}/edit`);
                }}
              >
                ✏️ Editar
              </ActionBtn>
              <ActionBtn
                type="button"
                $danger
                disabled={deletingId === session.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(session);
                }}
              >
                {deletingId === session.id ? "…" : "🗑️ Excluir"}
              </ActionBtn>
            </CardActions>
          </SessionCard>
        );
      })}
      {ConfirmDialog}
    </>
  );
};
