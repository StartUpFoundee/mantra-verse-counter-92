
import React from "react";
import { cn } from "@/lib/utils";

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  gradient?: boolean;
  glowEffect?: boolean;
}

const ModernCard: React.FC<ModernCardProps> = ({ 
  children, 
  className, 
  onClick, 
  gradient = false,
  glowEffect = false 
}) => {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative rounded-2xl transition-all duration-300",
        gradient 
          ? "bg-gradient-to-br from-white/90 to-white/70 dark:from-zinc-800/90 dark:to-zinc-800/70" 
          : "bg-white/80 dark:bg-zinc-800/80",
        "backdrop-blur-sm border border-gray-200/50 dark:border-zinc-700/50 shadow-sm",
        onClick && "cursor-pointer hover:shadow-md hover:scale-[1.02]",
        glowEffect && "hover:shadow-lg hover:shadow-amber-200/20 dark:hover:shadow-amber-900/20",
        className
      )}
    >
      {children}
    </div>
  );
};

export default ModernCard;
