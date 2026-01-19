/**
 * Color palette constants for the application
 * Based on design system colors
 */

// Sidebar colors (Motul red/carbon theme)
export const SIDEBAR_COLORS = {
  main: "#111111", // Dark Carbon
  selected: "#2a2a2a", // Dark gray
  foreground: "#FFFFFF", // Pure white
} as const;

// KPI Card colors (red/gray scale)
export const KPI_CARD_COLORS = {
  orange: {
    icon: "#e2231a",
    background: "#fdecec",
  },
  grey: {
    icon: "#4a4a4a",
    background: "#f5f5f5",
  },
  green: {
    icon: "#7a7a7a",
    background: "#f0f0f0",
  },
  blue: {
    icon: "#2f2f2f",
    background: "#ededed",
  },
} as const;

// Chart colors (Motul palette)
export const CHART_COLORS = {
  red: "var(--motul-red)",
  darkCarbon: "var(--motul-dark-carbon)",
  lightCarbon: "var(--motul-light-carbon)",
  grayDark: "#2b2b2b",
  gray: "#6f6f6f",
  grayLight: "#c9c9c9",
  black: "#000000",
} as const;

// Chart color arrays for different chart types
export const BAR_CHART_COLORS = [
  CHART_COLORS.red,
  CHART_COLORS.grayDark,
  CHART_COLORS.gray,
  CHART_COLORS.lightCarbon,
  CHART_COLORS.grayLight,
  CHART_COLORS.black,
] as const;

export const LINE_CHART_COLORS = [
  CHART_COLORS.red,
  CHART_COLORS.grayDark,
  CHART_COLORS.gray,
  CHART_COLORS.grayLight,
] as const;

export const WASTE_SOURCE_CHART_COLORS = [
  CHART_COLORS.red,
  CHART_COLORS.grayDark,
  CHART_COLORS.gray,
  CHART_COLORS.lightCarbon,
  CHART_COLORS.grayLight,
  CHART_COLORS.black,
] as const;
