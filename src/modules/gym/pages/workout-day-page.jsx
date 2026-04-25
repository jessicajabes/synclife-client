import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import styled from "styled-components";
import { useAuthStore } from "../../../store/auth-store";
import { useGymStore } from "../store";
import * as gymApi from "../api";
import { RestTimer } from "../components/rest-timer";
import { PlateCalculator } from "../components/plate-calculator";
import { Button } from "../../../components/button";
import { toast } from "../../../lib/toast";
import {
  WEIGHT_FEELING_OPTS,
  FEELING_COLORS,
  getFeelingDescriptor,
} from "../constants/feeling-colors";

// ── Styles ────────────────────────────────────────────────────────────────────

const FocusHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  margin: -16px -16px 0;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const TemplateName = styled.h2`
  font-size: 1rem;
  font-weight: 700;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FinishBtn = styled.button`
  min-height: 36px;
  padding: 0 14px;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: #1a2e0a;
  font-weight: 700;
  font-size: 0.875rem;
  flex-shrink: 0;
`;

const ElapsedTime = styled.span`
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin-right: 10px;
  font-variant-numeric: tabular-nums;
`;

const Content = styled.div`
  padding-top: 16px;
  padding-bottom: 120px;
  position: relative;
`;

const RestTimerWrapper = styled.div`
  position: sticky;
  top: 0;
  z-index: 30;
  margin: -16px -16px 16px;
  padding: 12px 16px;
`;

const SectionHeader = styled.div`
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  padding: 12px 4px 6px;
`;

const ExCard = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  margin-bottom: 10px;
  overflow: hidden;
`;

const ExCardHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 14px;
  gap: 8px;
`;

const ExName = styled.p`
  flex: 1;
  font-weight: 600;
  font-size: 0.9375rem;
  min-width: 0;
`;

const ExActionBtn = styled.button`
  width: 36px;
  height: 36px;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  font-size: 1rem;
  color: var(--text-secondary);
  flex-shrink: 0;
  &:active {
    background: var(--bg-secondary);
  }
`;

const SetsTable = styled.div`
  border-top: 1px solid var(--border);
`;

const SetRowOuter = styled.div`
  border-bottom: 1px solid var(--border);
  transition: background 0.2s;
  background: ${({ $done, $wf }) => {
    if (!$done) return "transparent";
    if ($wf === "heavy")
      return "color-mix(in srgb, var(--color-danger) 8%, transparent)";
    if ($wf === "light")
      return "color-mix(in srgb, var(--color-success) 8%, transparent)";
    return "color-mix(in srgb, var(--color-primary) 6%, transparent)";
  }};

  &:last-child {
    border-bottom: none;
  }
`;

const SetRowInner = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 10px;
`;

/* Compact feeling row: [⚖️ ● ● ●]  [🔁 ● ● ●] */
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
  width: 32px;
  text-align: center;
  font-size: 0.625rem;
  font-weight: 700;
  padding: 2px 4px;
  border-radius: 99px;
  flex-shrink: 0;
  background: ${({ $type }) =>
    $type === "warmup"
      ? "color-mix(in srgb, var(--color-warmup) 20%, transparent)"
      : "var(--bg-secondary)"};
  color: ${({ $type }) =>
    $type === "warmup" ? "#92670a" : "var(--text-secondary)"};
`;

const WeightInput = styled.input`
  width: 56px;
  min-height: 40px;
  border: 2px solid
    ${({ $feeling, $hint }) => {
      if (!$feeling) return "var(--border)";
      const color = FEELING_COLORS[$feeling] || "var(--border)";
      if ($hint) return `color-mix(in srgb, ${color} 40%, var(--border))`; // suave
      return color; // forte
    }};
  border-radius: var(--radius-md);
  background: ${({ $feeling, $hint }) => {
    if (!$feeling) return "var(--bg-secondary)";
    const color = FEELING_COLORS[$feeling];
    if ($hint) return `color-mix(in srgb, ${color} 5%, var(--bg-secondary))`; // quase invisível
    return `color-mix(in srgb, ${color} 8%, var(--bg-secondary))`;
  }};
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
  padding: 0 3px;
  outline: none;
  transition:
    border-color 0.15s,
    background 0.15s;
  &:focus {
    border-color: var(--color-primary);
  }
`;

const RepsInput = styled(WeightInput)`
  width: 48px;
`;

const Sep = styled.span`
  color: var(--text-secondary);
  font-size: 0.875rem;
`;

const DoneBtn = styled.button`
  width: 40px;
  height: 40px;
  min-height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  flex-shrink: 0;
  background: ${({ $done }) =>
    $done ? "var(--color-primary)" : "var(--bg-secondary)"};
  color: ${({ $done }) => ($done ? "#1a2e0a" : "var(--text-secondary)")};
  border: 2px solid
    ${({ $done }) => ($done ? "var(--color-primary)" : "var(--border)")};
  transition: all 0.15s;
