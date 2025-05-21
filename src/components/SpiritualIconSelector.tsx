
import React from "react";
import { spiritualIcons } from "@/utils/spiritualIdUtils";

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
      <label className="block text-amber-400 mb-2">
        Choose your spiritual symbol / अपना आध्यात्मिक प्रतीक चुनें
      </label>
      <div className="grid grid-cols-5 gap-2">
        {spiritualIcons.map((icon) => (
          <button
            key={icon.id}
            onClick={() => onSelectIcon(icon.id)}
            className={`p-2 text-3xl aspect-square flex items-center justify-center rounded-lg transition-all ${
              selectedIcon === icon.id 
                ? "bg-amber-500/30 border-2 border-amber-500" 
                : "bg-zinc-800 border border-zinc-700 hover:bg-zinc-700"
            }`}
            title={icon.name}
            type="button"
          >
            {icon.symbol}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-2 text-center">
        This symbol will represent your spiritual journey
      </p>
    </div>
  );
};

export default SpiritualIconSelector;
