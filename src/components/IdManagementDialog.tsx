
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { Copy, RefreshCw, Upload } from "lucide-react";
import { getUserData, regenerateUserID, importAccountFromID } from "@/utils/spiritualIdUtils";

interface IdManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const IdManagementDialog: React.FC<IdManagementDialogProps> = ({ open, onOpenChange }) => {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [importId, setImportId] = useState("");
  const [currentTab, setCurrentTab] = useState<"view" | "import">("view");
  const userData = getUserData();

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

  const handleRegenerateId = async () => {
    setIsRegenerating(true);
    try {
      await regenerateUserID();
      toast("ID Updated", {
        description: "Your spiritual ID has been updated with latest data"
      });
      
      // Refresh the page to show updated ID
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast("Update Failed", {
        description: "Could not update your spiritual ID"
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleImport = async () => {
    if (!importId.trim()) {
      toast("Missing ID", {
        description: "Please enter your spiritual ID to import account"
      });
      return;
    }

    try {
      const success = await importAccountFromID(importId.trim());
      
      if (success) {
        toast("Account Imported Successfully!", {
          description: "Your chanting progress and data have been restored"
        });
        onOpenChange(false);
        
        // Refresh the page to show imported data
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast("Import Failed", {
          description: "Could not import account. Please check your ID and try again."
        });
      }
    } catch (error) {
      console.error("Import error:", error);
      toast("Import Error", {
        description: "An error occurred while importing your account"
      });
    }
  };

  if (!userData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Spiritual ID Management</DialogTitle>
          <DialogDescription>
            Manage your spiritual identity and data
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button
              variant={currentTab === "view" ? "default" : "outline"}
              onClick={() => setCurrentTab("view")}
              size="sm"
              className="flex-1"
            >
              View ID
            </Button>
            <Button
              variant={currentTab === "import" ? "default" : "outline"}
              onClick={() => setCurrentTab("import")}
              size="sm"
              className="flex-1"
            >
              Import Account
            </Button>
          </div>
          
          {currentTab === "view" && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Your Spiritual ID</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={userData.id}
                    readOnly
                    className="bg-gray-50 dark:bg-gray-800 text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyId}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <Button
                onClick={handleRegenerateId}
                disabled={isRegenerating}
                className="w-full"
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
                {isRegenerating ? 'Updating...' : 'Update ID with Latest Data'}
              </Button>
              
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Updating your ID will embed all your current chanting progress and data into a new portable ID.
              </p>
            </div>
          )}
          
          {currentTab === "import" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="import-id" className="text-sm font-medium">
                  Import Account from ID
                </Label>
                <Input
                  id="import-id"
                  placeholder="Paste your spiritual ID here..."
                  value={importId}
                  onChange={(e) => setImportId(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <Button
                onClick={handleImport}
                className="w-full"
                disabled={!importId.trim()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import Account
              </Button>
              
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Importing will restore all chanting progress and data from the provided ID.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IdManagementDialog;
