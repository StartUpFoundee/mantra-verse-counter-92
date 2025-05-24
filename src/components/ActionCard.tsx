
import React from "react";
import { LucideIcon } from "lucide-react";
import ModernCard from "./ModernCard";

interface ActionCardProps {
  title: string;
  description: string;
  hindiDescription: string;
  icon: LucideIcon;
  gradient: string;
  onClick: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  hindiDescription,
  icon: Icon,
  gradient,
  onClick
}) => {
  return (
    <ModernCard 
      onClick={onClick}
      className="p-6 group"
      glowEffect={true}
    >
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 ${gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{description}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">{hindiDescription}</p>
        </div>
      </div>
    </ModernCard>
  );
};

export default ActionCard;
