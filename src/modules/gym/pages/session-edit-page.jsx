import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import * as gymApi from "../api";
import { Button } from "../../../components/button";
import { Skeleton } from "../../../components/skeleton";
import { toast } from "../../../lib/toast";

// ── Styles ────────────────────────────────────────────────────────────────────

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
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
`;

const Section = styled.div`
  margin-bottom: 20px;
`;

const SectionLabel = styled.p`
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  margin-bottom: 8px;
`;

const DateInput = styled.input`
  width: 100%;
  min-height: 48px;
  padding: 0 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  outline: none;
  &:focus {
    border-color: var(--color-primary);
  }
`;

const ExCard = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  margin-bottom: 10px;
  overflow: hidden;
`;

const ExHeader = styled.div`
  padding: 12px 14px;
  border-bottom: 1px solid var(--border);
`;

const ExName = styled.p`
  font-weight: 700;
  font-size: 0.9375rem;
`;

const ExMeta = styled.p`
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 2px;
`;

const SetOuter = styled.div`
  border-bottom: 1px solid var(--border);
  background: ${({ $wf }) => {
    if ($wf === "heavy")
      return "color-mix(in srgb, var(--color-danger) 8%, transparent)";
    if ($wf === "light")
      return "color-mix(in srgb, var(--color-success) 8%, transparent)";
    return "transparent";
  }};
  &:last-child {
    border-bottom: none;
  }
`;

const SetRow = styled.div`
  display: grid;
  grid-template-columns: 56px 1fr 1fr;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
`;

const SetFeelingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px 8px;
`;

const FeelingGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
`;

const FeelingGroupLabel = styled.span`
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  flex-shrink: 0;
  width: 28px;
`;

const FeelingDotBtn = styled.button`
  width: 28px;
  height: 28px;
  min-height: 28px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 2px solid
    ${({ $selected, $color }) => ($selected ? $color : "var(--border)")};
  background: ${({ $selected, $color }) =>
    $selected ? `${$color}33` : "var(--bg-secondary)"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  transition: all 0.1s;
  &:active {
    transform: scale(0.9);
  }
`;

const SetBadge = styled.span`
  font-size: 0.6875rem;
  font-weight: 700;
  padding: 3px 6px;
  border-radius: 99px;
  text-align: center;
  background: ${({ $type }) =>
    $type === "warmup"
      ? "color-mix(in srgb, #f59e0b 20%, transparent)"
      : "var(--bg-secondary)"};
  color: ${({ $type }) =>
    $type === "warmup" ? "#92670a" : "var(--text-secondary)"};
`;

const NumInput = styled.input`
  width: 100%;
  min-height: 40px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.9375rem;
  font-weight: 600;
  text-align: center;
  outline: none;
  &:focus {
    border-color: var(--color-primary);
  }
`;

const InputLabel = styled.span`
  font-size: 0.6875rem;
  color: var(--text-secondary);
  text-align: center;
  display: block;
  margin-top: 2px;
`;

const WEIGHT_FEELING_OPTS = [
  { value: "heavy", icon: "🔴", title: "Pesado" },
  { value: "normal", icon: "⚪", title: "Ok" },
  { value: "light", icon: "🟢", title: "Leve" },
];
const REPS_FEELING_OPTS = [
  { value: "heavy", icon: "🔴", title: "Não completou" },
  { value: "normal", icon: "⚪", title: "Ok" },
  { value: "light", icon: "🟢", title: "Poderia mais" },
];
const FEELING_COLORS = {
  heavy: "var(--color-danger)",
  normal: "var(--text-secondary)",
  light: "var(--color-success)",
};

// ── Component ─────────────────────────────────────────────────────────────────

