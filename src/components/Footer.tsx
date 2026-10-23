import { Play, Check } from "lucide-react";

export function Footer() {
  return (
    <footer className="footer">
      <a className="brand" href="#">
        <span className="brand-mark">
          <Play size={14} fill="currentColor" />
        </span>
        <span>
          playlist<span className="brand-accent">length</span>
        </span>
      </a>
      <p>Made for the skills and knowledge you’ve been meaning to master.</p>
      <span className="privacy-note">
        <Check size={13} /> No accounts. Your progress stays on your machine.
      </span>
      <span className="footer-copy">© 2026 PlaylistLength</span>
    </footer>
  );
}
