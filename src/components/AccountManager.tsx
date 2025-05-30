import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { User, UserPlus, Copy, Download, Upload, AlertTriangle } from "lucide-react";
import { 
  getAccountSlots, 
  saveAccountToSlot, 
  setActiveAccountSlot, 
  getActiveAccount,
  replaceAccountInSlot,
  generateUserId,
  hashPassword,
  generateSalt,
  verifyAccountPassword,
  type AccountSlot,
  type UserAccount 
} from "@/utils/accountStorage";

interface AccountManagerProps {
  onAccountSelected: (account: UserAccount) => void;
}

const AccountManager: React.FC<AccountManagerProps> = ({ onAccountSelected }) => {
  const [slots, setSlots] = useState<AccountSlot[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [replacementAccount, setReplacementAccount] = useState<UserAccount | null>(null);
  
  // Form states
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [step, setStep] = useState(1); // 1: Name/DOB, 2: Password
  const [importing, setImporting] = useState(false);
  const [importData, setImportData] = useState("");

  useEffect(() => {
    loadAccountSlots();
  }, []);

  const loadAccountSlots = async () => {
    try {
      const accountSlots = await getAccountSlots();
      setSlots(accountSlots);
    } catch (error) {
      console.error("Failed to load account slots:", error);
      toast("Error loading accounts", {
        description: "Could not load account data"
      });
    }
  };

  const handleCreateAccount = async () => {
    if (step === 1) {
      if (!name.trim() || !dob) {
        toast("Missing Information", {
          description: "Please enter your name and date of birth"
        });
        return;
      }
      setStep(2);
      return;
    }

    if (!password || password !== confirmPassword) {
      toast("Password Error", {
        description: "Passwords don't match or are empty"
      });
      return;
    }

    if (password.length < 6) {
      toast("Password Too Short", {
        description: "Password must be at least 6 characters"
      });
      return;
    }

    try {
      const userId = generateUserId(name.trim(), dob);
      const salt = generateSalt();
      const hashedPassword = await hashPassword(password, salt);

      const newAccount: UserAccount = {
        id: userId,
        name: name.trim(),
        dob,
        hashedPassword,
        salt,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        slotId: 0, // Will be set by saveAccountToSlot
        userData: {
          lifetimeCount: 0,
          todayCount: 0,
          lastCountDate: new Date().toDateString()
        }
      };

      const slotId = await saveAccountToSlot(newAccount);
      await setActiveAccountSlot(slotId);
      
      toast("Account Created!", {
        description: `Welcome ${name}! Your account is ready.`,
        icon: <User className="h-4 w-4 text-green-500" />
      });

      setShowCreateDialog(false);
      resetCreateForm();
      loadAccountSlots();
      
      // Set the account as active and notify parent
      const activeAccount = await getActiveAccount();
      if (activeAccount) {
        onAccountSelected(activeAccount);
      }

    } catch (error: any) {
      if (error.message.includes('No available account slots')) {
        toast("Device Full", {
          description: "Maximum 3 accounts per device. Remove an account first."
        });
      } else {
        toast("Creation Failed", {
          description: "Could not create account. Please try again."
        });
      }
    }
  };

  const handleSlotClick = async (slot: AccountSlot) => {
    if (!slot.userId) {
      // Empty slot - create new account
      setSelectedSlot(slot.slotId);
      setShowCreateDialog(true);
      return;
    }

    // Existing account - require password
    setSelectedSlot(slot.slotId);
    setShowPasswordDialog(true);
  };

  const handleAccountLogin = async () => {
    if (!selectedSlot || !loginPassword) {
      toast("Missing Information", {
        description: "Please enter your password"
      });
      return;
    }

    try {
      const account = await getAccountBySlot(selectedSlot);
      if (!account) {
        toast("Account Not Found", {
          description: "Could not find account data"
        });
        return;
      }

      const isValid = await verifyAccountPassword(account, loginPassword);
      if (!isValid) {
        toast("Invalid Password", {
          description: "Please check your password and try again"
        });
        return;
      }

      await setActiveAccountSlot(selectedSlot);
      
      toast("Welcome Back!", {
        description: `Logged in as ${account.name}`,
        icon: <User className="h-4 w-4 text-green-500" />
      });

      setShowPasswordDialog(false);
      setLoginPassword("");
      loadAccountSlots();
      onAccountSelected(account);

    } catch (error) {
      toast("Login Failed", {
        description: "Could not log in. Please try again."
      });
    }
  };

  const handleAccountImport = async () => {
    if (!importData.trim()) {
      toast("Missing Data", {
        description: "Please paste your account data"
      });
      return;
    }

    try {
      const accountData = JSON.parse(importData.trim());
      
      // Validate account data structure
      if (!accountData.id || !accountData.name || !accountData.hashedPassword) {
        throw new Error("Invalid account data format");
      }

      // Check if we have available slots
      const availableSlot = slots.find(slot => !slot.userId);
      
      if (!availableSlot) {
        // Device is full - show replacement dialog
        setReplacementAccount(accountData);
        setShowReplaceDialog(true);
        return;
      }

      // Import to available slot
      await saveAccountToSlot(accountData);
      await setActiveAccountSlot(availableSlot.slotId);
      
      toast("Account Imported!", {
        description: `Successfully imported ${accountData.name}'s account`,
        icon: <Upload className="h-4 w-4 text-green-500" />
      });

      setImporting(false);
      setImportData("");
      loadAccountSlots();

      const activeAccount = await getActiveAccount();
      if (activeAccount) {
        onAccountSelected(activeAccount);
      }

    } catch (error) {
      toast("Import Failed", {
        description: "Invalid account data. Please check the format."
      });
    }
  };

  const handleAccountReplacement = async (targetSlotId: number) => {
    if (!replacementAccount) return;

    try {
      await replaceAccountInSlot(replacementAccount, targetSlotId);
      await setActiveAccountSlot(targetSlotId);
      
      toast("Account Replaced!", {
        description: `Successfully replaced account in slot ${targetSlotId}`,
        icon: <Upload className="h-4 w-4 text-green-500" />
      });

      setShowReplaceDialog(false);
      setReplacementAccount(null);
      setImporting(false);
      setImportData("");
      loadAccountSlots();

      const activeAccount = await getActiveAccount();
      if (activeAccount) {
        onAccountSelected(activeAccount);
      }

    } catch (error) {
      toast("Replacement Failed", {
        description: "Could not replace account. Please try again."
      });
    }
  };

  const resetCreateForm = () => {
    setName("");
    setDob("");
    setPassword("");
    setConfirmPassword("");
    setStep(1);
  };

  const formatLastLogin = (lastLogin: string | null) => {
    if (!lastLogin) return "Never";
    const date = new Date(lastLogin);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-2">
          Account Manager
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Choose an account or create a new one (Maximum 3 accounts per device)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {slots.map((slot) => (
          <Card 
            key={slot.slotId}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              slot.isActive ? 'ring-2 ring-amber-500' : ''
            } ${
              slot.userId ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' 
                          : 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-dashed'
            }`}
            onClick={() => handleSlotClick(slot)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <span>Account Slot {slot.slotId}</span>
                {slot.isActive && <div className="w-3 h-3 bg-green-500 rounded-full"></div>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {slot.userId ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-amber-600" />
                    <span className="font-medium">{slot.name}</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>ID: {slot.userId?.substring(0, 20)}...</p>
                    <p>Last Login: {formatLastLogin(slot.lastLogin)}</p>
                    <p>Created: {new Date(slot.createdAt || '').toLocaleDateString()}</p>
                  </div>
                  <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    Click to login
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-3">
                  <UserPlus className="h-12 w-12 text-gray-400 mx-auto" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Create New Account</p>
                  <p className="text-xs text-gray-400">Click to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center space-x-4 pt-6">
        <Button
          onClick={() => setImporting(true)}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <Upload className="h-4 w-4" />
          <span>Import Account</span>
        </Button>
      </div>

      {/* Create Account Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Account - Step {step}/2</DialogTitle>
            <DialogDescription>
              {step === 1 ? "Enter your personal information" : "Set up your password"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {step === 1 ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="create-name">Full Name</Label>
                  <Input
                    id="create-name"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-dob">Date of Birth</Label>
                  <Input
                    id="create-dob"
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="create-password">Password</Label>
                  <Input
                    id="create-password"
                    type="password"
                    placeholder="Enter password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </>
            )}
            
            <div className="flex justify-between pt-4">
              {step === 2 && (
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={handleCreateAccount}
                className="bg-amber-500 hover:bg-amber-600 text-white ml-auto"
              >
                {step === 1 ? "Next" : "Create Account"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Login Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Account Login</DialogTitle>
            <DialogDescription>
              Enter your password to access this account
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAccountLogin()}
              />
            </div>
            
            <Button
              onClick={handleAccountLogin}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Account Dialog */}
      <Dialog open={importing} onOpenChange={setImporting}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Account</DialogTitle>
            <DialogDescription>
              Paste your account backup data below
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
            
            <Button
              onClick={handleAccountImport}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              Import Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Replace Account Dialog */}
      <Dialog open={showReplaceDialog} onOpenChange={setShowReplaceDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <span>Device Limit Reached</span>
            </DialogTitle>
            <DialogDescription>
              Your device already has 3 accounts. Import will replace an existing account.
              <strong className="text-red-600"> This action cannot be undone.</strong>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Select which account to replace:
            </p>
            
            <div className="space-y-2">
              {slots.filter(slot => slot.userId).map((slot) => (
                <Button
                  key={slot.slotId}
                  onClick={() => handleAccountReplacement(slot.slotId)}
                  variant="outline"
                  className="w-full justify-start text-left"
                >
                  <div>
                    <p className="font-medium">Slot {slot.slotId}: {slot.name}</p>
                    <p className="text-xs text-gray-500">Last login: {formatLastLogin(slot.lastLogin)}</p>
                  </div>
                </Button>
              ))}
            </div>
            
            <Button
              onClick={() => setShowReplaceDialog(false)}
              variant="ghost"
              className="w-full"
            >
              Cancel Import
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountManager;