export const SessionEditPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable state
  const [date, setDate] = useState("");
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    gymApi
      .fetchSession(sessionId)
      .then(({ data }) => {
        const sess = data.data;
        setSession(sess);
        setDate(sess.date ? sess.date.slice(0, 10) : "");
        setLogs(
          sess.exerciseLogs.map((log) => ({
            id: log.id,
            exerciseId: log.exerciseId,
            substitutedExerciseId: log.substitutedExerciseId,
            exercise: log.substitutedExercise ?? log.exercise,
            feeling: log.feeling,
            sets: log.sets.map((s) => ({
              id: s.id,
              setNumber: s.setNumber,
              type: s.type,
              weight: s.weight ?? "",
              reps: s.reps ?? "",
              weightFeeling: s.weightFeeling ?? null,
              repsFeeling: s.repsFeeling ?? null,
            })),
          })),
        );
      })
      .catch(() => toast.error("Erro ao carregar sessão"))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const updateSet = (logId, setId, field, value) => {
    setLogs((prev) =>
      prev.map((log) =>
        log.id !== logId
          ? log
          : {
              ...log,
              sets: log.sets.map((s) =>
                s.id !== setId ? s : { ...s, [field]: value },
              ),
            },
      ),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const totalVolume = logs.reduce(
        (acc, log) =>
          acc +
          log.sets
            .filter((s) => s.type === "working")
            .reduce(
              (a, s) =>
                a + (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0),
              0,
            ),
        0,
      );

      await gymApi.updateSession(sessionId, {
        date,
        totalVolume,
        exerciseLogs: logs.map((log) => ({
          id: log.id,
          exerciseId: log.exerciseId,
          substitutedExerciseId: log.substitutedExerciseId,
          feeling: log.feeling,
          sets: log.sets.map((s) => ({
            id: s.id,
            setNumber: s.setNumber,
            type: s.type,
            weight: parseFloat(s.weight) || 0,
            reps: parseInt(s.reps) || 0,
            weightFeeling: s.weightFeeling ?? null,
            repsFeeling: s.repsFeeling ?? null,
          })),
        })),
      });

      toast.success("Sessão atualizada!");
      navigate("/history");
    } catch {
      toast.error("Erro ao salvar alterações");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header>
          <BackBtn onClick={() => navigate(-1)}>←</BackBtn>
          <Skeleton $height="20px" $width="60%" />
        </Header>
        {[1, 2, 3].map((i) => (
          <Skeleton
            key={i}
            $height="120px"
            style={{ borderRadius: 12, marginBottom: 10 }}
          />
        ))}
      </>
    );
  }

  if (!session) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "48px 16px",
          color: "var(--color-danger)",
        }}
      >
        Sessão não encontrada.
      </div>
    );
  }

  return (
    <>
      <Header>
        <BackBtn onClick={() => navigate(-1)}>←</BackBtn>
        <PageTitle>Editar sessão</PageTitle>
      </Header>

      {/* Date */}
      <Section>
        <SectionLabel>Data</SectionLabel>
        <DateInput
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </Section>

      {/* Exercise logs */}
      <Section>
        <SectionLabel>Exercícios e séries</SectionLabel>

        {logs.map((log) => {
          const workingSets = log.sets.filter((s) => s.type === "working");
          return (
            <ExCard key={log.id}>
              <ExHeader>
                <ExName>{log.exercise?.name ?? "—"}</ExName>
                <ExMeta>
                  {workingSets.length} série
                  {workingSets.length !== 1 ? "s" : ""} de trabalho
                </ExMeta>
              </ExHeader>

              {log.sets.map((set) => (
                <SetOuter key={set.id} $wf={set.weightFeeling}>
                  <SetRow>
                    <div>
                      <SetBadge $type={set.type}>
                        {set.type === "warmup" ? "AQUEC" : `S${set.setNumber}`}
                      </SetBadge>
                    </div>
                    <div>
                      <NumInput
                        type="number"
                        inputMode="decimal"
                        value={set.weight}
                        onChange={(e) =>
                          updateSet(log.id, set.id, "weight", e.target.value)
                        }
                        placeholder="0"
                      />
                      <InputLabel>kg</InputLabel>
                    </div>
                    <div>
                      <NumInput
                        type="number"
                        inputMode="numeric"
                        value={set.reps}
                        onChange={(e) =>
                          updateSet(log.id, set.id, "reps", e.target.value)
                        }
                        placeholder="0"
                      />
                      <InputLabel>reps</InputLabel>
                    </div>
                  </SetRow>

                  <SetFeelingRow>
                    <FeelingGroup>
                      <FeelingGroupLabel>Peso</FeelingGroupLabel>
                      {WEIGHT_FEELING_OPTS.map((f) => (
                        <FeelingDotBtn
                          key={f.value}
                          type="button"
                          title={f.title}
                          $selected={set.weightFeeling === f.value}
                          $color={FEELING_COLORS[f.value]}
                          onClick={() =>
                            updateSet(
                              log.id,
                              set.id,
                              "weightFeeling",
                              set.weightFeeling === f.value ? null : f.value,
                            )
                          }
                        >
                          {f.icon}
                        </FeelingDotBtn>
                      ))}
                    </FeelingGroup>
                    <FeelingGroup>
                      <FeelingGroupLabel>Reps</FeelingGroupLabel>
                      {REPS_FEELING_OPTS.map((f) => (
                        <FeelingDotBtn
                          key={f.value}
                          type="button"
                          title={f.title}
                          $selected={set.repsFeeling === f.value}
                          $color={FEELING_COLORS[f.value]}
                          onClick={() =>
                            updateSet(
                              log.id,
                              set.id,
                              "repsFeeling",
                              set.repsFeeling === f.value ? null : f.value,
                            )
                          }
                        >
                          {f.icon}
                        </FeelingDotBtn>
                      ))}
                    </FeelingGroup>
                  </SetFeelingRow>
                </SetOuter>
              ))}
            </ExCard>
          );
        })}
      </Section>

      <Button $fullWidth onClick={handleSave} disabled={saving}>
        {saving ? "Salvando…" : "Salvar alterações"}
      </Button>

      <div style={{ height: 32 }} />
    </>
  );
};
