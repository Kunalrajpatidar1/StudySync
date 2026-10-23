import { ArrowRight, Check } from "lucide-react";

interface BottomCtaProps {
  onStart: () => void;
}

export function BottomCta({ onStart }: BottomCtaProps) {
  return (
    <section className="bottom-cta-section">
      <div className="bottom-cta-card">
        <div className="eyebrow">
          <span className="eyebrow-dot" /> DELIBERATE MOMENTUM
        </div>
        <h2>
          Begin learning with <span>deliberate ease.</span>
        </h2>
        <p>Turn quiet intention into steady progress. Bring any lecture series, coding course, or deep dive.</p>
        <button type="button" className="bottom-cta-button" onClick={onStart}>
          <span>Calculate your playlist</span>
          <ArrowRight size={16} />
        </button>
        <div className="bottom-cta-trust">
          <Check size={14} />
          <span>Free forever · No sign-up required · Respects your focus</span>
        </div>
      </div>
    </section>
  );
}
