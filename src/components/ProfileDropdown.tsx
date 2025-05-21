
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserData, logoutUser } from "@/utils/spiritualIdUtils";
import { UserRound, Copy, Download, LogOut } from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface ProfileDropdownProps {
  onClose: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ onClose }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userData = getUserData();
  const navigate = useNavigate();
  const [showIdCopy, setShowIdCopy] = useState(false);

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
          description: "Could not copy to clipboard",
          variant: "destructive"
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
          {showIdCopy ? (
            <div className="px-4 py-2 flex items-center justify-between">
              <p className="text-sm text-amber-400 truncate">{userData?.id}</p>
              <button 
                className="ml-2 p-1 rounded-full hover:bg-zinc-700"
                onClick={handleCopyId}
              >
                <Copy size={16} className="text-gray-400" />
              </button>
            </div>
          ) : (
            <button 
              className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-zinc-700"
              onClick={toggleIdCopy}
            >
              <UserRound size={16} className="mr-2 text-gray-400" />
              View ID
            </button>
          )}
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