`;

const PlateBtn = styled.button`
  font-size: 0.875rem;
  min-height: 32px;
  padding: 0 4px;
  color: var(--text-secondary);
  flex-shrink: 0;
`;

const PrescribedLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  white-space: nowrap;
  flex-shrink: 0;
`;

const LastFeeling = styled.div`
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 99px;
  margin-top: 3px;
  display: inline-block;
  background: ${({ $f }) =>
    $f === "heavy"
      ? "color-mix(in srgb, var(--color-danger) 15%, transparent)"
      : $f === "light"
        ? "color-mix(in srgb, var(--color-success) 15%, transparent)"
        : "var(--bg-secondary)"};
  color: ${({ $f }) =>
    $f === "heavy"
      ? "var(--color-danger)"
      : $f === "light"
        ? "var(--color-success)"
        : "var(--text-secondary)"};
`;

// ── Weight Feeling Picker (New inline selector) ────────────────────────────────

const WeightFeelingPickerRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-top: 1px solid var(--border);
`;

const WeightFeelingPickerLabel = styled.span`
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--text-secondary);
  flex-shrink: 0;
`;

const FeelingColorBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 2px solid transparent;
  background: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  color: white;
  transition: all 0.15s;
  opacity: ${({ $selected }) => ($selected ? 1 : 0.5)};
  transform: ${({ $selected }) => ($selected ? "scale(1)" : "scale(0.85)")};
  
  &:active {
    transform: scale(0.95);
  }
`;

const FeelingColorLabel = styled.div`
  font-size: 0.65rem;
  font-weight: 600;
  text-align: center;
  color: var(--text-secondary);
  margin-top: 2px;
`;

const FeelingOption = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex: 1;
`;

// ── Compact feeling indicator (○ or colored dot) ────────────────────────────────

const CompactFeelingDot = styled.button`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 2px solid ${({ $color }) => $color || "var(--border)"};
  background: ${({ $color }) => ($color ? `${$color}20` : "transparent")};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.5rem;
  transition: all 0.15s;
  cursor: pointer;
  
  &:active {
    transform: scale(0.9);
  }
`;

// ── Exercise History Modal ─────────────────────────────────────────────────────

const HistoryOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 110;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const HistorySheet = styled.div`
  background: var(--bg-primary);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  max-height: 78dvh;
  display: flex;
  flex-direction: column;
`;

const HistorySheetHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 10px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
`;

const HistorySheetTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const HistoryList = styled.div`
  overflow-y: auto;
  flex: 1;
  padding: 8px 0 16px;
`;

const HistorySessionBlock = styled.div`
  padding: 10px 16px;
  border-bottom: 1px solid var(--border);
  &:last-child {
    border-bottom: none;
  }
`;

const HistoryDate = styled.p`
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--color-primary-dark);
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const FeelingDot = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $f }) => {
    if ($f === "very_heavy" || $f === "heavy") return "#ef4444";  // 🔴
    if ($f === "light")      return "#f97316";                    // 🟠
    if ($f === "normal")     return "#6b7280";                    // ⚪
    if ($f === "very_light") return "#3b82f6";                    // 🔵
    if ($f === "too_light")  return "#22c55e";                    // 🟢
    return "var(--text-secondary)";
  }};
`;

const HistorySetLine = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8125rem;
  padding: 2px 0;
`;

const HistorySetBadge = styled.span`
  font-size: 0.6875rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 99px;
  min-width: 44px;
  text-align: center;
  flex-shrink: 0;
  background: ${({ $type }) =>
    $type === "warmup"
      ? "color-mix(in srgb, #f59e0b 15%, transparent)"
      : "var(--bg-secondary)"};
  color: ${({ $type }) =>
    $type === "warmup" ? "#92670a" : "var(--text-secondary)"};
`;

const HistorySetValue = styled.span`
  font-weight: 600;
  color: var(--text-primary);
`;

const HistorySetVol = styled.span`
  color: var(--text-secondary);
  font-size: 0.75rem;
`;

const LastHint = styled.p`
  font-size: 0.75rem;
  color: var(--text-secondary);
  flex: 1;
  text-align: right;
  padding-right: 4px;
`;

// ── Substitute Picker ─────────────────────────────────────────────────────────

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const Sheet = styled.div`
  background: var(--bg-primary);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  max-height: 75dvh;
  display: flex;
  flex-direction: column;
`;

const SheetHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 10px;
`;

const SheetTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
`;

const CloseBtn = styled.button`
  font-size: 1.25rem;
  color: var(--text-secondary);
  width: 36px;
  height: 36px;
  min-height: 36px;
`;

const PickerList = styled.ul`
  list-style: none;
  overflow-y: auto;
  flex: 1;
`;

const PickerItem = styled.li`
  padding: 12px 16px;
  border-top: 1px solid var(--border);
  &:active {
    background: var(--bg-secondary);
  }
`;

// ── Summary overlay ───────────────────────────────────────────────────────────

const SummaryOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: var(--bg-primary);
  z-index: 200;
  overflow-y: auto;
  padding: 32px 20px 48px;
`;

const SummaryTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 8px;
`;

const VolumeNumber = styled.p`
  font-size: 2.5rem;
  font-weight: 900;
  text-align: center;
  color: var(--color-primary-dark);
  margin-bottom: 4px;
`;

const VolumeLabel = styled.p`
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9375rem;
  margin-bottom: 24px;
`;

const SummaryCard = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 16px;
  margin-bottom: 12px;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.9375rem;
  padding: 4px 0;
  color: var(--text-secondary);
  span:last-child {
    color: var(--text-primary);
    font-weight: 600;
  }
`;

const NoteArea = styled.textarea`
  width: 100%;
  min-height: 80px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  padding: 12px 14px;
  resize: vertical;
  outline: none;
  margin-top: 16px;
  margin-bottom: 16px;
  &:focus {
    border-color: var(--color-primary);
  }
`;

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Expand template exercise sets into flat individual set rows.
 * E.g. [{type:'warmup', quantity:1, repsRange:'12-15'}, {type:'working', quantity:3, repsRange:'7-9'}]
 * → 4 rows: [{num:1,type:'warmup',reps:'12-15'}, {num:2,...}, ...]
 */
const expandSets = (templateSets) => {
  const rows = [];
  let num = 1;
  for (const s of templateSets) {
    for (let i = 0; i < s.quantity; i++) {
      rows.push({
        uid: uuidv4(),
        setNumber: num++,
        type: s.type,
        prescribedReps: s.repsRange,
        restSeconds: s.restSeconds,
      });
    }
  }
  return rows;
};

/**
 * Build initial log state from template exercises + last session data.
 */
const buildInitialLogs = (templateExercises, lastSession) => {
  const logMap = {};
  const lastLogMap = {};

  if (lastSession) {
    for (const log of lastSession.exerciseLogs) {
      lastLogMap[log.exerciseId] = log;
    }
  }

  for (const te of templateExercises) {
    const lastLog = lastLogMap[te.exerciseId];
    const setRows = expandSets(te.sets);

    logMap[te.id] = {
      logId: uuidv4(),
      exerciseId: te.exerciseId,
      substitutedExerciseId: null,
      feeling: null,
      sets: setRows.map((row, idx) => {
        const lastSet = lastLog?.sets?.[idx];
        return {
          ...row,
          weight: lastSet?.weight > 0 ? lastSet.weight : "",
          reps: "",
          weightFeeling: null,
          repsFeeling: null,
          lastWeightFeeling: lastSet?.weightFeeling ?? null,
          lastRepsFeeling: lastSet?.repsFeeling ?? null,
          done: false,
        };
      }),
      lastLog,
    };
  }

  return logMap;
};

// ── Elapsed Timer ─────────────────────────────────────────────────────────────

const useElapsed = (startedAt) => {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startedAt) return;
    const base = Date.now() - new Date(startedAt).getTime();
    setElapsed(Math.floor(base / 1000)); // eslint-disable-line react-hooks/set-state-in-effect
    const id = setInterval(
      () =>
        setElapsed(
          Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000),
        ),
      1000,
    );
    return () => clearInterval(id);
  }, [startedAt]);
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

// ── Component ─────────────────────────────────────────────────────────────────

