import { Play, ArrowUpRight, Sun, Moon, Github } from "lucide-react";

interface NavbarProps {
  dark: boolean;
  onToggleTheme: () => void;
  onCopyLink: () => void;
}

export function Navbar({ dark, onToggleTheme, onCopyLink }: NavbarProps) {
  return (
    <header className="navbar">
      <a className="brand" href="#" aria-label="PlaylistLength home">
        <span className="brand-mark">
          <Play size={16} fill="currentColor" />
        </span>
        <span>
          playlist<span className="brand-accent">length</span>
        </span>
      </a>
      <nav className="nav-links" aria-label="Main navigation">
        <a href="#how-it-works">How it works</a>
        <a href="#features">Features</a>
        <a href="#savings">Speed matrix</a>
        <a href="#faq">FAQ</a>
      </nav>
      <div className="nav-actions">
        <button className="icon-button" onClick={onCopyLink} aria-label="Copy page link" title="Copy page link">
          <ArrowUpRight size={16} />
        </button>
        <button
          className="icon-button"
          onClick={onToggleTheme}
          aria-label={dark ? "Switch to serene light theme" : "Switch to tranquil dark theme"}
          title="Toggle theme"
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <a className="github-link" href="https://github.com" target="_blank" rel="noreferrer">
          <Github size={15} />
          <span>GitHub</span>
        </a>
      </div>
    </header>
  );
}
