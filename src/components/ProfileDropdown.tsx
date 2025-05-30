
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { Copy, QrCode, RefreshCw, LogOut, User, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { QRCode } from "@/components/ui/qr-code";
import { clearAccountSlot, type UserAccount } from "@/utils/accountStorage";

interface ProfileDropdownProps {
  account: UserAccount;
  onClose: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ account, onClose }) => {
  const navigate = useNavigate();
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [qrData, setQrData] = useState("");

  const handleCopyUserId = () => {
    navigator.clipboard.writeText(account.id);
    toast("User ID Copied!", {
      description: "Your unique user ID has been copied to clipboard",
      icon: <Copy className="h-4 w-4 text-green-500" />
    });
  };

  const generateQRData = () => {
    const exportData = {
      id: account.id,
      name: account.name,
      dob: account.dob,
      hashedPassword: account.hashedPassword,
      salt: account.salt,
      createdAt: account.createdAt,
      userData: account.userData,
      exportDate: new Date().toISOString(),
      version: "2.0"
    };
    return JSON.stringify(exportData);
  };

  const handleShowQR = () => {
    const data = generateQRData();
    setQrData(data);
    setShowQRDialog(true);
  };

  const handleRefreshQR = () => {
    const data = generateQRData();
    setQrData(data);
    toast("QR Code Updated!", {
      description: "QR code has been refreshed with latest data",
      icon: <RefreshCw className="h-4 w-4 text-blue-500" />
    });
  };

  const handleDownloadBackup = () => {
    const backupData = {
      ...account,
      backupDate: new Date().toISOString(),
      version: "2.0"
    };
    
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportFileDefaultName = `account-backup-${account.name.replace(/[^a-z0-9]/gi, '_')}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast("Backup Downloaded!", {
      description: "Your account backup file has been saved",
      icon: <Download className="h-4 w-4 text-blue-500" />
    });
  };

  const handleLogout = async () => {
    try {
      // Clear session data
      sessionStorage.removeItem('activeAccountSlot');
      window.name = '';
      
      toast("Logged Out", {
        description: "You have been logged out successfully",
        icon: <LogOut className="h-4 w-4 text-blue-500" />
      });

      onClose();
      
      // Navigate to welcome screen
      navigate('/welcome');
    } catch (error) {
      console.error("Logout failed:", error);
      navigate('/welcome');
    }
  };

  const formatUserId = (id: string) => {
    if (id.length > 40) {
      return id.substring(0, 20) + "..." + id.substring(id.length - 15);
    }
    return id;
  };

  return (
    <>
      <Card className="absolute right-0 top-full mt-2 w-80 p-4 bg-white/95 dark:bg-zinc-800/95 backdrop-blur-sm border border-amber-200/50 dark:border-amber-700/50 shadow-lg z-50">
        <div className="space-y-4">
          {/* Profile Info */}
          <div className="flex items-center gap-3 pb-3 border-b border-gray-200/50 dark:border-zinc-700/50">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg flex items-center justify-center text-xl">
              {account.userData?.symbolImage || "🕉️"}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{account.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Slot {account.slotId}</p>
            </div>
          </div>

          {/* User ID Section */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">User ID:</p>
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-700 rounded p-2">
              <code className="text-xs font-mono flex-1 break-all text-gray-600 dark:text-gray-300">
                {formatUserId(account.id)}
              </code>
              <Button
                onClick={handleCopyUserId}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              onClick={handleShowQR}
              variant="outline"
              className="w-full justify-start text-sm"
            >
              <QrCode className="h-4 w-4 mr-2" />
              Generate QR Code
            </Button>
            
            <Button
              onClick={handleDownloadBackup}
              variant="outline"
              className="w-full justify-start text-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Backup
            </Button>
            
            <Button
              onClick={() => {
                onClose();
                navigate('/spiritual-id');
              }}
              variant="outline"
              className="w-full justify-start text-sm"
            >
              <User className="h-4 w-4 mr-2" />
              Account Profile
            </Button>
            
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </Card>

      {/* Click outside to close */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your Account QR Code</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-4">
            <QRCode 
              value={qrData || generateQRData()} 
              size={200}
              className="border rounded-lg p-4 bg-white"
            />
            
            <div className="flex gap-2">
              <Button
                onClick={handleRefreshQR}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              
              <Button
                onClick={handleDownloadBackup}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Scan this QR code to import your account on another device
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileDropdown;
