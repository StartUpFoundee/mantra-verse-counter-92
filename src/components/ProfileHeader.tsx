
import React, { useState, useEffect } from "react";
import { getActiveAccount, type UserAccount } from "@/utils/accountStorage";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ProfileDropdown from "./ProfileDropdown";
import ModernCard from "./ModernCard";

const ProfileHeader: React.FC = () => {
  const [userData, setUserData] = useState<UserAccount | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  useEffect(() => {
    // Get user data from account storage
    const loadUserData = async () => {
      try {
        const activeAccount = await getActiveAccount();
        if (activeAccount) {
          setUserData(activeAccount);
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      }
    };
    
    loadUserData();
  }, []);

  if (!userData) return null;

  const displayIcon = userData.userData?.symbolImage || "🕉️";

  return (
    <div className="relative">
      <ModernCard
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 lg:gap-3 p-2 lg:p-3 cursor-pointer hover:scale-105 transition-all duration-300 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border-amber-200/50 dark:border-amber-700/50"
      >
        <Avatar className="h-10 w-10 lg:h-12 lg:w-12 border-2 border-amber-300/50 dark:border-amber-600/50">
          <AvatarFallback className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 text-lg lg:text-xl">
            {displayIcon}
          </AvatarFallback>
        </Avatar>
        <span className="text-amber-600 dark:text-amber-400 text-sm lg:text-base font-medium hidden sm:inline-block">
          {userData.name}
        </span>
      </ModernCard>

      {dropdownOpen && (
        <ProfileDropdown 
          account={userData}
          onClose={() => setDropdownOpen(false)} 
        />
      )}
    </div>
  );
};

export default ProfileHeader;
