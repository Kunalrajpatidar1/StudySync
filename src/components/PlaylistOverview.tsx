import { Play, Zap } from "lucide-react";
import { Playlist } from "../types";
import { formatDuration } from "../utils/time";
import { AnimatedDuration } from "./AnimatedDuration";
import { Glass } from "./Glass";

interface PlaylistOverviewProps {
  active: Playlist;
  results: Playlist[];
  totalDuration: number;
  onNotify: (msg: string) => void;
}

export function PlaylistOverview({ active, results, totalDuration, onNotify }: PlaylistOverviewProps) {
  const watchableVideos = active.videos.filter((v) => !v.unavailable);
  const unavailableVideos = active.videos.filter((v) => v.unavailable);

  return (
    <>
      {results.length > 1 && (
        <div className="compare-grid">
          {results.map((playlist) => (
            <Glass key={playlist.id} className="compare-card">
              <img src={playlist.thumbnail} alt="" />
              <div>
                <span className="mini-label">PLAYLIST</span>
                <h3>{playlist.title}</h3>
                <p>
                  {playlist.videos.filter((video) => !video.unavailable).length} videos ·{" "}
                  {formatDuration(
                    playlist.videos.reduce((sum, video) => sum + (video.unavailable ? 0 : video.duration), 0),
                    true
                  )}
                </p>
              </div>
            </Glass>
          ))}
        </div>
      )}

      <div className="section-kicker">
        <span className="kicker-icon">
          <Zap size={14} />
        </span>{" "}
        YOUR PLAYLIST, DECODED{" "}
        <button
          className="copy-button"
          onClick={() =>
            void navigator.clipboard
              .writeText(active.title)
              .then(() => onNotify("Playlist title copied."))
              .catch(() => onNotify("Clipboard access isn't available."))
          }
        >
          Copy title
        </button>
      </div>

      <Glass className="playlist-card">
        <div className="playlist-identity">
          <div className="playlist-image-wrap">
            <img src={active.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=320"} alt="" />
            <span className="play-overlay">
              <Play fill="currentColor" size={18} />
            </span>
          </div>
          <div className="playlist-meta">
            <span className="mini-label">YOUTUBE CURRICULUM</span>
            <h2>{active.title}</h2>
            <p>
              {active.channel} <span className="meta-dot" /> {watchableVideos.length} videos{" "}
              <span className="meta-dot" /> {unavailableVideos.length} unavailable
            </p>
          </div>
        </div>
        <div className="total-block">
          <span className="mini-label">TOTAL WATCH TIME</span>
          <strong>
            <AnimatedDuration seconds={totalDuration} />
          </strong>
          <span className="total-sub">{formatDuration(totalDuration)} at 1× baseline</span>
        </div>
      </Glass>
    </>
  );
}
