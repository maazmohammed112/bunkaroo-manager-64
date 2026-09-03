/**
 * BunkBuddy Calendar & Date Utilities
 * Ensures 100% timezone-safe local date calculations without UTC shift bugs.
 */

export const ALL_WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
export const WEEKDAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export type WeekdayName = typeof ALL_WEEKDAYS[number];

/**
 * Format a Date object to YYYY-MM-DD using local calendar values (not UTC).
 */
export const formatDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Parse a YYYY-MM-DD string into a local midnight Date.
 */
export const parseDateKey = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
};

/**
 * Get today's local date string in YYYY-MM-DD.
 */
export const getTodayDateKey = (): string => {
  return formatDateKey(new Date());
};

/**
 * Add or subtract days from a YYYY-MM-DD date key safely.
 */
export const addDaysToDateKey = (dateStr: string, offsetDays: number): string => {
  const d = parseDateKey(dateStr);
  d.setDate(d.getDate() + offsetDays);
  return formatDateKey(d);
};

/**
 * Get the full weekday name (e.g. "Monday", "Tuesday") from YYYY-MM-DD.
 */
export const getDayNameFromKey = (dateStr: string): string => {
  const d = parseDateKey(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'long' });
};

/**
 * Get short weekday name (e.g. "Mon", "Tue") from YYYY-MM-DD.
 */
export const getDayShortNameFromKey = (dateStr: string): string => {
  const d = parseDateKey(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short' });
};

/**
 * Format readable Indian standard date: "03 Sep 2026".
 */
export const formatDisplayDate = (dateStr: string): string => {
  const d = parseDateKey(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Format full display date: "Thursday, 03 Sep 2026".
 */
export const formatFullDisplayDate = (dateStr: string): string => {
  const d = parseDateKey(dateStr);
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
  const dateFormatted = d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  return `${weekday}, ${dateFormatted}`;
};

/**
 * Get localized Month Name & Year string: "September 2026".
 */
export const getMonthYearHeader = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export interface CalendarGridCell {
  dateStr: string;
  dayNum: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  dayOfWeekName: string;
}

/**
 * Generate a standard Monday-first 7-column calendar matrix for a given month.
 */
export const generateCalendarMatrix = (currentMonthDate: Date): CalendarGridCell[] => {
  const currentYear = currentMonthDate.getFullYear();
  const currentMonthIdx = currentMonthDate.getMonth(); // 0-based: 0 = Jan, 8 = Sep

  const firstDayOfMonth = new Date(currentYear, currentMonthIdx, 1);
  // Mon = 0, Tue = 1, Wed = 2, Thu = 3, Fri = 4, Sat = 5, Sun = 6
  const startDayOffset = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonthIdx, 0).getDate();

  const cells: CalendarGridCell[] = [];
  const todayKey = getTodayDateKey();

  // 1. Previous month trailing cells
  for (let i = startDayOffset - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevDate = new Date(currentYear, currentMonthIdx - 1, dayNum);
    const dateStr = formatDateKey(prevDate);
    cells.push({
      dateStr,
      dayNum,
      isCurrentMonth: false,
      isToday: dateStr === todayKey,
      dayOfWeekName: getDayNameFromKey(dateStr)
    });
  }

  // 2. Current month cells
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(currentYear, currentMonthIdx, day);
    const dateStr = formatDateKey(d);
    cells.push({
      dateStr,
      dayNum: day,
      isCurrentMonth: true,
      isToday: dateStr === todayKey,
      dayOfWeekName: getDayNameFromKey(dateStr)
    });
  }

  // 3. Next month leading cells to complete final 7-day row
  const remainingCells = (7 - (cells.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    const nextDate = new Date(currentYear, currentMonthIdx + 1, i);
    const dateStr = formatDateKey(nextDate);
    cells.push({
      dateStr,
      dayNum: i,
      isCurrentMonth: false,
      isToday: dateStr === todayKey,
      dayOfWeekName: getDayNameFromKey(dateStr)
    });
  }

  return cells;
};
