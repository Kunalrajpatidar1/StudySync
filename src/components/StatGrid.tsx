import { Timer, ArrowUpRight, ArrowDown } from "lucide-react";
import { Video } from "../types";
import { formatDuration } from "../utils/time";
import { Glass } from "./Glass";

interface StatGridProps {
  watchable: Video[];
  unavailableCount: number;
  totalDuration: number;
}

export function StatGrid({ watchable, unavailableCount, totalDuration }: StatGridProps) {
  const averageDuration = watchable.length ? totalDuration / watchable.length : 0;
  const longestDuration = Math.max(0, ...watchable.map((v) => v.duration));
  const shortestDuration = watchable.length ? Math.min(...watchable.map((v) => v.duration)) : 0;

  const stats = [
    {
      label: "AVERAGE VIDEO",
      value: formatDuration(averageDuration),
      icon: <Timer size={17} />,
    },
    {
      label: "LONGEST VIDEO",
      value: formatDuration(longestDuration),
      icon: <ArrowUpRight size={17} />,
    },
    {
      label: "SHORTEST VIDEO",
      value: watchable.length ? formatDuration(shortestDuration) : "—",
      icon: <ArrowDown size={17} />,
    },
    {
      label: "UNAVAILABLE",
      value: `${unavailableCount} items`,
      icon: <span className="stat-dash">—</span>,
    },
  ];

  return (
    <div className="stat-grid">
      {stats.map((stat) => (
        <Glass className="stat-card" key={stat.label}>
          <span className="stat-icon">{stat.icon}</span>
          <span className="mini-label">{stat.label}</span>
          <strong>{stat.value}</strong>
        </Glass>
      ))}
    </div>
  );
}
