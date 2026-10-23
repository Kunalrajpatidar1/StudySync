import { Playlist, StudyDay } from "../types";
import { formatDuration } from "./time";

export function escapeIcs(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

export function exportCalendar(playlist: Playlist, days: StudyDay[], startTime: string, reminder: number) {
  const [hours, minutes] = startTime.split(":").map(Number);
  const stamp = (date: Date) =>
    `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(
      2,
      "0"
    )}T${String(date.getHours()).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}00`;

  const events = days
    .map((day) => {
      const start = new Date(day.date);
      start.setHours(hours, minutes, 0, 0);
      const end = new Date(start.getTime() + day.duration * 1000);
      const title = playlist.title;
      const description = day.videos
        .map((video) => `${video.title} (${formatDuration(video.duration)})\nhttps://www.youtube.com/watch?v=${video.id}`)
        .join("\n\n");
      return `BEGIN:VEVENT\r\nUID:${crypto.randomUUID()}@playlistlength.app\r\nDTSTAMP:${stamp(new Date())}\r\nDTSTART:${stamp(
        start
      )}\r\nDTEND:${stamp(end)}\r\nSUMMARY:${escapeIcs(title)}\r\nDESCRIPTION:${escapeIcs(
        description
      )}\r\nBEGIN:VALARM\r\nTRIGGER:-PT${reminder}M\r\nACTION:DISPLAY\r\nDESCRIPTION:Study session reminder\r\nEND:VALARM\r\nEND:VEVENT`;
    })
    .join("\r\n");

  const file = new Blob(
    [`BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//PlaylistLength//Study Plan//EN\r\nCALSCALE:GREGORIAN\r\n${events}\r\nEND:VCALENDAR`],
    { type: "text/calendar;charset=utf-8" }
  );
  const link = document.createElement("a");
  link.href = URL.createObjectURL(file);
  link.download = `${playlist.title.replace(/[^\w-]+/g, "-").slice(0, 60) || "study-plan"}.ics`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

export function importAllSessions(playlist: Playlist, days: StudyDay[], startTime: string, reminder: number) {
  window.open("https://calendar.google.com/calendar/u/0/r/settings/import", "_blank", "noopener,noreferrer");
  exportCalendar(playlist, days, startTime, reminder);
}

export function googleCalendarEventUrl(playlist: Playlist, day: StudyDay, startTime: string): string {
  const [hours, minutes] = startTime.split(":").map(Number);
  const start = new Date(day.date);
  start.setHours(hours, minutes, 0, 0);
  const end = new Date(start.getTime() + day.duration * 1000);
  const calendarStamp = (date: Date) =>
    `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(
      2,
      "0"
    )}T${String(date.getHours()).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}00`;
  const title = playlist.title;
  const description = day.videos
    .map((video) => `${video.title} (${formatDuration(video.duration)})\nhttps://www.youtube.com/watch?v=${video.id}`)
    .join("\n\n");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${calendarStamp(start)}/${calendarStamp(end)}`,
    details: description,
    ctz: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
