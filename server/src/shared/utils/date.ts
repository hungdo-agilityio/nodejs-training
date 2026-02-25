/**
 * Utility for date parsing that avoids UTC-shift issues.
 *
 * `new Date('YYYY-MM-DD')` is treated as UTC by the spec, which shifts the
 * date backward in US timezones (UTC-5 to -8), breaking day-of-week lookups
 * and same-day comparisons. Use this class instead.
 */
export class DateUtils {
  /**
   * Parse a YYYY-MM-DD string as local midnight.
   * Returns null for invalid or out-of-range dates (e.g. 2026-02-30).
   */
  static parseLocalDate(value: string): Date | null {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!m) return null;

    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);

    const parsed = new Date(y, mo - 1, d);

    // Guard against overflow dates JS silently rolls over (e.g. Feb 30 → Mar 2)
    if (
      parsed.getFullYear() !== y ||
      parsed.getMonth() !== mo - 1 ||
      parsed.getDate() !== d
    ) {
      return null;
    }

    parsed.setHours(0, 0, 0, 0);
    return parsed;
  }

  /**
   * Returns true if two dates fall on the same local calendar day.
   */
  static isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }
}
