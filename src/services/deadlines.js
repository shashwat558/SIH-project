import { differenceInCalendarDays, format, parseISO } from "date-fns";

// All deadline logic lives here so UI never hand-rolls date math.
// Challenges carry `deadlineDate` (ISO) + legacy `deadline` label.

export function deadlineDateOf(challenge) {
  if (!challenge) return null;
  if (challenge.deadlineDate) return parseISO(challenge.deadlineDate);
  return null;
}

export function daysLeft(challenge, now = new Date()) {
  const d = deadlineDateOf(challenge);
  if (!d) return null;
  return differenceInCalendarDays(d, now);
}

export function urgencyOf(challenge, now = new Date()) {
  const left = daysLeft(challenge, now);
  if (left === null) return "none";
  if (left < 0) return "closed";
  if (left <= 7) return "urgent";
  if (left <= 21) return "soon";
  return "open";
}

export function urgencyLabel(challenge, now = new Date()) {
  const left = daysLeft(challenge, now);
  if (left === null) return challenge.deadline || "";
  if (left < 0) return "Closed";
  if (left === 0) return "Closes today";
  if (left === 1) return "1 day left";
  return `${left} days left`;
}

export function deadlineBadge(challenge, now = new Date()) {
  return { urgency: urgencyOf(challenge, now), label: urgencyLabel(challenge, now) };
}

export function formatDate(iso) {
  try {
    return format(parseISO(iso), "d MMM yyyy");
  } catch {
    return iso;
  }
}

export function sortByDeadline(list, now = new Date()) {
  return [...list].sort((a, b) => {
    const da = daysLeft(a, now);
    const db = daysLeft(b, now);
    if (da === null) return 1;
    if (db === null) return -1;
    return da - db;
  });
}

export function closingSoon(list, withinDays = 21, limit = 5, now = new Date()) {
  return sortByDeadline(list, now)
    .filter((c) => {
      const left = daysLeft(c, now);
      return left !== null && left >= 0 && left <= withinDays;
    })
    .slice(0, limit);
}

// ICS download for "Add deadline to calendar" (slice 1 helper, used by later slices).
export function deadlineICS(challenge) {
  const d = deadlineDateOf(challenge);
  if (!d) return null;
  const stamp = (date) =>
    format(date, "yyyyMMdd'T'HHmmss").replace(/[-:]/g, "");
  const start = new Date(d);
  start.setHours(23, 59, 0, 0);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Startup2Gov//Challenge Deadline//EN",
    "BEGIN:VEVENT",
    `UID:${challenge.id}-deadline@startup2gov`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `SUMMARY:Apply: ${challenge.title}`,
    `DESCRIPTION:Application deadline for ${challenge.title} (${challenge.department}). Sample data.`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return ics;
}
