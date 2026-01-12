/**
 * Color palette constants for the application
 * Based on design system colors
 */

// Sidebar colors (Green theme)
export const SIDEBAR_COLORS = {
  main: "#39B27E", // Main sidebar background
  selected: "#3ECF96", // Selected/highlighted item
  foreground: "#FFFFFF", // Text and icons
} as const;

// KPI Card colors
export const KPI_CARD_COLORS = {
  orange: {
    icon: "#FF8C4B",
    background: "#FFF6F0",
  },
  grey: {
    icon: "#4C5560",
    background: "#F0F3F6",
  },
  green: {
    icon: "#5DC28E",
    background: "#F1F9F4",
  },
  blue: {
    icon: "#60B8E8",
    background: "#F0F7FA",
  },
} as const;

// Chart colors
export const CHART_COLORS = {
  teal: "#00B0B0",
  tealLight: "#80DCDC",
  green: "#5DC28E",
  blue: "#60B8E8",
  blueDark: "#4C8AB8",
  orange: "#FFC260",
  red: "#e2231a", // Motul red
  purple: "#a855f7",
  yellow: "#eab308",
  gray: "#6b7280",
  black: "#000000",
} as const;

// Chart color arrays for different chart types
export const BAR_CHART_COLORS = [
  CHART_COLORS.red,
  CHART_COLORS.green,
  CHART_COLORS.orange,
  CHART_COLORS.blue,
  CHART_COLORS.purple,
  CHART_COLORS.yellow,
  CHART_COLORS.gray,
  CHART_COLORS.black,
] as const;

export const LINE_CHART_COLORS = [
  CHART_COLORS.teal,
  CHART_COLORS.green,
  CHART_COLORS.blue,
  CHART_COLORS.orange,
  CHART_COLORS.tealLight,
] as const;

export const WASTE_SOURCE_CHART_COLORS = [
  CHART_COLORS.red,
  CHART_COLORS.green,
  CHART_COLORS.orange,
  CHART_COLORS.gray,
  CHART_COLORS.purple,
  CHART_COLORS.gray,
] as const;
