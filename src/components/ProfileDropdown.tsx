
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getUserData, logoutUser } from "@/utils/spiritualIdUtils";
import { UserRound, HelpCircle, Download, LogOut } from "lucide-react";

interface ProfileDropdownProps {
  onClose: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ onClose }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userData = getUserData();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleLogout = () => {
    logoutUser();
    onClose();
    navigate("/");
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
    
    onClose();
  };

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-56 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg py-1 z-50"
    >
      {userData && (
        <div className="px-4 py-3 border-b border-zinc-700">
          <p className="text-sm font-medium text-amber-400">{userData.name}</p>
          <p className="text-xs text-gray-400 mt-1">ID: {userData.id}</p>
        </div>
      )}
      
      <ul>
        <li>
          <button 
            className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-zinc-700"
            onClick={() => {
              onClose();
              // In a real app, this would navigate to a profile view
              // For now, we'll just close the dropdown
            }}
          >
            <UserRound size={16} className="mr-2 text-gray-400" />
            View Profile
          </button>
        </li>
        <li>
          <button 
            className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-zinc-700"
            onClick={() => {
              onClose();
              // In a real app, this would show the identity guide
              // For now, we'll just close the dropdown
            }}
          >
            <HelpCircle size={16} className="mr-2 text-gray-400" />
            Identity Guide
          </button>
        </li>
        <li>
          <button 
            className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-zinc-700"
            onClick={handleExportIdentity}
          >
            <Download size={16} className="mr-2 text-gray-400" />
            Save Identity
          </button>
        </li>
        <li className="border-t border-zinc-700 mt-1">
          <button 
            className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-zinc-700"
            onClick={handleLogout}
          >
            <LogOut size={16} className="mr-2 text-gray-400" />
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
};

export default ProfileDropdown;
