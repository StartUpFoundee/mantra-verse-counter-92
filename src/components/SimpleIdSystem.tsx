
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Download, Upload, RefreshCw, CheckCircle, User } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { QRCode } from "@/components/ui/qr-code";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getActiveAccount, type UserAccount } from "@/utils/accountStorage";
import ModernCard from "./ModernCard";

const SimpleIdSystem: React.FC = () => {
  const [activeAccount, setActiveAccount] = useState<UserAccount | null>(null);
  const [importData, setImportData] = useState("");
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActiveAccount();
  }, []);

  const loadActiveAccount = async () => {
    try {
      const account = await getActiveAccount();
      setActiveAccount(account);
    } catch (error) {
      console.error("Failed to load active account:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyID = () => {
    if (!activeAccount) return;
    
    navigator.clipboard.writeText(activeAccount.id);
    toast("ID Copied!", {
      description: "Your unique ID has been copied to clipboard",
      icon: <CheckCircle className="h-4 w-4 text-green-500" />
    });
  };

  const handleDownloadBackup = () => {
    if (!activeAccount) return;
    
    const backupData = {
      ...activeAccount,
      backupDate: new Date().toISOString(),
      version: "2.0"
    };
    
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportFileDefaultName = `account-backup-${activeAccount.name.replace(/[^a-z0-9]/gi, '_')}-${new Date().toISOString().split('T')[0]}.json`;
    
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
    if (!activeAccount) return "";
    
    const qrData = {
      id: activeAccount.id,
      name: activeAccount.name,
      dob: activeAccount.dob,
      hashedPassword: activeAccount.hashedPassword,
      salt: activeAccount.salt,
      createdAt: activeAccount.createdAt,
      userData: activeAccount.userData,
      exportDate: new Date().toISOString(),
      version: "2.0"
    };
    return JSON.stringify(qrData);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (data.id && data.name) {
          setImportData(content);
          toast("File Loaded", {
            description: "Account data extracted from file. You can now import it.",
            icon: <Upload className="h-4 w-4 text-blue-500" />
          });
        } else {
          toast("Invalid File", {
            description: "This file doesn't contain valid account data"
          });
        }
      } catch (error) {
        toast("File Error", {
          description: "Could not read the file. Please check the format."
        });
      }
    };
    reader.readAsText(file);
  };

  const formatAccountId = (id: string) => {
    if (id.length > 60) {
      return id.substring(0, 30) + "..." + id.substring(id.length - 20);
    }
    return id;
  };

  if (loading) {
    return (
      <ModernCard className="p-6 lg:p-8 max-w-md mx-auto text-center">
        <div className="py-8">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-600 dark:text-amber-400">Loading account...</p>
        </div>
      </ModernCard>
    );
  }

  if (!activeAccount) {
    return (
      <ModernCard className="p-6 lg:p-8 max-w-md mx-auto border-blue-200/50 dark:border-blue-700/50" gradient>
        <div className="text-center mb-6">
          <User className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            No Active Account
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Please create or login to an account to access your unique ID
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => setShowImportDialog(true)}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
          >
            Import Existing Account
          </Button>
          
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Or go back to create a new account
          </p>
        </div>
      </ModernCard>
    );
  }

  return (
    <ModernCard className="p-6 lg:p-8 max-w-md mx-auto border-green-200/50 dark:border-green-700/50" gradient>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
          Your Account ID
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          Use this ID to access your account on any device
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4">
          <Label className="text-gray-700 dark:text-gray-300 font-medium block mb-2">
            Account: {activeAccount.name} (Slot {activeAccount.slotId})
          </Label>
          <div className="bg-white dark:bg-zinc-900 rounded border p-3 font-mono text-sm break-all">
            {formatAccountId(activeAccount.id)}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={handleCopyID}
            variant="outline"
            className="flex flex-col items-center py-4 h-auto"
          >
            <Copy className="h-5 w-5 mb-1" />
            <span className="text-xs">Copy</span>
          </Button>
          
          <Button
            onClick={handleDownloadBackup}
            variant="outline"
            className="flex flex-col items-center py-4 h-auto"
          >
            <Download className="h-5 w-5 mb-1" />
            <span className="text-xs">Save</span>
          </Button>
          
          <Button
            onClick={() => setShowQRDialog(true)}
            variant="outline"
            className="flex flex-col items-center py-4 h-auto"
          >
            <RefreshCw className="h-5 w-5 mb-1" />
            <span className="text-xs">QR Code</span>
          </Button>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
          <p className="text-blue-700 dark:text-blue-300 text-sm font-medium mb-2">
            📱 Switch Devices?
          </p>
          <p className="text-blue-600 dark:text-blue-400 text-xs">
            Use your backup file or QR code to restore your account on any device!
          </p>
        </div>

        <div className="text-center pt-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Created: {new Date(activeAccount.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

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
              This QR code contains your complete account data
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Account</DialogTitle>
            <DialogDescription>
              Import an account backup file or paste account data
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="import-data">Account Data</Label>
              <textarea
                id="import-data"
                className="w-full h-32 p-3 border rounded-md resize-none text-sm"
                placeholder="Paste your account backup JSON data here..."
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
              />
            </div>
            
            <div className="text-center">
              <Label className="text-sm text-gray-600 dark:text-gray-400">Or upload a backup file:</Label>
              <div className="mt-2">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
            
            <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
              Note: Importing will go through the account manager for proper slot assignment
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </ModernCard>
  );
};

export default SimpleIdSystem;
