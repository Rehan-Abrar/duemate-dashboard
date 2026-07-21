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
        "surface-neu":   "#EAF0F8",
        "surface-neumorphic": "#EAF0F8",
        "deep-navy":     "#0F172A",
        "electric-blue": "#2563EB",
        "text-secondary":"#64748B",
        secondary:       "#2563EB",
        outline:         "#76777d",
        "outline-variant":"#c6c6cd",
        "highlight-soft": "#DCE8FF",
        "background-base":"#EAF0F8",
        "on-surface":    "#1b1b1d",
        "on-secondary-container": "#fefcff",
        success:         "#10B981",
        danger:          "#EF4444",
        warning:         "#F59E0B",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "20px",
      },
    },
  },
  plugins: [],
};
