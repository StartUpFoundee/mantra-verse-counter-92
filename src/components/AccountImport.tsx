
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { Upload, Download } from "lucide-react";
import { importAccountFromID, validateUserID } from "@/utils/spiritualIdUtils";
import ModernCard from "./ModernCard";

interface AccountImportProps {
  onImportSuccess: () => void;
}

const AccountImport: React.FC<AccountImportProps> = ({ onImportSuccess }) => {
  const [importId, setImportId] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async () => {
    if (!importId.trim()) {
      toast("Missing ID", {
        description: "Please enter your spiritual ID to import account"
      });
      return;
    }

    if (!validateUserID(importId.trim())) {
      toast("Invalid ID", {
        description: "Please enter a valid spiritual ID"
      });
      return;
    }

    setIsImporting(true);
    
    try {
      const success = await importAccountFromID(importId.trim());
      
      if (success) {
        toast("Account Imported Successfully!", {
          description: "Your chanting progress and data have been restored"
        });
        onImportSuccess();
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
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (data.id) {
          setImportId(data.id);
          toast("File Loaded", {
            description: "ID extracted from file. Click Import to restore your account."
          });
        } else {
          toast("Invalid File", {
            description: "This file doesn't contain a valid spiritual ID"
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

  return (
    <ModernCard className="p-6 border-blue-200/50 dark:border-blue-700/50" gradient>
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-medium text-blue-600 dark:text-blue-400">
            Import Account
          </h3>
        </div>
        
        <div className="space-y-3">
          <div>
            <Label htmlFor="import-id" className="text-gray-700 dark:text-gray-300 font-medium">
              Paste Your Spiritual ID
            </Label>
            <Input
              id="import-id"
              placeholder="SE_... or your spiritual ID"
              value={importId}
              onChange={(e) => setImportId(e.target.value)}
              className="bg-white/80 dark:bg-zinc-900/80 border-gray-300/50 dark:border-zinc-600/50 backdrop-blur-sm"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleImport}
              disabled={isImporting || !importId.trim()}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex-1"
            >
              {isImporting ? "Importing..." : "Import Account"}
            </Button>
            
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button
                variant="outline"
                className="bg-white/60 dark:bg-zinc-800/60 border-gray-300 dark:border-zinc-600"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Import your account to restore all chanting progress and data
        </p>
      </div>
    </ModernCard>
  );
};

export default AccountImport;
