
import React, { useState } from "react";
import { getUserData } from "@/utils/spiritualIdUtils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ProfileDropdown from "./ProfileDropdown";

const ProfileHeader: React.FC = () => {
  const userData = getUserData();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!userData) return null;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        className="flex items-center gap-2 p-1 hover:bg-zinc-800 rounded-full"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <Avatar className="h-12 w-12 md:h-14 md:w-14 border-2 border-amber-600/30">
          <AvatarFallback className="bg-amber-500/20 text-amber-400 text-xl md:text-2xl">
            {userData.symbolImage || "🕉️"}
          </AvatarFallback>
        </Avatar>
        <span className="text-amber-400 text-sm hidden sm:inline-block">
          {userData.name}
        </span>
      </Button>

      {dropdownOpen && (
        <ProfileDropdown 
          onClose={() => setDropdownOpen(false)} 
        />
      )}
    </div>
  );
};

export default ProfileHeader;
