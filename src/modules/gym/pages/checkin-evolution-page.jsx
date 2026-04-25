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

// ── Stats ─────────────────────────────────────────────────────────────────────

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
  grid-template-columns: 80px 1fr;
  min-width: 200px;
`;

const TableCell = styled.div`
  padding: 12px 10px;
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

const CellValue = styled.span`
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.8125rem;
`;

const CellLabel = styled.span`
  color: var(--text-secondary);
  font-size: 0.75rem;
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

const formatValue = (value, fieldType, unit) => {
  if (value === null || value === undefined) return "—";
  
  if (fieldType === "boolean") {
    return value ? "Sim" : "Não";
  }
  
  if (fieldType === "scale") {
    return `${value}`;
  }
  
  if (fieldType === "number") {
    return unit ? `${value}${unit}` : `${value}`;
  }

  if (fieldType === "time") {
    return value;
  }
  
  return String(value);
};

// ── Component ─────────────────────────────────────────────────────────────────

export const CheckinEvolutionPage = () => {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gymApi
      .fetchCheckinQuestionEvolution(questionId)
      .then(({ data: response }) => {
        setData(response);
      })
      .catch((err) => {
        console.error(err);
        navigate(-1);
      })
      .finally(() => setLoading(false));
  }, [questionId, navigate]);

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

  if (!data || data.evolution.length === 0) {
    return (
      <>
        <Header>
          <BackBtn onClick={() => navigate(-1)}>←</BackBtn>
          <PageTitle>{data?.question?.label || "Pergunta"}</PageTitle>
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
            Responda essa pergunta no check-in para ver a evolução.
          </p>
        </div>
      </>
    );
  }

  const { question, evolution } = data;
  const values = evolution
    .map((e) => {
      if (question.field_type === "number" || question.field_type === "scale") {
        return typeof e.value === "number" ? e.value : null;
      }
      return null;
    })
    .filter((v) => v !== null);

  const maxValue = values.length > 0 ? Math.max(...values) : 1;
  const minValue = values.length > 0 ? Math.min(...values) : 0;
  const avgValue = values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : 0;
  const lastValue = evolution[0]?.value;
  const prevValue = evolution[1]?.value;
  const isDelta = question.field_type === "number" || question.field_type === "scale";
  let delta = null;
  if (isDelta && lastValue !== null && prevValue !== null) {
    delta = lastValue - prevValue;
  }

  // For numeric data, compute bar chart
  const showChart = question.field_type === "number" || question.field_type === "scale";
  const N = evolution.length;

  return (
    <>
      <Header>
        <BackBtn onClick={() => navigate(-1)}>←</BackBtn>
        <PageTitle>{question.label}</PageTitle>
      </Header>

      {/* Stats - only for numeric fields */}
      {showChart && (
        <StatsRow>
          <StatCard>
            <StatValue>{formatValue(lastValue, question.field_type, question.unit)}</StatValue>
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
            <StatValue>
              {formatValue(Math.max(...values), question.field_type, question.unit)}
            </StatValue>
            <StatLabel>Máximo</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{avgValue}</StatValue>
            <StatLabel>Média</StatLabel>
          </StatCard>
        </StatsRow>
      )}

      {/* Chart - only for numeric fields */}
      {showChart && (
        <>
          <SectionLabel>Evolução</SectionLabel>
          <ChartWrap>
            <ChartInner $count={N}>
              <BarChart>
                {[...evolution].reverse().map((entry, i) => {
                  const val = entry.value;
                  const pct = maxValue > 0 ? ((val - minValue) / (maxValue - minValue)) * 100 : 0;
                  return (
                    <BarCol key={i}>
                      <BarValue>{formatValue(val, question.field_type, question.unit)}</BarValue>
                      <Bar
                        $pct={Math.max(pct, 4)}
                        $highlight={i === 0}
                      />
                      <BarLabel>{formatShortDate(entry.date)}</BarLabel>
                    </BarCol>
                  );
                })}
              </BarChart>
            </ChartInner>
          </ChartWrap>
        </>
      )}

      {/* History Table */}
      <SectionLabel>Histórico</SectionLabel>
      <TableWrap>
        <TableGrid>
          {/* Header */}
          <TableHeaderRow>
            <HeaderCell>Data</HeaderCell>
            <HeaderCell>Valor</HeaderCell>
          </TableHeaderRow>

          {/* Rows - newest first */}
          {[...evolution].map((entry, i) => (
            <TableDataRow key={i}>
              <TableCell>
                <CellValue>{formatShortDate(entry.date)}</CellValue>
              </TableCell>
              <TableCell>
                <CellValue>{formatValue(entry.value, question.field_type, question.unit)}</CellValue>
              </TableCell>
            </TableDataRow>
          ))}
        </TableGrid>
      </TableWrap>
    </>
  );
};
