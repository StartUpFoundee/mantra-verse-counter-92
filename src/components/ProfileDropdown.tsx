
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserData, logoutUser } from "@/utils/spiritualIdUtils";
import { UserRound, Copy, Download, LogOut } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import ModernCard from "./ModernCard";

interface ProfileDropdownProps {
  onClose: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ onClose }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [userData, setUserData] = useState<any>(null);
  const navigate = useNavigate();
  const [showIdCopy, setShowIdCopy] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    // Get user data
    const currentUserData = getUserData();
    setUserData(currentUserData);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleLogout = () => {
    logoutUser();
    onClose();
    navigate("/spiritual-id"); // Take user to spiritual-id page after logout
  };

  const handleCopyId = () => {
    if (!userData?.id) return;
    
    navigator.clipboard.writeText(userData.id)
      .then(() => {
        toast("ID Copied", {
          description: "Your spiritual ID has been copied to clipboard"
        });
      })
      .catch(err => {
        toast("Copy Failed", {
          description: "Could not copy to clipboard"
        });
      });
  };

  const handleExportIdentity = () => {
    if (!userData) return;
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `spiritual-identity-${userData.id}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast("Identity Exported", {
      description: "Your spiritual identity data has been downloaded."
    });
    
    onClose();
  };

  const toggleIdCopy = () => {
    setShowIdCopy(!showIdCopy);
  };

  if (!userData) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-64 z-50"
    >
      <ModernCard className="p-0 bg-white/95 dark:bg-zinc-800/95 backdrop-blur-xl border-amber-200/50 dark:border-amber-700/50 shadow-2xl" gradient>
        <div className="px-4 py-3 border-b border-amber-200/30 dark:border-amber-700/30">
          <p className="text-sm font-medium text-amber-600 dark:text-amber-400">{userData.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">ID: {userData.id}</p>
        </div>
        
        <ul className="py-1">
          <li>
            {showIdCopy ? (
              <div className="px-4 py-3 flex items-center justify-between">
                <p className="text-sm text-amber-600 dark:text-amber-400 truncate">{userData?.id}</p>
                <button 
                  className="ml-2 p-1.5 rounded-full hover:bg-amber-500/20 transition-colors duration-200"
                  onClick={handleCopyId}
                >
                  <Copy size={16} className="text-amber-600 dark:text-amber-400" />
                </button>
              </div>
            ) : (
              <button 
                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-amber-50/50 dark:hover:bg-amber-900/20 transition-colors duration-200"
                onClick={toggleIdCopy}
              >
                <UserRound size={16} className="mr-3 text-amber-600 dark:text-amber-400" />
                View ID
              </button>
            )}
          </li>
          <li>
            <button 
              className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-amber-50/50 dark:hover:bg-amber-900/20 transition-colors duration-200"
              onClick={handleExportIdentity}
            >
              <Download size={16} className="mr-3 text-amber-600 dark:text-amber-400" />
              Save Identity
            </button>
          </li>
          <li className="border-t border-amber-200/30 dark:border-amber-700/30 mt-1">
            <button 
              className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-red-50/50 dark:hover:bg-red-900/20 transition-colors duration-200"
              onClick={handleLogout}
            >
              <LogOut size={16} className="mr-3 text-red-500 dark:text-red-400" />
              <span className="text-red-600 dark:text-red-400">Logout</span>
            </button>
          </li>
        </ul>
      </ModernCard>
    </div>
  );
};

export default ProfileDropdown;
