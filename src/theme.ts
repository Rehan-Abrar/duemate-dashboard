/**
 * DueMate Theme System
 * 
 * AESTHETIC DIRECTION: "Focused Academic"
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * A warm, sophisticated dark theme designed for students under deadline pressure.
 * 
 * The color palette draws from late-night study sessions — warm amber task lights,
 * soft purple focus zones, and crisp white text that doesn't strain the eyes.
 * 
 * Design principles:
 * - Calm urgency: Tasks feel important without inducing panic
 * - Clear hierarchy: Critical info (deadlines, course names) stands out instantly
 * - Mobile-first: Large touch targets, readable at arm's length
 * - Accessible: WCAG AA contrast ratios, distinct color coding
 * 
 * Typography:
 * - Display: Space Grotesk — geometric, modern, slightly technical
 * - Body: Inter — highly readable at small sizes, excellent on mobile
 * - Mono: JetBrains Mono — for raw message display, distinct from body text
 * 
 * The warm amber (#F5A623) serves as the brand color — energetic but not alarming.
 * It appears on primary buttons, active states, and key focus elements.
 * 
 * Urgency is communicated through saturation, not red/green extremes:
 * - Overdue: Deep coral (#FF6B6B) — warm, urgent, but not screaming red
 * - Due today: Amber (#F5A623) — matches brand, naturally draws attention
 * - Due soon: Muted lavender (#A78BFA) — signals upcoming without stress
 * 
 * This theme can be fully customized by editing the values below.
 * No colors, fonts, or spacing values should be hardcoded elsewhere.
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export const theme = {
  // ─────────────────────────────────────────────────────────────────────────────
  // COLORS
  // ─────────────────────────────────────────────────────────────────────────────
  colors: {
    // Brand colors — Electric Blue from Stitch Design
    brand: "#2563EB",
    brandLight: "#DCE8FF",
    brandDark: "#1D4ED8",

    // Surfaces — Soft Cloud Blue (#EAF0F8) for neumorphic look
    surface: "#EAF0F8",           // Main background
    surfaceElevated: "#EAF0F8",   // Neumorphic surface (same as bg to blend)
    surfaceHover: "#F1F5F9",      // Hover state
    surfaceActive: "#DCE8FF",     // Active/selected state (Soft Blue Highlight)

    // Text — Deep Navy and muted tones
    text: "#0F172A",              // Primary text (Deep Navy)
    textMuted: "#64748B",         // Secondary text
    textInverse: "#FFFFFF",       // Text on dark/brand backgrounds

    // Semantic colors
    accent: "#2563EB",            // Electric Blue
    success: "#10B981",           // Green
    warning: "#F59E0B",           // Yellow
    danger: "#EF4444",            // Red

    // Utility colors
    border: "rgba(163, 177, 198, 0.4)",            // Subtle borders
    borderLight: "rgba(255, 255, 255, 0.9)",       // Prominent highlight border
    overlay: "rgba(15, 23, 42, 0.4)",              // Modal/drawer overlays
    focus: "#2563EB",                              // Focus ring color

    // Gradients (CSS values)
    gradientBrand: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
    gradientSurface: "linear-gradient(180deg, #EAF0F8 0%, #DFE7F2 100%)",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // TYPOGRAPHY
  // ─────────────────────────────────────────────────────────────────────────────
  fonts: {
    display: "'Inter', system-ui, sans-serif",
    body: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
  },

  fontSizes: {
    xs: "0.75rem",    // 12px — fine print, timestamps
    sm: "0.875rem",   // 14px — helper text, badges
    base: "1rem",     // 16px — body text
    lg: "1.125rem",   // 18px — emphasized body
    xl: "1.25rem",    // 20px — card titles
    "2xl": "1.5rem",  // 24px — section headers
    "3xl": "2rem",    // 32px — page titles
    "4xl": "2.5rem",  // 40px — hero text
  },

  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeights: {
    tight: 1.2,       // Headings
    normal: 1.5,      // Body text
    relaxed: 1.75,    // Long-form content
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // SPACING (8-point system)
  // ─────────────────────────────────────────────────────────────────────────────
  spacing: {
    xs: "8px",
    sm: "16px",
    md: "24px",
    lg: "32px",
    xl: "40px",
    "2xl": "48px",
    "3xl": "64px",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BORDER RADIUS
  // ─────────────────────────────────────────────────────────────────────────────
  radius: {
    sm: "8px",        // Badges, tags, small inputs
    md: "16px",       // Inputs, buttons (height 48px, radius 16px)
    lg: "20px",       // Cards (radius 20px)
    xl: "24px",       // Large features, panels
    pill: "999px",    // Pills
    full: "50%",      // Circles
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // SHADOWS (Neumorphic)
  // ─────────────────────────────────────────────────────────────────────────────
  shadows: {
    sm: "2px 2px 5px rgba(163, 177, 198, 0.5), -2px -2px 5px rgba(255, 255, 255, 0.8)",
    card: "6px 6px 12px rgba(163, 177, 198, 0.6), -6px -6px 12px rgba(255, 255, 255, 0.9)",
    elevated: "10px 10px 20px rgba(163, 177, 198, 0.7), -10px -10px 20px rgba(255, 255, 255, 0.95)",
    modal: "16px 16px 32px rgba(163, 177, 198, 0.8), -16px -16px 32px rgba(255, 255, 255, 1)",
    glow: "0 0 15px rgba(37, 99, 235, 0.2)",  // Electric Blue glow
    focus: "0 0 0 3px rgba(37, 99, 235, 0.4)", // Focus outline
    inset: "inset 4px 4px 8px rgba(163, 177, 198, 0.6), inset -4px -4px 8px rgba(255, 255, 255, 0.9)", // Pressed states
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // TASK-SPECIFIC COLORS
  // ─────────────────────────────────────────────────────────────────────────────
  taskColors: {
    // Task type badges
    assignment: "#2563EB",   // Electric Blue
    quiz: "#EC4899",         // Pink

    // Urgency states
    overdue: "#EF4444",      // Red
    dueToday: "#F59E0B",     // Amber
    dueSoon: "#3B82F6",      // Blue
    upcoming: "#64748B",     // Gray
    completed: "#10B981",    // Green

    // Status indicators
    needsReview: "#F59E0B",  // Warning
    duplicate: "#64748B",    // Muted gray
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BREAKPOINTS (mobile-first)
  // ─────────────────────────────────────────────────────────────────────────────
  breakpoints: {
    sm: "640px",   // Large phones
    md: "768px",   // Tablets
    lg: "1024px",  // Small laptops
    xl: "1280px",  // Desktops
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // TRANSITIONS
  // ─────────────────────────────────────────────────────────────────────────────
  transitions: {
    fast: "150ms ease",
    normal: "250ms ease",
    slow: "350ms ease",
    bounce: "350ms cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Z-INDEX SCALE
  // ─────────────────────────────────────────────────────────────────────────────
  zIndex: {
    dropdown: 100,
    sticky: 200,
    drawer: 300,
    modal: 400,
    toast: 500,
    tooltip: 600,
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// TYPE EXPORTS
// ─────────────────────────────────────────────────────────────────────────────
export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;
export type ThemeSpacing = keyof typeof theme.spacing;

// ─────────────────────────────────────────────────────────────────────────────
// CSS VARIABLE GENERATOR
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Generates CSS custom properties from the theme.
 * Import and inject into :root for global access.
 */
