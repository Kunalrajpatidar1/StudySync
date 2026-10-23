import React from "react";
import { GraduationCap, Sparkles, CalendarDays, Check, ArrowRight } from "lucide-react";
import { Playlist, StudyDay } from "../types";
import { formatDuration, formatDate } from "../utils/time";
import { googleCalendarEventUrl, importAllSessions } from "../utils/calendar";
import { Glass } from "./Glass";

interface StudyPlannerProps {
  active: Playlist;
  hoursPerDay: number;
  setHoursPerDay: (val: number) => void;
  minutesPerSession: number;
  setMinutesPerSession: (val: number) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  speed: number;
  setSpeed: (val: number) => void;
  customSpeed: number;
  speeds: number[];
  completion: number;
  setCompletion: (val: number) => void;
  skipWeekends: boolean;
  setSkipWeekends: (val: boolean) => void;
  playlistDays: StudyDay[];
  previewDays: StudyDay[];
  startTime: string;
  setStartTime: (val: string) => void;
  reminder: number;
  setReminder: (val: number) => void;
  progressChanged: boolean;
  reschedulePreview: boolean;
  setReschedulePreview: (val: boolean) => void;
  onConfirmReschedule: () => void;
  onNotify: (msg: string) => void;
}

export function StudyPlanner({
  active,
  hoursPerDay,
  setHoursPerDay,
  minutesPerSession,
  setMinutesPerSession,
  startDate,
  setStartDate,
  speed,
  setSpeed,
  customSpeed,
  speeds,
  completion,
  setCompletion,
  skipWeekends,
  setSkipWeekends,
  playlistDays,
  previewDays,
  startTime,
  setStartTime,
  reminder,
  setReminder,
  progressChanged,
  reschedulePreview,
  setReschedulePreview,
  onConfirmReschedule,
  onNotify,
}: StudyPlannerProps) {
  const hoursPct = ((hoursPerDay - 0.25) / (4 - 0.25)) * 100;
  const sessionPct = ((minutesPerSession - 5) / (120 - 5)) * 100;
  const completionPct = ((completion - 10) / (100 - 10)) * 100;

  return (
    <>
      <div className="section-heading">
        <div>
          <div className="section-kicker">
            <span className="kicker-icon">
              <GraduationCap size={14} />
            </span>{" "}
            THE SMART STUDY PLANNER
          </div>
          <h2>Make steady progress, every day.</h2>
          <p>A tranquil plan that fits your rhythm—not the other way around.</p>
        </div>
        <span className="planner-badge">
          <Sparkles size={13} /> PERSONALISED FOR YOU
        </span>
      </div>

      <Glass className="planner-card">
        <div className="planner-controls">
          <label className="planner-control">
            <span>
              Hours per day <b>{hoursPerDay.toFixed(2).replace(/0$/, "")}h</b>
            </span>
            <input
              aria-label="Hours per day"
              type="range"
              min="0.25"
              max="4"
              step="0.25"
              value={hoursPerDay}
              style={{ "--slider-pct": `${hoursPct}%` } as React.CSSProperties}
              onChange={(event) => setHoursPerDay(Number(event.target.value))}
            />
          </label>
          <label className="planner-control">
            <span>
              Session limit <b>{minutesPerSession} min</b>
            </span>
            <input
              aria-label="Minutes per session"
              type="range"
              min="5"
              max="120"
              step="5"
              value={minutesPerSession}
              style={{ "--slider-pct": `${sessionPct}%` } as React.CSSProperties}
              onChange={(event) => setMinutesPerSession(Number(event.target.value))}
            />
          </label>
          <label className="planner-control date-control">
            <span>Start date</span>
            <input aria-label="Start date" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          </label>
          <label className="planner-control">
            <span>Watch speed</span>
            <select aria-label="Planner watch speed" value={speed} onChange={(event) => setSpeed(Number(event.target.value))}>
              {speeds.map((option) => (
                <option key={option} value={option}>
                  {option}× speed
                </option>
              ))}
              <option value={-1}>Custom · {customSpeed.toFixed(2)}×</option>
            </select>
          </label>
          <label className="planner-control">
            <span>
              Course portion <b>{completion}%</b>
            </span>
            <input
              aria-label="Playlist portion"
              type="range"
              min="10"
              max="100"
              step="5"
              value={completion}
              style={{ "--slider-pct": `${completionPct}%` } as React.CSSProperties}
              onChange={(event) => setCompletion(Number(event.target.value))}
            />
          </label>
          <label className="weekend-toggle">
            <input type="checkbox" checked={skipWeekends} onChange={(event) => setSkipWeekends(event.target.checked)} />
            <span className="toggle-track" />
            <span>Skip weekends</span>
          </label>
        </div>

        <div className="planner-overview">
          <div>
            <span className="mini-label">YOUR CALIBRATED STUDY PLAN</span>
            <h3>
              {playlistDays.length} focused {playlistDays.length === 1 ? "day" : "days"} <span>·</span>{" "}
              {formatDuration(
                playlistDays.reduce((sum, day) => sum + day.duration, 0),
                true
              )}
            </h3>
            <p>
              {playlistDays.length
                ? `${formatDate(playlistDays[0].date, { month: "short", day: "numeric" })} → ${formatDate(
                    playlistDays[playlistDays.length - 1].date,
                    { month: "short", day: "numeric" }
                  )}`
                : "Adjust your plan parameters to begin."}
            </p>
          </div>
          <div className="calendar-actions">
            <label className="time-picker">
              Start{" "}
              <input
                aria-label="Calendar event start time"
                type="time"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
              />
            </label>
            <label className="reminder-picker">
              ICS reminder{" "}
              <select aria-label="iCalendar file reminder" value={reminder} onChange={(event) => setReminder(Number(event.target.value))}>
                {[5, 10, 15, 30, 60].map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {minutes} min before
                  </option>
                ))}
              </select>
            </label>
            {playlistDays[0] && (
              <a className="export-button" href={googleCalendarEventUrl(active, playlistDays[0], startTime)} target="_blank" rel="noreferrer">
                <CalendarDays size={15} /> Add Day 1 to Google Calendar
              </a>
            )}
            <button
              className="export-button"
              onClick={() => {
                importAllSessions(active, playlistDays, startTime, reminder);
                onNotify(`Downloaded all ${playlistDays.length} sessions. Import the .ics file in Google Calendar.`);
              }}
              disabled={!playlistDays.length}
            >
              <CalendarDays size={15} /> Add all to Google Calendar
            </button>
          </div>
        </div>

        {progressChanged && (
          <div className="reschedule-panel">
            <span>
              <Sparkles size={14} />{" "}
              {reschedulePreview && playlistDays.length && previewDays.length
                ? `Your schedule recalibrates from ${formatDate(playlistDays[playlistDays.length - 1].date, {
                    month: "short",
                    day: "numeric",
                  })} to ${formatDate(previewDays[previewDays.length - 1].date, { month: "short", day: "numeric" })}.`
                : "You’ve checked off videos. Ready to update your study schedule?"}
            </span>
            {reschedulePreview ? (
              <button onClick={onConfirmReschedule}>
                Confirm reschedule <Check size={13} />
              </button>
            ) : (
              <button onClick={() => setReschedulePreview(true)}>
                Reschedule <ArrowRight size={13} />
              </button>
            )}
          </div>
        )}

        <div className="schedule-table">
          <div className="schedule-table-head">
            <span>DAY</span>
            <span>STUDY SESSION</span>
            <span>WATCH TIME</span>
            <span>SYNC</span>
          </div>
          {playlistDays.slice(0, 12).map((day, index) => (
            <div className="schedule-row" key={day.date.toISOString()}>
              <div className="day-number">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <b>{formatDate(day.date)}</b>
              </div>
              <div className="day-session">
                <span className="video-count">
                  {day.videos.length} {day.videos.length === 1 ? "video" : "videos"}
                </span>
                <div className="timeline">
                  {day.videos.slice(0, 10).map((video, i) => (
                    <span
                      key={`${video.id}-${i}`}
                      className={video.duration < 600 ? "length-short" : video.duration < 1800 ? "length-medium" : "length-long"}
                      style={{ width: `${Math.max(7, Math.min(44, (video.duration / day.duration) * 100))}%` }}
                      title={`${video.title} · ${formatDuration(video.duration)}`}
                    />
                  ))}
                </div>
                <span className="day-video-title">
                  {day.videos[0]?.title}
                  {day.videos.length > 1 ? ` + ${day.videos.length - 1} more` : ""}
                </span>
                {day.marathon && <span className="marathon-badge">DEEP DIVE</span>}
              </div>
              <strong className="day-duration">{formatDuration(day.duration)}</strong>
              <a
                className="schedule-calendar-link"
                href={googleCalendarEventUrl(active, day, startTime)}
                target="_blank"
                rel="noreferrer"
                aria-label={`Add study session day ${index + 1} to Google Calendar`}
                title={`Add day ${index + 1} to Google Calendar`}
              >
                <CalendarDays size={13} />
                <span>Add</span>
              </a>
            </div>
          ))}
        </div>

        {playlistDays.length > 12 && (
          <p className="showing-note">
            Showing 12 of {playlistDays.length} study days. All sessions are exported in your calendar download.
          </p>
        )}
        <p className="planner-footnote">
          <Sparkles size={13} /> Add all sessions opens Google Calendar's import page and downloads your .ics schedule.
        </p>
      </Glass>
    </>
  );
}
