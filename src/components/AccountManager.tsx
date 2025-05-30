import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { User, UserPlus, Copy, Download, Upload, AlertTriangle, Plus, Shield, Sparkles } from "lucide-react";
import { 
  getAccountSlots, 
  saveAccountToSlot, 
  setActiveAccountSlot, 
  getActiveAccount,
  getAccountBySlot,
  replaceAccountInSlot,
  generateUserId,
  hashPassword,
  generateSalt,
  verifyAccountPassword,
  type AccountSlot,
  type UserAccount 
} from "@/utils/accountStorage";
import { useNavigate } from "react-router-dom";

interface AccountManagerProps {
  onAccountSelected: (account: UserAccount) => void;
}

const AccountManager: React.FC<AccountManagerProps> = ({ onAccountSelected }) => {
  const navigate = useNavigate();
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
      console.log("AccountManager: Creating account for", name.trim());
      
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
        slotId: selectedSlot || 0,
        userData: {
          lifetimeCount: 0,
          todayCount: 0,
          lastCountDate: new Date().toDateString()
        }
      };

      let slotId;
      if (selectedSlot) {
        newAccount.slotId = selectedSlot;
        await saveAccountToSlot(newAccount);
        slotId = selectedSlot;
      } else {
        slotId = await saveAccountToSlot(newAccount);
      }
      
      await setActiveAccountSlot(slotId);
      
      console.log("AccountManager: Account created successfully, slot:", slotId);
      
      toast("Account Created!", {
        description: `Welcome ${name}! Your account is ready.`,
        icon: <User className="h-4 w-4 text-green-500" />
      });

      setShowCreateDialog(false);
      resetCreateForm();
      loadAccountSlots();
      
      // Get the created account and notify parent component
      const activeAccount = await getActiveAccount();
      if (activeAccount) {
        console.log("AccountManager: Notifying parent of account selection:", activeAccount.name);
        onAccountSelected(activeAccount);
      }

    } catch (error: any) {
      console.error("AccountManager: Account creation failed:", error);
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
      console.log("AccountManager: Attempting login for slot", selectedSlot);
      
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
      
      console.log("AccountManager: Login successful for", account.name);
      
      toast("Welcome Back!", {
        description: `Logged in as ${account.name}`,
        icon: <User className="h-4 w-4 text-green-500" />
      });

      setShowPasswordDialog(false);
      setLoginPassword("");
      loadAccountSlots();
      
      // Notify parent component immediately
      onAccountSelected(account);

    } catch (error) {
      console.error("AccountManager: Login failed:", error);
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

      console.log("AccountManager: Importing account for", accountData.name);

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
        console.log("AccountManager: Imported account, notifying parent:", activeAccount.name);
        onAccountSelected(activeAccount);
      }

    } catch (error) {
      console.error("AccountManager: Import failed:", error);
      toast("Import Failed", {
        description: "Invalid account data. Please check the format."
      });
    }
  };

  const handleAccountReplacement = async (targetSlotId: number) => {
    if (!replacementAccount) return;

    try {
      console.log("AccountManager: Replacing account in slot", targetSlotId, "with", replacementAccount.name);
      
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
        console.log("AccountManager: Replaced account, notifying parent:", activeAccount.name);
        onAccountSelected(activeAccount);
      }

    } catch (error) {
      console.error("AccountManager: Replacement failed:", error);
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

  const activeAccount = slots.find(slot => slot.isActive);
  const emptySlots = slots.filter(slot => !slot.userId);

  return (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-2">
          Account Manager
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your spiritual accounts (Maximum 3 per device)
        </p>
      </div>

      {/* Active Account Display */}
      {activeAccount && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-green-700 dark:text-green-400">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              Currently Active Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {activeAccount.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-lg">{activeAccount.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Account {activeAccount.slotId}</p>
                  <p className="text-xs text-gray-500">Last login: {formatLastLogin(activeAccount.lastLogin)}</p>
                </div>
              </div>
              <div className="text-right">
                <Button
                  onClick={() => navigate('/spiritual-id')}
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  <User className="h-4 w-4 mr-2" />
                  Manage Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {slots.filter(slot => slot.userId).map((slot) => (
          <Card 
            key={slot.slotId}
            className={`cursor-pointer transition-all hover:shadow-lg transform hover:scale-105 ${
              slot.isActive 
                ? 'ring-2 ring-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20' 
                : 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/30 dark:hover:to-indigo-800/30'
            }`}
            onClick={() => !slot.isActive && handleSlotClick(slot)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${slot.isActive ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                  Account {slot.slotId}
                </span>
                {slot.isActive && <Shield className="h-5 w-5 text-green-500" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                    slot.isActive ? 'bg-green-500' : 'bg-blue-500'
                  }`}>
                    {slot.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{slot.name}</p>
                    <p className="text-xs text-gray-500">ID: {slot.userId?.substring(0, 12)}...</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>Created: {new Date(slot.createdAt || '').toLocaleDateString()}</p>
                  <p>Last Login: {formatLastLogin(slot.lastLogin)}</p>
                </div>
                {!slot.isActive && (
                  <div className="text-center pt-2">
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      Click to login
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Create Account Buttons */}
        {emptySlots.map((slot) => (
          <Card
            key={slot.slotId}
            className="cursor-pointer transition-all hover:shadow-xl transform hover:scale-105 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-gradient-to-br hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-900/20 dark:hover:to-orange-900/20"
            onClick={() => handleSlotClick(slot)}
          >
            <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
                <Plus className="h-8 w-8" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Create Account {slot.slotId}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Add a new spiritual identity
                </p>
              </div>
              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-medium">Click to begin</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Import Button */}
      <div className="flex justify-center pt-6">
        <Button
          onClick={() => setImporting(true)}
          variant="outline"
          className="flex items-center space-x-2 border-blue-300 text-blue-700 hover:bg-blue-50"
        >
          <Upload className="h-4 w-4" />
          <span>Import Existing Account</span>
        </Button>
      </div>

      {/* Create Account Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Account {selectedSlot} - Step {step}/2</DialogTitle>
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
                    <p className="font-medium">Account {slot.slotId}: {slot.name}</p>
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
