import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import * as gymApi from "../api";
import { Skeleton } from "../../../components/skeleton";
import { FEELING_COLORS } from "../constants/feeling-colors";

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
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SectionLabel = styled.p`
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  margin-bottom: 10px;
  margin-top: 20px;
`;

// ── Chart ─────────────────────────────────────────────────────────────────────

const ChartWrap = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 16px;
  overflow-x: auto;
`;

const ChartInner = styled.div`
  position: relative;
  min-width: ${({ $count }) => Math.max($count * 44, 100)}px;
`;

const BarChart = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 120px;
`;

const BarCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 28px;
`;

const Bar = styled.div`
  width: 100%;
  border-radius: 4px 4px 0 0;
  background: var(--color-primary);
  opacity: ${({ $highlight }) => ($highlight ? 1 : 0.5)};
  height: ${({ $pct }) => Math.max($pct, 4)}%;
  transition: height 0.3s ease;
  position: relative;
`;

const BarLabel = styled.span`
  font-size: 0.625rem;
  color: var(--text-secondary);
  text-align: center;
  white-space: nowrap;
`;

const BarValue = styled.span`
  font-size: 0.625rem;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
  white-space: nowrap;
`;

// ── Table ─────────────────────────────────────────────────────────────────────

const TableWrap = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  overflow-x: auto;
`;

const TableGrid = styled.div`
  display: grid;
  grid-template-columns: ${({ $cols }) => $cols};
  min-width: ${({ $minWidth }) => $minWidth}px;
`;

const TableCell = styled.div`
  padding: 8px 10px;
  border-bottom: 1px solid var(--border);
  border-right: 1px solid var(--border);
  font-size: 0.8125rem;
  display: flex;
  flex-direction: column;
  gap: 2px;
  &:last-child {
    border-right: none;
  }
`;

const TableHeaderRow = styled.div`
  display: contents;
`;

const TableDataRow = styled.div`
  display: contents;
  &:last-child > ${TableCell} {
    border-bottom: none;
  }
`;

const HeaderCell = styled(TableCell)`
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  padding: 7px 10px;
`;

const SetWeight = styled.span`
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.8125rem;
`;

const SetReps = styled.span`
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
  background: ${({ $f }) => FEELING_COLORS[$f] || "var(--border)"};
`;

// ── Stat Cards ────────────────────────────────────────────────────────────────

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  margin-bottom: 4px;
`;

const StatCard = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 12px 10px;
  text-align: center;
`;

const StatValue = styled.p`
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-primary-dark);
`;

const StatLabel = styled.p`
  font-size: 0.6875rem;
  color: var(--text-secondary);
  margin-top: 2px;
`;

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatShortDate = (dateStr) => {
  const [y, m, d] = dateStr.slice(0, 10).split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date
    .toLocaleDateString("pt-BR", { day: "numeric", month: "short" })
    .replace(". ", "/")
    .replace(".", "");
};

// ── Component ─────────────────────────────────────────────────────────────────

