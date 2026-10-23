import { Sparkles, Youtube, Clock3, CalendarDays } from "lucide-react";
import { Glass } from "./Glass";

export function HowItWorks() {
  const steps = [
    {
      icon: <Youtube size={20} />,
      number: "01",
      title: "Paste your playlist",
      text: "Drop in any YouTube playlist, lecture series, or @channel. No sign-up, zero setup friction.",
    },
    {
      icon: <Clock3 size={20} />,
      number: "02",
      title: "Find your pace",
      text: "Discover the real watch time, explore playback speed savings, and choose a peaceful daily rhythm.",
    },
    {
      icon: <CalendarDays size={20} />,
      number: "03",
      title: "Finish with calm momentum",
      text: "Export sessions directly to Google Calendar or ICS, and tick off lectures peacefully as you progress.",
    },
  ];

  return (
    <section className="how-section" id="how-it-works">
      <div className="section-heading centered">
        <div className="section-kicker">
          <span className="kicker-icon">
            <Sparkles size={14} />
          </span>{" "}
          SIMPLE BY DESIGN
        </div>
        <h2>
          From “someday” to <span>done.</span>
        </h2>
        <p>Three intentional steps between you and your next milestone.</p>
      </div>

      <div className="steps-grid">
        {steps.map((step) => (
          <Glass className="step-card" key={step.number}>
            <div className="step-top">
              <span className="step-icon">{step.icon}</span>
              <span className="step-number">{step.number}</span>
            </div>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </Glass>
        ))}
      </div>
    </section>
  );
}
