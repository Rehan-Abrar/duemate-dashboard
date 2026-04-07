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
    // Brand colors — amber warmth
    brand: "#F5A623",
    brandLight: "#FFD080",
    brandDark: "#D48B1A",

    // Surfaces — deep grays with warm undertones
    surface: "#121218",           // Main background
    surfaceElevated: "#1E1E26",   // Cards, modals
    surfaceHover: "#2A2A34",      // Interactive hover state
    surfaceActive: "#363644",     // Active/selected state

    // Text — warm white and muted tones
    text: "#F5F5F7",              // Primary text
    textMuted: "#9CA3AF",         // Secondary/helper text
    textInverse: "#121218",       // Text on light/brand backgrounds

    // Semantic colors
    accent: "#A78BFA",            // Purple — secondary actions, highlights
    success: "#34D399",           // Green — completed tasks, success states
    warning: "#FBBF24",           // Yellow — needs attention
    danger: "#FF6B6B",            // Coral — errors, overdue items

    // Utility colors
    border: "#2E2E38",            // Subtle borders
    borderLight: "#404050",       // More prominent borders
    overlay: "rgba(0, 0, 0, 0.65)", // Modal/drawer overlays
    focus: "#A78BFA",             // Focus ring color

    // Gradients (CSS values)
    gradientBrand: "linear-gradient(135deg, #F5A623 0%, #FFD080 100%)",
    gradientSurface: "linear-gradient(180deg, #1E1E26 0%, #121218 100%)",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // TYPOGRAPHY
  // ─────────────────────────────────────────────────────────────────────────────
  fonts: {
    display: "'Space Grotesk', system-ui, sans-serif",
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
  // SPACING
  // ─────────────────────────────────────────────────────────────────────────────
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    "2xl": "48px",
    "3xl": "64px",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BORDER RADIUS
  // ─────────────────────────────────────────────────────────────────────────────
  radius: {
    sm: "6px",        // Small elements (badges, tags)
    md: "10px",       // Cards, inputs
    lg: "16px",       // Large cards, modals
    xl: "24px",       // Feature sections
    pill: "999px",    // Pills, circular badges
    full: "50%",      // Perfect circles
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // SHADOWS
  // ─────────────────────────────────────────────────────────────────────────────
  shadows: {
    sm: "0 1px 2px rgba(0, 0, 0, 0.25)",
    card: "0 4px 12px rgba(0, 0, 0, 0.35), 0 2px 4px rgba(0, 0, 0, 0.25)",
    elevated: "0 8px 24px rgba(0, 0, 0, 0.45), 0 4px 8px rgba(0, 0, 0, 0.3)",
    modal: "0 16px 48px rgba(0, 0, 0, 0.5), 0 8px 16px rgba(0, 0, 0, 0.35)",
    glow: "0 0 20px rgba(245, 166, 35, 0.25)",  // Brand color glow
    focus: "0 0 0 3px rgba(167, 139, 250, 0.4)", // Focus ring
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // TASK-SPECIFIC COLORS
  // ─────────────────────────────────────────────────────────────────────────────
  taskColors: {
    // Task type badges
    assignment: "#6366F1",   // Indigo — substantial work
    quiz: "#EC4899",         // Pink — quick assessment

    // Urgency states
    overdue: "#FF6B6B",      // Coral — past due
    dueToday: "#F5A623",     // Amber — due today (brand color)
    dueSoon: "#A78BFA",      // Lavender — due within 3 days
    upcoming: "#6B7280",     // Gray — more than 3 days out
    completed: "#34D399",    // Green — done

    // Status indicators
    needsReview: "#FBBF24",  // Yellow — requires attention
    duplicate: "#9CA3AF",    // Muted gray — potential duplicate
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