export function generateCSSVariables(): string {
  const lines: string[] = [];

  // Colors
  Object.entries(theme.colors).forEach(([key, value]) => {
    if (!value.startsWith("linear-gradient")) {
      lines.push(`  --color-${kebabCase(key)}: ${value};`);
    }
  });

  // Fonts
  Object.entries(theme.fonts).forEach(([key, value]) => {
    lines.push(`  --font-${key}: ${value};`);
  });

  // Font sizes
  Object.entries(theme.fontSizes).forEach(([key, value]) => {
    lines.push(`  --text-${key}: ${value};`);
  });

  // Spacing
  Object.entries(theme.spacing).forEach(([key, value]) => {
    lines.push(`  --spacing-${key}: ${value};`);
  });

  // Radius
  Object.entries(theme.radius).forEach(([key, value]) => {
    lines.push(`  --radius-${key}: ${value};`);
  });

  // Shadows
  Object.entries(theme.shadows).forEach(([key, value]) => {
    lines.push(`  --shadow-${key}: ${value};`);
  });

  // Task colors
  Object.entries(theme.taskColors).forEach(([key, value]) => {
    lines.push(`  --task-${kebabCase(key)}: ${value};`);
  });

  return `:root {\n${lines.join(";\n")}\n}`;
}

function kebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER HOOKS & UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get responsive value based on screen size.
 * Usage: getResponsive({ base: "100%", md: "50%", lg: "33%" })
 */
export function getResponsiveValue<T>(
  values: Partial<Record<"base" | keyof typeof theme.breakpoints, T>>
): string {
  // This would need to be used with a useMediaQuery hook in practice
  // For now, returns CSS-compatible media query syntax suggestion
  return JSON.stringify(values);
}

/**
 * Calculate days until deadline and return appropriate color.
 */
export function getDeadlineColor(dueDate: Date | null): string {
  if (!dueDate) return theme.taskColors.upcoming;
  
  const now = new Date();
  const diffMs = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return theme.taskColors.overdue;
  if (diffDays === 0) return theme.taskColors.dueToday;
  if (diffDays <= 3) return theme.taskColors.dueSoon;
  return theme.taskColors.upcoming;
}

/**
 * Get human-readable deadline text.
 */
export function getDeadlineText(dueDate: Date | null): string {
  if (!dueDate) return "No deadline";
  
  const now = new Date();
  const diffMs = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    return absDays === 1 ? "1 day overdue" : `${absDays} days overdue`;
  }
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  if (diffDays <= 7) return `${diffDays} days left`;
  
  return dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