export const WorkoutDayPage = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const user = useAuthStore((s) => s.user);
  const { exercises, fetchExercises } = useGymStore();

  const [template, setTemplate] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restTimer, setRestTimer] = useState(null); // { seconds }
  const [plateCalc, setPlateCalc] = useState(null); // { weightKg }
  const [substitutePicker, setSubstitutePicker] = useState(null);
  const [exHistory, setExHistory] = useState(null); // { exerciseId, name, sessions: [] }
  const [exHistoryLoading, setExHistoryLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryNote, setSummaryNote] = useState("");
  const [finishing, setFinishing] = useState(false);
  const [summaryTrophies, setSummaryTrophies] = useState([]); // [{trophy, exerciseName}]
  const elapsed = useElapsed(session?.startedAt);

  // Wake Lock
  const wakeLockRef = useRef(null);
  useEffect(() => {
    const acquire = async () => {
      try {
        if ("wakeLock" in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request("screen");
        }
      } catch {
        /* wake lock not supported */
      }
    };
    acquire();
    return () => {
      wakeLockRef.current?.release().catch(() => {});
    };
  }, []);

  const [lastSessionRef, setLastSessionRef] = useState(null);
  const [logsState, setLogsState] = useState({});
  const [editingFeelingSetUid, setEditingFeelingSetUid] = useState(null); // uid do set sendo editado
  const logsLoaded = useRef(false);

  // Load session + template + last session
  useEffect(() => {
    const load = async () => {
      try {
        const { data: sessData } = await gymApi.fetchSession(sessionId);
        const sess = sessData.data;
        setSession(sess);

        // Load template + last session in parallel so both are ready together
        const [tplData, histData] = await Promise.all([
          gymApi.fetchTemplate(sess.workoutTemplateId),
          gymApi.fetchSessions({
            templateId: sess.workoutTemplateId,
            status: "completed",
          }),
        ]);
        const hist = histData.data.data.filter((s) => s.id !== sess.id);
        const last = hist[0] ?? null;

        setTemplate(tplData.data.data);
        setLastSessionRef(last);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const updateLog = (teId, updates) => {
    setLogsState((prev) => ({
      ...prev,
      [teId]: { ...prev[teId], ...updates },
    }));
  };

  const updateSet = (teId, setUid, field, value) => {
    setLogsState((prev) => ({
      ...prev,
      [teId]: {
        ...prev[teId],
        sets: prev[teId].sets.map((s) =>
          s.uid === setUid ? { ...s, [field]: value } : s,
        ),
      },
    }));
  };

  const toggleDone = (teId, setUid, restSeconds = 60) => {
    setLogsState((prev) => {
      const log = prev[teId];
      const set = log.sets.find((s) => s.uid === setUid);
      const wasDone = set?.done;
      const newLogs = {
        ...prev,
        [teId]: {
          ...log,
          sets: log.sets.map((s) =>
            s.uid === setUid ? { ...s, done: !wasDone } : s,
          ),
        },
      };
      if (!wasDone) {
        // Start rest timer
        setRestTimer({ seconds: restSeconds });
        // Save to API in background
        saveLogsToApi(sessionId, newLogs);
      }
      return newLogs;
    });
  };

  // Initialize logs when template/lastSession are loaded
  useEffect(() => {
    if (template && !logsLoaded.current) {
      logsLoaded.current = true;
      const initial = buildInitialLogs(template.exercises, lastSessionRef);

      // Overlay recovery data
      if (session?.exerciseLogs?.length > 0) {
        for (const savedLog of session.exerciseLogs) {
          const teEntry = Object.values(initial).find(
            (l) => l.exerciseId === savedLog.exerciseId,
          );
          if (!teEntry) continue;
          if (savedLog.feeling) teEntry.feeling = savedLog.feeling;
          if (savedLog.substitutedExerciseId)
            teEntry.substitutedExerciseId = savedLog.substitutedExerciseId;
          savedLog.sets?.forEach((ss, idx) => {
            if (teEntry.sets[idx]) {
              if (ss.weight > 0) teEntry.sets[idx].weight = ss.weight;
              if (ss.reps > 0) teEntry.sets[idx].reps = ss.reps;
              teEntry.sets[idx].weightFeeling = ss.weightFeeling ?? null;
              teEntry.sets[idx].repsFeeling = ss.repsFeeling ?? null;
              // lastWeightFeeling/lastRepsFeeling already set from buildInitialLogs
              teEntry.sets[idx].done = ss.weight > 0 || ss.reps > 0;
            }
          });
        }
      }

      setLogsState(initial);
    }
  }, [template, lastSessionRef, session]);

  const saveLogsToApi = async (sid, currentLogs) => {
    try {
      const exerciseLogs = Object.values(currentLogs).map((log) => ({
        id: log.logId,
        exerciseId: log.exerciseId,
        substitutedExerciseId: log.substitutedExerciseId,
        feeling: log.feeling,
        sets: log.sets
          .filter((s) => s.done || s.weight > 0 || s.reps > 0)
          .map((s) => ({
            id: s.uid,
            setNumber: s.setNumber,
            type: s.type,
            weight: parseFloat(s.weight) || 0,
            reps: parseInt(s.reps) || 0,
            weightFeeling: s.weightFeeling ?? null,
            repsFeeling: s.repsFeeling ?? null,
          })),
      }));
      await gymApi.updateSession(sid, { exerciseLogs });
    } catch (err) {
      console.warn("Erro ao salvar progresso:", err.message);
    }
  };

  const openExHistory = async (exerciseId, exerciseName) => {
    setExHistory({ exerciseId, name: exerciseName, sessions: [] });
    setExHistoryLoading(true);
    try {
      const { data } = await gymApi.fetchSessions({ status: "completed" });
      const allSessions = data.data;
      const rows = [];
      for (const sess of allSessions) {
        const log = sess.exerciseLogs.find(
          (l) =>
            l.exerciseId === exerciseId ||
            l.substitutedExerciseId === exerciseId,
        );
        if (!log) continue;
        const sets = log.sets.filter((s) => s.weight > 0 || s.reps > 0);
        if (!sets.length) continue;
        rows.push({ date: sess.date, feeling: log.feeling, sets });
      }
      rows.sort((a, b) => new Date(b.date) - new Date(a.date));
      setExHistory({
        exerciseId,
        name: exerciseName,
        sessions: rows.slice(0, 8),
      });
    } catch {
      /* silent */
    } finally {
      setExHistoryLoading(false);
    }
  };

  const handleFinish = async () => {
    setFinishing(true);
    try {
      await saveLogsToApi(sessionId, logsState);
      const { data } = await gymApi.finishSession(sessionId, {
        notes: summaryNote || undefined,
        finishedAt: new Date().toISOString(),
      });
      setSession(data.data);
      navigate("/");
    } catch (err) {
      toast.error(
        "Erro ao finalizar treino: " +
          (err.response?.data?.message || err.message),
      );
    } finally {
      setFinishing(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          padding: 20,
          textAlign: "center",
          color: "var(--text-secondary)",
          paddingTop: 60,
        }}
      >
        Carregando treino…
      </div>
    );
  }

  if (!template) {
    return (
      <div
        style={{
          padding: 20,
          textAlign: "center",
          color: "var(--color-danger)",
        }}
      >
        Treino não encontrado.
      </div>
    );
  }

  // Group exercises by section
  const sections = [];
  const seenSections = new Map();
  for (const te of template.exercises) {
    const title = te.sectionTitle || null;
    const key = title || "__no_section__";
    if (!seenSections.has(key)) {
      const s = { title, exercises: [] };
      sections.push(s);
      seenSections.set(key, s);
    }
    seenSections.get(key).exercises.push(te);
  }

  const allDoneSets = Object.values(logsState)
    .flatMap((l) => l.sets)
    .filter((s) => s.done).length;
  const totalSets = Object.values(logsState).flatMap((l) => l.sets).length;

  // Calculate volume for summary
  const totalVolume = Object.values(logsState).reduce((acc, log) => {
    return (
      acc +
      log.sets
        .filter((s) => s.done && s.type === "working")
        .reduce(
          (a, s) => a + (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0),
          0,
        )
    );
  }, 0);

  return (
    <>
      <FocusHeader>
        <TemplateName>{template.name}</TemplateName>
        <ElapsedTime>{elapsed}</ElapsedTime>
        <FinishBtn
          type="button"
          onClick={async () => {
            setShowSummary(true);
            try {
              const { data } = await gymApi.fetchSessions({
                status: "completed",
              });
              const allSessions = data.data;

              // Build exerciseId → sorted unique max weights (desc)
              const podium = {};
              for (const sess of allSessions) {
                for (const log of sess.exerciseLogs) {
                  const exId = log.exerciseId;
                  const ws = log.sets.filter(
                    (s) => s.type === "working" && s.weight > 0,
                  );
                  if (!ws.length) continue;
                  const maxW = Math.max(...ws.map((s) => s.weight));
                  if (!podium[exId]) podium[exId] = [];
                  podium[exId].push(maxW);
                }
              }
              for (const exId in podium) {
                podium[exId] = [...new Set(podium[exId])]
                  .sort((a, b) => b - a)
                  .slice(0, 3);
              }

              // Compare current session logs against podium
              const trophies = [];
              for (const [teId, entry] of Object.entries(logsState)) {
                const ws = entry.sets.filter(
                  (s) => s.done && s.type === "working" && s.weight > 0,
                );
                if (!ws.length) continue;
                const maxW = Math.max(...ws.map((s) => s.weight));
                const exId = entry.exerciseId;
                const ranking = podium[exId] ?? [];
                // insert current weight and re-rank (session not saved yet)
                const insertedRanking = [...new Set([...ranking, maxW])]
                  .sort((a, b) => b - a)
                  .slice(0, 3);
                const rank = insertedRanking.indexOf(maxW);
                const trophy =
                  rank === 0
                    ? "🥇"
                    : rank === 1
                      ? "🥈"
                      : rank === 2
                        ? "🥉"
                        : null;
                if (trophy) {
                  const exName =
                    template.exercises.find((e) => e.id === teId)?.exercise
                      ?.name ?? "";
                  trophies.push({ trophy, exName });
                }
              }
              setSummaryTrophies(trophies);
            } catch {
              /* silent */
            }
          }}
        >
          Finalizar
        </FinishBtn>
      </FocusHeader>

      <Content>
        <p
          style={{
            fontSize: "0.8125rem",
            color: "var(--text-secondary)",
            marginBottom: 12,
          }}
        >
          {allDoneSets}/{totalSets} séries concluídas
        </p>

        {sections.map((section, sIdx) => (
          <div key={sIdx}>
            {section.title && <SectionHeader>{section.title}</SectionHeader>}

            {section.exercises.map((te) => {
              const log = logsState[te.id];
              if (!log) return null;

              const effectiveExercise = log.substitutedExerciseId
                ? (exercises.find((e) => e.id === log.substitutedExerciseId) ??
                  te.exercise)
                : te.exercise;
              const primaryMgId = te.exercise?.muscleGroups?.[0]?.id;
              const primaryMgName = te.exercise?.muscleGroups?.[0]?.name;

              // Substitutes: same primary muscle group
              const substitutes = exercises.filter(
                (e) =>
                  e.id !== te.exerciseId &&
                  e.muscleGroups?.[0]?.id === primaryMgId,
              );

              return (
                <ExCard key={te.id}>
                  <ExCardHeader>
                    <ExName>
                      {log.substitutedExerciseId && (
                        <span
                          style={{
                            fontSize: "0.7rem",
                            color: "var(--text-secondary)",
                            display: "block",
                          }}
                        >
                          sub: {te.exercise?.name}
                        </span>
                      )}
                      {effectiveExercise?.name}
                      {log.lastLog?.feeling && (
                        <LastFeeling $f={log.lastLog.feeling}>
                           {getFeelingDescriptor(log.lastLog.feeling)}
                        </LastFeeling>
                      )}
                    </ExName>

                    <ExActionBtn
                      type="button"
                      aria-label="Histórico do exercício"
                      title="Ver histórico"
                      onClick={() =>
                        openExHistory(
                          log.substitutedExerciseId ?? te.exerciseId,
                          effectiveExercise?.name ?? "",
                        )
                      }
                    >
                      📊
                    </ExActionBtn>

                    {te.exercise?.youtubeUrl && (
                      <ExActionBtn
                        as="a"
                        href={te.exercise.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Ver vídeo"
                      >
                        ▶️
                      </ExActionBtn>
                    )}

                    {substitutes.length > 0 && (
                      <ExActionBtn
                        type="button"
                        aria-label="Trocar exercício"
                        title="Trocar exercício"
                        onClick={() =>
                          setSubstitutePicker({
                            teId: te.id,
                            primaryMgName,
                            substitutes,
                          })
                        }
                      >
                        🔄
                      </ExActionBtn>
                    )}
                  </ExCardHeader>

                  <SetsTable>
                    {log.sets.map((set) => {
                      const lastSet = log.lastLog?.sets?.[set.setNumber - 1];
                      const defaultRestSeconds = te.defaultRestSeconds ?? 120;
                      const restSeconds = set.restSeconds ?? defaultRestSeconds;

                      return (
                        <SetRowOuter
                          key={set.uid}
                          $done={set.done}
                          $wf={set.weightFeeling}
                          onClick={() => {
                            if (editingFeelingSetUid !== null && editingFeelingSetUid !== set.uid) {
                              setEditingFeelingSetUid(null);
                            }
                          }}
                        >
                          <SetRowInner>
                            <SetBadge $type={set.type}>
                              {set.type === "warmup"
                                ? "AQUEC"
                                : `S${set.setNumber}`}
                            </SetBadge>
                            <WeightInput
                              type="number"
                              inputMode="decimal"
                              value={set.weight}
                              onChange={(e) =>
                                updateSet(
                                  te.id,
                                  set.uid,
                                  "weight",
                                  e.target.value,
                                )
                              }
                              onWheel={(e) => {
                                e.preventDefault()
                                const delta = e.deltaY > 0 ? -2.5 : 2.5
                                updateSet(
                                  te.id,
                                  set.uid,
                                  "weight",
                                  String((parseFloat(set.weight) || 0) + delta),
                                )
                              }}
                              $feeling={
                                set.done
                                  ? set.weightFeeling
                                  : set.lastWeightFeeling
                              }
                              $hint={!set.done}
                              placeholder="kg"
                              aria-label="Peso em kg"
                              title="Scroll para ajustar ±2.5kg"
                            />
                            <Sep>×</Sep>
                            <RepsInput
                              type="number"
                              inputMode="numeric"
                              value={set.reps}
                              onChange={(e) =>
                                updateSet(
                                  te.id,
                                  set.uid,
                                  "reps",
                                  e.target.value,
                                )
                              }
                              onWheel={(e) => {
                                e.preventDefault()
                                const delta = e.deltaY > 0 ? -1 : 1
                                updateSet(
                                  te.id,
                                  set.uid,
                                  "reps",
                                  String(Math.max(0, (parseInt(set.reps) || 0) + delta)),
                                )
                              }}
                              $feeling={
                                set.done ? set.repsFeeling : set.lastRepsFeeling
                              }
                              $hint={!set.done}
                              placeholder="reps"
                              aria-label="Reps"
                              title="Scroll para ajustar ±1 rep"
                            />

                            {set.prescribedReps && (
                              <PrescribedLabel title="Repetições prescritas">
                                {set.prescribedReps}
                              </PrescribedLabel>
                            )}

                            {!set.done && (
                              <PlateBtn
                                type="button"
                                title="Calculadora de anilhas"
                                aria-label="Anilhas"
                                onClick={() =>
                                  setPlateCalc({
                                    weightKg: parseFloat(set.weight) || 0,
                                  })
                                }
                              >
                                🏋️
                              </PlateBtn>
                            )}

                            <DoneBtn
                              type="button"
                              $done={set.done}
                              onClick={() =>
                                toggleDone(te.id, set.uid, restSeconds)
                              }
                              aria-label={
                                set.done
                                  ? "Marcar como pendente"
                                  : "Marcar como feito"
                              }
                            >
                              {set.done ? "✓" : "○"}
                            </DoneBtn>

                            {set.done && (
                              <CompactFeelingDot
                                $color={FEELING_COLORS[set.weightFeeling]}
                                onClick={() =>
                                  setEditingFeelingSetUid(
                                    editingFeelingSetUid === set.uid
                                      ? null
                                      : set.uid,
                                  )
                                }
                                title="Avaliar carga"
                              >
                                🔥
                              </CompactFeelingDot>
                            )}

                            {lastSet && !set.done && (
                              <LastHint>
                                {lastSet.weight}kg×{lastSet.reps}
                              </LastHint>
                            )}
                          </SetRowInner>

                          {set.done && editingFeelingSetUid === set.uid && (
                            <WeightFeelingPickerRow
                              onClick={(e) => e.stopPropagation()}
                            >
                              <WeightFeelingPickerLabel>Carga</WeightFeelingPickerLabel>
                              {WEIGHT_FEELING_OPTS.map((f) => (
                                <FeelingOption key={f.value}>
                                  <FeelingColorBtn
                                    $color={f.color}
                                    $selected={set.weightFeeling === f.value}
                                    onClick={() => {
                                      const val =
                                        set.weightFeeling === f.value
                                          ? null
                                          : f.value;
                                      const updated = {
                                        ...logsState,
                                        [te.id]: {
                                          ...logsState[te.id],
                                          sets: logsState[te.id].sets.map(
                                            (s) =>
                                              s.uid === set.uid
                                                ? { ...s, weightFeeling: val }
                                                : s,
                                          ),
                                        },
                                      };
                                      updateSet(
                                        te.id,
                                        set.uid,
                                        "weightFeeling",
                                        val,
                                      );
                                      saveLogsToApi(sessionId, updated);
                                    }}
                                  >
                                    ●
                                  </FeelingColorBtn>
                                  <FeelingColorLabel>{f.title}</FeelingColorLabel>
                                </FeelingOption>
                              ))}
                            </WeightFeelingPickerRow>
                          )}
                        </SetRowOuter>
                      );
                    })}
                  </SetsTable>
                </ExCard>
              );
            })}
          </div>
        ))}
      </Content>

      {/* Exercise history modal */}
      {exHistory && (
        <HistoryOverlay onClick={() => setExHistory(null)}>
          <HistorySheet onClick={(e) => e.stopPropagation()}>
            <HistorySheetHeader>
              <HistorySheetTitle>{exHistory.name}</HistorySheetTitle>
              <ExActionBtn
                type="button"
                onClick={() => setExHistory(null)}
                style={{ fontSize: "1.25rem" }}
              >
                ×
              </ExActionBtn>
            </HistorySheetHeader>
            <HistoryList>
              {exHistoryLoading ? (
                <div
                  style={{
                    padding: 24,
                    textAlign: "center",
                    color: "var(--text-secondary)",
                    fontSize: "0.875rem",
                  }}
                >
                  Carregando…
                </div>
              ) : exHistory.sessions.length === 0 ? (
                <div
                  style={{
                    padding: 24,
                    textAlign: "center",
                    color: "var(--text-secondary)",
                    fontSize: "0.875rem",
                  }}
                >
                  Sem histórico registrado para este exercício.
                </div>
              ) : (
                exHistory.sessions.map((sess, i) => {
                  const d = new Date(sess.date);
                  const dateLabel = d.toLocaleDateString("pt-BR", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  });
                  return (
                    <HistorySessionBlock key={i}>
                      <HistoryDate>{dateLabel}</HistoryDate>
                      {sess.sets.map((s, j) => (
                        <HistorySetLine key={j}>
                          <HistorySetBadge $type={s.type}>
                            {s.type === "warmup" ? "Aquec" : `S${s.setNumber}`}
                          </HistorySetBadge>
                          <HistorySetValue>
                            {s.weight > 0 ? `${s.weight}kg` : "—"}
                            {s.weightFeeling && (
                              <FeelingDot $f={s.weightFeeling} />
                            )}
                            {s.weight > 0 && s.reps > 0 ? " × " : ""}
                            {s.reps > 0 ? `${s.reps} rep` : ""}
                            {s.repsFeeling && <FeelingDot $f={s.repsFeeling} />}
                          </HistorySetValue>
                        </HistorySetLine>
                      ))}
                    </HistorySessionBlock>
                  );
                })
              )}
            </HistoryList>
          </HistorySheet>
        </HistoryOverlay>
      )}

      {/* Rest timer - sticky at top of content */}
      {restTimer && (
        <RestTimerWrapper>
          <RestTimer
            seconds={restTimer.seconds}
            onDismiss={() => setRestTimer(null)}
          />
        </RestTimerWrapper>
      )}

      {/* Plate calculator */}
      {plateCalc !== null && (
        <PlateCalculator
          weightKg={plateCalc.weightKg}
          onClose={() => setPlateCalc(null)}
          preferences={user?.preferences}
        />
      )}

      {/* Substitute picker */}
      {substitutePicker && (
        <Overlay onClick={() => setSubstitutePicker(null)}>
          <Sheet onClick={(e) => e.stopPropagation()}>
            <SheetHeader>
              <SheetTitle>
                Trocar exercício ({substitutePicker.primaryMgName})
              </SheetTitle>
              <CloseBtn onClick={() => setSubstitutePicker(null)}>×</CloseBtn>
            </SheetHeader>
            <PickerList>
              {substitutePicker.substitutes.map((ex) => (
                <PickerItem
                  key={ex.id}
                  onClick={() => {
                    updateLog(substitutePicker.teId, {
                      substitutedExerciseId: ex.id,
                    });
                    setSubstitutePicker(null);
                  }}
                >
                  <p style={{ fontWeight: 600, fontSize: "0.9375rem" }}>
                    {ex.name}
                  </p>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-secondary)",
                      marginTop: 2,
                    }}
                  >
                    {ex.muscleGroups?.[0]?.name}
                  </p>
                </PickerItem>
              ))}
            </PickerList>
          </Sheet>
        </Overlay>
      )}

      {/* Summary modal */}
      {showSummary && (
        <SummaryOverlay>
          <div
            style={{
              textAlign: "center",
              marginBottom: 32,
              fontSize: "2.5rem",
            }}
          >
            🏆
          </div>
          <SummaryTitle>Treino concluído!</SummaryTitle>
          <VolumeNumber>
            {totalVolume.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
            kg
          </VolumeNumber>
          <VolumeLabel>de volume movido</VolumeLabel>

          {summaryTrophies.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              {summaryTrophies.map(({ trophy, exName }, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                    marginBottom: 6,
                  }}
                >
                  <span style={{ fontSize: "1.5rem", lineHeight: 1 }}>
                    {trophy}
                  </span>
                  <span
                    style={{
                      fontSize: "0.9375rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    {exName}
                  </span>
                </div>
              ))}
            </div>
          )}

          <SummaryCard>
            <SummaryRow>
              <span>Treino</span>
              <span>{template.name}</span>
            </SummaryRow>
            <SummaryRow>
              <span>Duração</span>
              <span>{elapsed}</span>
            </SummaryRow>
            <SummaryRow>
              <span>Séries feitas</span>
              <span>
                {allDoneSets} de {totalSets}
              </span>
            </SummaryRow>
          </SummaryCard>

          <NoteArea
            placeholder="Observações do treino (opcional)…"
            value={summaryNote}
            onChange={(e) => setSummaryNote(e.target.value)}
          />

          <Button $fullWidth onClick={handleFinish} disabled={finishing}>
            {finishing ? "Salvando…" : "Salvar e fechar"}
          </Button>

          <button
            style={{
              width: "100%",
              marginTop: 12,
              color: "var(--text-secondary)",
              fontSize: "0.875rem",
              minHeight: 44,
            }}
            onClick={() => setShowSummary(false)}
          >
            Voltar ao treino
          </button>
        </SummaryOverlay>
      )}
    </>
  );
};
