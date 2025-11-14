import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { StatCard } from "./StatCard";

export interface StatItem {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  action?: ReactNode;
}

interface StatsGridProps {
  stats: StatItem[];
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          description={stat.description}
          icon={stat.icon}
          action={stat.action}
        />
      ))}
    </div>
  );
}
