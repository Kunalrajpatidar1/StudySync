import { FormEvent } from "react";
import { motion } from "framer-motion";
import { Youtube, ArrowRight, LoaderCircle, Play, Check } from "lucide-react";
import { TranquilDial } from "./TranquilDial";

interface HeroSectionProps {
  query: string;
  onQueryChange: (val: string) => void;
  onSubmit: (e: FormEvent) => void;
  loading: boolean;
  error: string;
  onRetry: () => void;
  examples: { label: string; id: string }[];
  onSelectExample: (id: string) => void;
  onNotify: (msg: string) => void;
  totalDuration: number;
}

export function HeroSection({
  query,
  onQueryChange,
  onSubmit,
  loading,
  error,
  onRetry,
  examples,
  onSelectExample,
  onNotify,
  totalDuration,
}: HeroSectionProps) {
  return (
    <section className="hero">
      <motion.div
        className="hero-content"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65 }}
      >
        <div className="eyebrow">
          <span className="eyebrow-dot" /> MINDFUL LEARNING ARCHITECTURE
        </div>
        <h1>
          How long is that YouTube playlist?<br />
          <span>Build a calm daily rhythm.</span>
        </h1>
        <p className="hero-subtitle">
          Paste any playlist, video, or channel link. Calculate true watch time, discover speed savings, and design a peaceful
          study schedule with calendar export.
        </p>

        {/* Tactile Hero Input */}
        <form className="search-form" onSubmit={onSubmit}>
          <Youtube className="youtube-icon" size={22} aria-hidden="true" />
          <textarea
            aria-label="YouTube playlist, video, or channel links"
            placeholder="Paste YouTube playlist URL, video link, or @channel..."
            value={query}
            onChange={(event) => {
              onQueryChange(event.target.value);
              event.currentTarget.style.height = "24px";
              event.currentTarget.style.height = `${Math.min(event.currentTarget.scrollHeight, 72)}px`;
            }}
            rows={1}
          />
          <button className="calculate-button" type="submit" disabled={loading}>
            {loading ? (
              <LoaderCircle className="spin" size={17} />
            ) : (
              <>
                <span>Calculate</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="input-hint">
          <span>↵</span> Paste up to 5 links, one per line <span className="hint-separator">·</span>{" "}
          <button
            type="button"
            onClick={() =>
              void navigator.clipboard
                .readText()
                .then((value) => onQueryChange(`${query}${query ? "\n" : ""}${value}`))
                .catch(() => onNotify("Clipboard access isn't available in this browser."))
            }
          >
            Paste from clipboard
          </button>
        </p>

        {error && (
          <motion.div className="error-message" role="alert" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
            <span>!</span>
            {error}
            <button type="button" onClick={onRetry} aria-label="Retry loading playlist">
              Retry
            </button>
          </motion.div>
        )}

        {/* Quick Example Chips */}
        <div className="example-row">
          <span className="example-label">TRY AN EXAMPLE</span>
          {examples.map((example) => (
            <button className="example-chip" key={example.id} type="button" onClick={() => onSelectExample(example.id)}>
              <Play size={11} fill="currentColor" />
              {example.label}
            </button>
          ))}
        </div>

        {/* Clear Privacy & Feature Trust Markers */}
        <div className="trust-row">
          <span>
            <Check size={14} /> Up to 5,000 videos
          </span>
          <i />
          <span>No sign-up</span>
          <i />
          <span>Progress stays in your browser</span>
          <i />
          <span>Calendar export</span>
        </div>
      </motion.div>

      {/* Tranquil Interactive Dial Widget */}
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }}>
        <TranquilDial initialTotalSeconds={totalDuration > 0 ? totalDuration : 56520} />
      </motion.div>
    </section>
  );
}
