import { useEffect, useState } from "react";
import { formatDuration } from "../utils/time";

export function AnimatedDuration({ seconds }: { seconds: number }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    let frame = 0;
    const started = performance.now();
    const duration = 850;

    const animate = (now: number) => {
      const progress = Math.min(1, (now - started) / duration);
      setDisplayed(Math.round(seconds * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [seconds]);

  return <>{formatDuration(displayed, true)}</>;
}
