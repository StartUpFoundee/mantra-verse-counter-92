
import React from "react";
import { LucideIcon } from "lucide-react";
import ModernCard from "./ModernCard";

interface StatsCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: LucideIcon;
  gradient: string;
  onClick?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  onClick
}) => {
  return (
    <ModernCard 
      onClick={onClick}
      className="p-5"
      glowEffect={!!onClick}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-8 h-8 ${gradient} rounded-lg flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</h3>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {value.toLocaleString()}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
    </ModernCard>
  );
};

export default StatsCard;
