import { Plus, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface FaqSectionProps {
  faqs: [string, string][];
  openIndex: number | null;
  onToggle: (index: number) => void;
}

export function FaqSection({ faqs, openIndex, onToggle }: FaqSectionProps) {
  return (
    <section className="faq-section" id="faq">
      <div className="section-heading centered">
        <div className="section-kicker">
          <span className="kicker-icon">
            <Plus size={14} />
          </span>{" "}
          QUESTIONS & CLARITY
        </div>
        <h2>
          A few things you <span>might wonder.</span>
        </h2>
      </div>

      <div className="faq-list">
        {faqs.map(([question, answer], index) => (
          <div className={`faq-item ${openIndex === index ? "open" : ""}`} key={question}>
            <button type="button" onClick={() => onToggle(index)} aria-expanded={openIndex === index}>
              <span>{question}</span>
              <ChevronDown size={17} />
            </button>
            <AnimatePresence>
              {openIndex === index && (
                <motion.p
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                  {answer}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}
