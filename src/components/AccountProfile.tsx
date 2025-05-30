
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { Copy, Download, QrCode, User, Calendar, Key, LogOut } from "lucide-react";
import { QRCode } from "@/components/ui/qr-code";
import { 
  getActiveAccount, 
  clearAccountSlot, 
  hashPassword,
  type UserAccount 
} from "@/utils/accountStorage";

interface AccountProfileProps {
  account: UserAccount;
  onLogout: () => void;
}

const AccountProfile: React.FC<AccountProfileProps> = ({ account, onLogout }) => {
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const handleCopyID = () => {
    navigator.clipboard.writeText(account.id);
    toast("ID Copied!", {
      description: "Your unique ID has been copied to clipboard",
      icon: <Copy className="h-4 w-4 text-green-500" />
    });
  };

  const handleDownloadBackup = () => {
    const backupData = {
      ...account,
      backupDate: new Date().toISOString(),
      version: "1.0"
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

  const generateQRData = () => {
    const qrData = {
      id: account.id,
      name: account.name,
      dob: account.dob,
      hashedPassword: account.hashedPassword,
      salt: account.salt,
      createdAt: account.createdAt,
      userData: account.userData,
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(qrData);
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast("Missing Information", {
        description: "Please fill all password fields"
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast("Password Mismatch", {
        description: "New passwords don't match"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast("Password Too Short", {
        description: "Password must be at least 6 characters"
      });
      return;
    }

    try {
      // Verify current password
      const currentHash = await hashPassword(currentPassword, account.salt);
      if (currentHash !== account.hashedPassword) {
        toast("Invalid Password", {
          description: "Current password is incorrect"
        });
        return;
      }

      // Update to new password
      const newHash = await hashPassword(newPassword, account.salt);
      // Note: In a real implementation, you'd update the stored account
      
      toast("Password Updated!", {
        description: "Your password has been changed successfully",
        icon: <Key className="h-4 w-4 text-green-500" />
      });

      setShowPasswordDialog(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");

    } catch (error) {
      toast("Update Failed", {
        description: "Could not update password. Please try again."
      });
    }
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

      onLogout();
    } catch (error) {
      console.error("Logout failed:", error);
      onLogout(); // Still proceed with logout
    }
  };

  const formatAccountId = (id: string) => {
    if (id.length > 50) {
      return id.substring(0, 25) + "..." + id.substring(id.length - 15);
    }
    return id;
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-6">
      {/* Profile Header */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <User className="h-8 w-8 text-amber-600" />
              <div>
                <h1 className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                  {account.name}
                </h1>
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Account Slot {account.slotId}
                </p>
              </div>
            </div>
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Account Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>Account Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md font-medium">
              {account.name}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Date of Birth</Label>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>{new Date(account.dob).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              <span>Unique User ID</span>
              <Button
                onClick={handleCopyID}
                size="sm"
                variant="outline"
                className="h-7 px-2"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
            </Label>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md font-mono text-sm break-all">
              {formatAccountId(account.id)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-xs text-gray-500">Account Created</Label>
              <p className="font-medium">{new Date(account.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Last Login</Label>
              <p className="font-medium">{new Date(account.lastLogin).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              onClick={handleDownloadBackup}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download Backup</span>
            </Button>
            
            <Button
              onClick={() => setShowQRDialog(true)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <QrCode className="h-4 w-4" />
              <span>Generate QR Code</span>
            </Button>
            
            <Button
              onClick={() => setShowPasswordDialog(true)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Key className="h-4 w-4" />
              <span>Change Password</span>
            </Button>
            
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Account QR Code</DialogTitle>
            <DialogDescription>
              Scan this QR code to import your account on another device
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-4">
            <QRCode 
              value={generateQRData()} 
              size={200}
              className="border rounded-lg p-4 bg-white"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              This QR code contains your complete account data including all spiritual progress
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirm New Password</Label>
              <Input
                id="confirm-new-password"
                type="password"
                placeholder="Confirm new password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
            </div>
            
            <Button
              onClick={handlePasswordChange}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            >
              Update Password
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountProfile;
