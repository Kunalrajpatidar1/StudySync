import { ListChecks, ArrowRight, Check, Search, Play, BookmarkCheck } from "lucide-react";
import { Playlist, Video } from "../types";
import { formatDuration } from "../utils/time";
import { Glass } from "./Glass";

interface VideoChecklistProps {
  active: Playlist;
  watchable: Video[];
  watchedIds: string[];
  remaining: number;
  filter: string;
  setFilter: (val: string) => void;
  visibleVideos: Video[];
  progressChanged: boolean;
  onSetReschedulePreview: (val: boolean) => void;
  onMarkAllWatched: () => void;
  onToggleVideo: (video: Video, checked: boolean) => void;
}

export function VideoChecklist({
  active,
  watchable,
  watchedIds,
  remaining,
  filter,
  setFilter,
  visibleVideos,
  progressChanged,
  onSetReschedulePreview,
  onMarkAllWatched,
  onToggleVideo,
}: VideoChecklistProps) {
  return (
    <section className="video-section">
      <div className="video-section-heading">
        <div>
          <div className="section-kicker">
            <span className="kicker-icon">
              <ListChecks size={14} />
            </span>{" "}
            YOUR WATCH LIST
          </div>
          <h2>One lecture at a time.</h2>
          <p>
            <strong>{formatDuration(remaining)}</strong> remaining <span>·</span> {watchedIds.length} of {watchable.length} completed
          </p>
        </div>
        <div className="watch-actions">
          {progressChanged && (
            <button className="text-button" onClick={() => onSetReschedulePreview(true)}>
              Reschedule <ArrowRight size={14} />
            </button>
          )}
          <button className="text-button" onClick={onMarkAllWatched}>
            Mark all completed <Check size={14} />
          </button>
        </div>
      </div>

      <Glass className="video-list-card">
        <div className="video-list-toolbar">
          <div className="video-search">
            <Search size={15} />
            <input
              aria-label="Search videos"
              placeholder="Search lectures & topics…"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            />
          </div>
          <span>{visibleVideos.length} lectures</span>
        </div>
        <div className="video-list">
          {visibleVideos.map((video) => (
            <label
              key={video.id}
              className={`video-row ${video.unavailable ? "unavailable" : ""} ${watchedIds.includes(video.id) ? "watched" : ""}`}
            >
              <input
                type="checkbox"
                disabled={video.unavailable}
                checked={watchedIds.includes(video.id)}
                onChange={(event) => onToggleVideo(video, event.target.checked)}
              />
              <span className="video-index">{String(active.videos.indexOf(video) + 1).padStart(2, "0")}</span>
              <div className="video-thumb">
                {video.thumbnail ? <img src={video.thumbnail} alt="" loading="lazy" /> : <Play size={13} />}
              </div>
              <span className="video-title">
                {video.title}
                {video.unavailable && <small>Unavailable · excluded from total</small>}
              </span>
              <span className="video-duration">{video.unavailable ? "—" : formatDuration(video.duration)}</span>
            </label>
          ))}
        </div>
        <div className="video-list-footer">
          Your watch progress is saved privately on this device <BookmarkCheck size={14} />
        </div>
      </Glass>
    </section>
  );
}
