
import React from "react";
import { spiritualIcons } from "@/utils/spiritualIdUtils";
import ModernCard from "./ModernCard";

interface SpiritualIconSelectorProps {
  selectedIcon: string;
  onSelectIcon: (icon: string) => void;
}

const SpiritualIconSelector: React.FC<SpiritualIconSelectorProps> = ({ 
  selectedIcon, 
  onSelectIcon 
}) => {
  return (
    <div className="w-full">
      <label className="block text-amber-600 dark:text-amber-400 font-medium mb-3 lg:mb-4">
        Choose your spiritual symbol / अपना आध्यात्मिक प्रतीक चुनें
      </label>
      <div className="grid grid-cols-5 lg:grid-cols-6 gap-2 lg:gap-3">
        {spiritualIcons.map((icon) => (
          <ModernCard
            key={icon.id}
            onClick={() => onSelectIcon(icon.id)}
            className={`p-3 lg:p-4 text-2xl lg:text-3xl aspect-square flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 ${
              selectedIcon === icon.id 
                ? "bg-gradient-to-br from-amber-500/30 to-orange-500/30 border-2 border-amber-500 shadow-lg" 
                : "hover:shadow-md"
            }`}
          >
            <span className="select-none" title={icon.name}>
              {icon.symbol}
            </span>
          </ModernCard>
        ))}
      </div>
      <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-2 lg:mt-3 text-center">
        This symbol will represent your spiritual journey
      </p>
    </div>
  );
};

export default SpiritualIconSelector;