export const ExerciseEvolutionPage = () => {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [exerciseName, setExerciseName] = useState("");
  const [loading, setLoading] = useState(true);
  const [plannedReps, setPlannedReps] = useState([]); // repsRange per working set position

  useEffect(() => {
    gymApi
      .fetchSessions({ status: "completed" })
      .then(({ data }) => {
        const sessions = data.data;
        const result = [];
        let templateId = null;

        for (const sess of sessions) {
          const log = sess.exerciseLogs.find(
            (l) =>
              l.exerciseId === exerciseId ||
              l.substitutedExerciseId === exerciseId,
          );
          if (!log) continue;

          if (!templateId && sess.workoutTemplateId) {
            templateId = sess.workoutTemplateId;
          }

          const workingSets = log.sets.filter(
            (s) => s.type === "working" && s.reps > 0,
          );
          if (workingSets.length === 0) continue;

          const maxWeight = Math.max(...workingSets.map((s) => s.weight));

          // Aggregate per-set feelings: order by intensity
          const wfList = workingSets
            .map((s) => s.weightFeeling)
            .filter(Boolean);
          const rfList = workingSets.map((s) => s.repsFeeling).filter(Boolean);
          const aggFeeling = (list) => {
            // Priority: most challenging first
            if (list.includes("very_heavy") || list.includes("heavy"))
              return "very_heavy";
            if (list.includes("light")) return "light";
            if (list.includes("normal")) return "normal";
            if (list.includes("very_light")) return "very_light";
            if (list.includes("too_light")) return "too_light";
            return null;
          };

          result.push({
            date: sess.date,
            maxWeight,
            sets: workingSets.length,
            weightFeeling: aggFeeling(wfList),
            repsFeeling: aggFeeling(rfList),
            workingSets,
          });
        }

        // Sort oldest → newest
        result.sort((a, b) => new Date(a.date) - new Date(b.date));
        setRows(result);

        // Fetch planned reps from template
        if (templateId) {
          gymApi
            .fetchTemplate(templateId)
            .then(({ data: tplData }) => {
              const tpl = tplData.data;
              const ex = tpl.exercises.find((e) => e.exerciseId === exerciseId);
              if (!ex) return;
              const expanded = [];
              for (const s of ex.sets) {
                if (s.type === "working") {
                  for (let i = 0; i < (s.quantity || 1); i++) {
                    expanded.push(s.repsRange ?? null);
                  }
                }
              }
              setPlannedReps(expanded);
            })
            .catch(() => {});
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [exerciseId]);

  // Also fetch exercise name
  useEffect(() => {
    gymApi
      .fetchExercise(exerciseId)
      .then(({ data }) => {
        if (data.data?.name) setExerciseName(data.data.name);
      })
      .catch(() => {});
  }, [exerciseId]);

  if (loading) {
    return (
      <>
        <Header>
          <BackBtn onClick={() => navigate(-1)}>←</BackBtn>
          <Skeleton $height="20px" $width="60%" />
        </Header>
        <Skeleton
          $height="140px"
          style={{ borderRadius: 12, marginBottom: 16 }}
        />
        <Skeleton $height="200px" style={{ borderRadius: 12 }} />
      </>
    );
  }

  if (rows.length === 0) {
    return (
      <>
        <Header>
          <BackBtn onClick={() => navigate(-1)}>←</BackBtn>
          <PageTitle>{exerciseName || "Exercício"}</PageTitle>
        </Header>
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
            📊
          </span>
          <strong style={{ color: "var(--text-primary)" }}>
            Sem dados ainda
          </strong>
          <p style={{ marginTop: 4, fontSize: "0.875rem" }}>
            Complete treinos com esse exercício para ver a evolução.
          </p>
        </div>
      </>
    );
  }

  const maxW = Math.max(...rows.map((r) => r.maxWeight));
  const best = rows.reduce((a, b) => (a.maxWeight >= b.maxWeight ? a : b));
  const last = rows[rows.length - 1];
  const prev = rows.length >= 2 ? rows[rows.length - 2] : null;
  const delta = prev ? last.maxWeight - prev.maxWeight : null;

  // Dynamic table columns
  const maxSets = Math.max(...rows.map((r) => r.workingSets.length));
  const colTemplate = `68px${" 1fr".repeat(maxSets)}`;
  const tableMinWidth = 68 + maxSets * 90;

  // SVG polyline points — bar chart area height is 120px, bar bottom is at 120px
  // We only need normalized heights; the SVG will be positioned over the bars
  const N = rows.length;
  // Each bar column: flex with gap 6px; we approximate centers evenly
  const svgW = N * 44; // matches ChartInner min-width
  const svgH = 100;
  //const barAreaH = 120; // matches BarChart height
  //const labelH = 24; // approximate height of BarValue + BarLabel above bar

  const polylinePoints = rows
    .map((r, i) => {
      const x = (i + 0.5) * (svgW / N);
      // bar top = barAreaH * (1 - pct/100), but we want it relative to the bar area
      const pct = maxW > 0 ? (r.maxWeight / maxW) * 100 : 0;
      const y = svgH - Math.max(pct, 4) * (svgH / 100);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <>
      <Header>
        <BackBtn onClick={() => navigate(-1)}>←</BackBtn>
        <PageTitle>{exerciseName || "Exercício"}</PageTitle>
      </Header>

      {/* Stats */}
      <StatsRow>
        <StatCard>
          <StatValue>{last.maxWeight}kg</StatValue>
          <StatLabel>
            Último
            {delta !== null && delta !== 0 && (
              <span
                style={{
                  color:
                    delta > 0 ? "var(--color-success)" : "var(--color-danger)",
                  marginLeft: 2,
                }}
              >
                {delta > 0 ? `+${delta}` : delta}
              </span>
            )}
          </StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{best.maxWeight}kg</StatValue>
          <StatLabel>Recorde</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{rows.length}</StatValue>
          <StatLabel>Sessões</StatLabel>
        </StatCard>
      </StatsRow>

      {/* Weight chart with polyline */}
      <SectionLabel>Carga máxima (kg)</SectionLabel>
      <ChartWrap>
        <ChartInner $count={N}>
          <BarChart>
            {rows.map((r, i) => (
              <BarCol key={i}>
                <BarValue>{r.maxWeight}</BarValue>
                <Bar
                  $pct={maxW > 0 ? (r.maxWeight / maxW) * 100 : 0}
                  $highlight={i === rows.length - 1}
                />
                <BarLabel>{formatShortDate(r.date)}</BarLabel>
              </BarCol>
            ))}
          </BarChart>

          {/* SVG line overlay — covers bar area only (excludes labels below) */}
          {N > 1 && (
            <svg
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 24, // exclude BarLabel row (~24px)
                width: "100%",
                height: `calc(100% - 24px)`,
                pointerEvents: "none",
              }}
              viewBox={`0 0 ${N * 44} ${svgH}`}
              preserveAspectRatio="none"
            >
              <polyline
                points={polylinePoints}
                fill="none"
                stroke="var(--color-primary-dark)"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
              {rows.map((r, i) => {
                const x = (i + 0.5) * (svgW / N);
                const pct = maxW > 0 ? (r.maxWeight / maxW) * 100 : 0;
                const y = svgH - Math.max(pct, 4) * (svgH / 100);
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="3"
                    fill={
                      i === rows.length - 1
                        ? "var(--color-primary-dark)"
                        : "var(--bg-card)"
                    }
                    stroke="var(--color-primary-dark)"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
            </svg>
          )}
        </ChartInner>
      </ChartWrap>

      {/* Detail table — Date | S1 | S2 | ... */}
      <SectionLabel>Detalhes</SectionLabel>
      <TableWrap>
        <TableGrid $cols={colTemplate} $minWidth={tableMinWidth}>
          {/* Header */}
          <TableHeaderRow>
            <HeaderCell>Data</HeaderCell>
            {Array.from({ length: maxSets }, (_, i) => (
              <HeaderCell key={i}>
                S{i + 1}
                {plannedReps[i] && (
                  <span
                    style={{
                      fontWeight: 400,
                      color: "var(--text-secondary)",
                      marginLeft: 3,
                    }}
                  >
                    {plannedReps[i]}
                  </span>
                )}
              </HeaderCell>
            ))}
          </TableHeaderRow>

          {/* Rows — newest first */}
          {[...rows].reverse().map((r, ri) => (
            <TableDataRow key={ri}>
              <TableCell>
                <span style={{ fontWeight: 600, fontSize: "0.8125rem" }}>
                  {formatShortDate(r.date)}
                </span>
              </TableCell>
              {Array.from({ length: maxSets }, (_, si) => {
                const s = r.workingSets[si];
                if (!s) return <TableCell key={si} />;
                return (
                  <TableCell key={si}>
                    <SetWeight>
                      {s.weight > 0 ? `${s.weight}kg` : "—"}
                      {s.weightFeeling && <FeelingDot $f={s.weightFeeling} />}
                    </SetWeight>
                    <SetReps>
                      {s.reps > 0 ? `×${s.reps}` : "—"}
                      {s.repsFeeling && <FeelingDot $f={s.repsFeeling} />}
                    </SetReps>
                  </TableCell>
                );
              })}
            </TableDataRow>
          ))}
        </TableGrid>
      </TableWrap>
    </>
  );
};
