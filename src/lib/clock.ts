/**
 * The time where I am, as the first screen shows it: "2:41 pm ADT". The zone's short name comes
 * from the browser's own time-zone data, so daylight saving (ADT in summer, AST in winter) is
 * right without a table of dates.
 */
export function formatClock(date: Date, zone = "America/Moncton"): string {
  const parts = new Intl.DateTimeFormat("en-CA", { hour: "numeric", minute: "2-digit", timeZone: zone, timeZoneName: "short" }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  const period = part("dayPeriod").replace(/\./g, "").toLowerCase();
  return `${part("hour")}:${part("minute")} ${period} ${part("timeZoneName")}`;
}
