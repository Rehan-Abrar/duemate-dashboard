/**
 * Section string helpers.
 *
 * Program + semester are derived from the section label, so onboarding only needs
 * to ask for the section. e.g. "BSCS-7B" → program "BSCS", semester 7, section "B".
 */

export interface SectionMeta {
  program: string | null;
  semester: number | null;
  sectionLetter: string | null;
}

/** Parse a section label into its program / semester / section-letter parts. */
export function parseSection(section: string): SectionMeta {
  const m = (section || "")
    .trim()
    .toUpperCase()
    .match(/^([A-Z]+)[-\s]?(\d+)[-\s]?([A-Z])$/);
  if (!m) return { program: null, semester: null, sectionLetter: null };
  return { program: m[1], semester: parseInt(m[2], 10), sectionLetter: m[3] };
}

/** Human-readable program name from a program code. */
export function programLabel(program: string | null): string {
  switch (program) {
    case "BSCS":
      return "BS Computer Science";
    case "BSSE":
      return "BS Software Engineering";
    case "BSAI":
      return "BS Artificial Intelligence";
    case "BSDS":
      return "BS Data Science";
    case "BSIT":
      return "BS Information Technology";
    default:
      return program ? `BS ${program}` : "Program";
  }
}

/** Ordinal-ish label for a semester number, e.g. 7 → "Semester 7". */
export function semesterLabel(semester: number | null): string {
  return semester ? `Semester ${semester}` : "Semester";
}
