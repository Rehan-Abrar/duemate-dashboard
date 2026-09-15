/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Stitch design tokens — used by class names in onboarding screens
      colors: {
        primary:         "#0F172A",
        "surface-neu":   "#F6F4F0",
        "surface-neumorphic": "#F6F4F0",
        "deep-navy":     "#0F172A",
        "electric-blue": "#2563EB",
        "text-secondary":"#64748B",
        secondary:       "#2563EB",
        outline:         "#76777d",
        "outline-variant":"#c6c6cd",
        "highlight-soft": "#DCE8FF",
        "background-base":"#F6F4F0",
        "on-surface":    "#1b1b1d",
        "on-secondary-container": "#fefcff",
        success:         "#10B981",
        danger:          "#EF4444",
        warning:         "#F59E0B",
        /* Aliases for classes already used in pages — map to the live palette */
        "on-surface-variant": "#64748B",
        "surface-container-high": "#DFE7F2",
        "surface-container-low": "#F6F4F0",
        "secondary-container": "#2563EB",
        "secondary-fixed-dim": "#DCE8FF",
        "on-secondary-fixed-variant": "#1D4ED8",

        /* ── New landing page palette (warm paper + cool product surfaces) ── */
        paper: {
          DEFAULT: "#f6f4f0",
          deep:    "#efeae2",
          raise:   "#fdfcfa",
        },
        cool: {
          DEFAULT: "#f6f4f0",
          deep:    "#e0e8f3",
          raise:   "#f2f6fb",
        },
        ink: {
          DEFAULT: "#101319",
          raise:   "#191d25",
          line:    "#2b303a",
        },
        onink: {
          DEFAULT: "#f3f1ed",
          muted:   "#9096a1",
        },
        fg:     "#101319",
        muted:  "#6a6f78",
        faint:  "#9ba0a8",
        line: {
          DEFAULT: "#e2ddd4",
          cool:    "#d3dcea",
        },
        accent: {
          DEFAULT: "#2549e8",
          deep:    "#1a34ad",
          wash:    "#e7ebfd",
        },
        wa: {
          DEFAULT: "#25d366",
          deep:    "#158a45",
          wash:    "#e7f7ee",
        },
        due: {
          DEFAULT: "#b26a12",
          wash:    "#f9efdd",
        },
      },
      fontFamily: {
        sans: ["Geist", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "ui-monospace", "monospace"],
      },
      fontSize: {
        eyebrow:  ["0.6875rem", { lineHeight: "1", letterSpacing: "0.14em" }],
        display:  ["clamp(2.625rem, 5.6vw, 5.125rem)", { lineHeight: "0.95", letterSpacing: "-0.04em" }],
        headline: ["clamp(1.75rem, 3.4vw, 2.875rem)",   { lineHeight: "1",    letterSpacing: "-0.032em" }],
        title:    ["clamp(1.25rem, 2vw, 1.625rem)",      { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        lead:     ["clamp(1rem, 1.25vw, 1.1875rem)",     { lineHeight: "1.55" }],
      },
      spacing: {
        "4.5": "1.125rem",
      },
      borderRadius: {
        "2xl": "20px",
      },
      boxShadow: {
        neu:         "10px 10px 24px rgba(163, 177, 198, 0.55), -10px -10px 24px rgba(255, 255, 255, 0.95)",
        "neu-sm":    "6px 6px 14px rgba(163, 177, 198, 0.5), -6px -6px 14px rgba(255, 255, 255, 0.9)",
        "neu-in":    "inset 4px 4px 8px rgba(163, 177, 198, 0.5), inset -4px -4px 8px rgba(255, 255, 255, 0.9)",
        "neu-in-dark":"inset 3px 3px 7px rgba(0, 0, 0, 0.4), inset -2px -2px 5px rgba(255, 255, 255, 0.05)",
        lift:        "0 30px 70px -28px rgba(20, 26, 42, 0.34), 0 4px 10px rgba(20, 26, 42, 0.05)",
        float:       "0 18px 40px -18px rgba(20, 26, 42, 0.3)",
        hair:        "0 1px 2px rgba(16, 19, 25, 0.05)",
        cta:         "0 10px 24px -10px rgba(37, 73, 232, 0.6)",
      },
    },
  },
  plugins: [],
};
