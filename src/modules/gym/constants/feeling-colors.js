// Centralized effort feeling colors and options
// Used across workout tracking, exercise history, and session management

export const WEIGHT_FEELING_OPTS = [
  { value: "very_heavy", icon: "🔴", title: "Muito pesado", color: "#E24B4A" },
  { value: "light", icon: "🟠", title: "Pouco pesado", color: "#EF9F27" },
  { value: "normal", icon: "⚪", title: "Ideal", color: "#888780" },
  { value: "very_light", icon: "🔵", title: "Pouco leve", color: "#7F77DD" },
  { value: "too_light", icon: "🟢", title: "Muito leve", color: "#1D9E75" },
];

export const REPS_FEELING_OPTS = [
  { value: "very_heavy", icon: "🔴", title: "Muito pesado", color: "#E24B4A" },
  { value: "light", icon: "🟠", title: "Pouco pesado", color: "#EF9F27" },
  { value: "normal", icon: "⚪", title: "Ideal", color: "#888780" },
  { value: "very_light", icon: "🔵", title: "Pouco leve", color: "#7F77DD" },
  { value: "too_light", icon: "🟢", title: "Muito leve", color: "#1D9E75" },
];

export const FEELING_COLORS = {
  very_heavy: "#E24B4A",
  light: "#EF9F27",
  normal: "#888780",
  very_light: "#7F77DD",
  too_light: "#1D9E75",
  // Legacy support
  heavy: "#E24B4A",
};

export const getFeelingColor = (value) => {
  return FEELING_COLORS[value] || "var(--border)";
};

export const getFeelingLabel = (value, type = "weight") => {
  const opts = type === "reps" ? REPS_FEELING_OPTS : WEIGHT_FEELING_OPTS;
  return opts.find((o) => o.value === value)?.title || value;
};

export const getFeelingDescriptor = (value) => {
  if (value === "very_heavy" || value === "heavy") return "⚠️ Pesado da última vez";
  if (value === "light") return "💡 Pouco pesado";
  if (value === "normal") return "✓ Normal";
  if (value === "very_light") return "💡 Pouco leve";
  if (value === "too_light") return "😌 Muito leve";
  return null;
};
