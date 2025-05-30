
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import AccountManager from "./AccountManager";
import ModernCard from "./ModernCard";
import { 
  getActiveAccount, 
  getAccountSlots, 
  getAccountBySlot,
  setActiveAccountSlot,
  verifyAccountPassword,
  type UserAccount,
  type AccountSlot 
} from "@/utils/accountStorage";
import { LogIn, User, Calendar, Shield } from "lucide-react";

const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<AccountSlot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountSlot | null>(null);
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  
  useEffect(() => {
    let isMounted = true;
    
    const checkForAccounts = async () => {
      try {
        console.log("WelcomeScreen: Checking for device accounts...");
        setLoading(true);
        setError(null);
        
        // Check for active account first with timeout protection
        try {
          const activeAccountPromise = getActiveAccount();
          const timeoutPromise = new Promise<null>((_, reject) => 
            setTimeout(() => reject(new Error('Active account check timeout')), 3000)
          );
          
          const activeAccount = await Promise.race([activeAccountPromise, timeoutPromise]);
          
          if (!isMounted) return;
          
          if (activeAccount) {
            console.log("WelcomeScreen: Found active account, redirecting:", activeAccount.name);
            navigate('/');
            return;
          }
        } catch (activeAccountError) {
          console.warn("WelcomeScreen: Active account check failed:", activeAccountError);
        }
        
        // Get all account slots with retry mechanism and timeout
        let slots: AccountSlot[] = [];
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries && isMounted) {
          try {
            const slotsPromise = getAccountSlots();
            const timeoutPromise = new Promise<AccountSlot[]>((_, reject) => 
              setTimeout(() => reject(new Error('Slots check timeout')), 2000)
            );
            
            slots = await Promise.race([slotsPromise, timeoutPromise]);
            break;
          } catch (slotsError) {
            console.warn(`WelcomeScreen: Slots check failed (attempt ${retryCount + 1}):`, slotsError);
            retryCount++;
            if (retryCount < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }
        
        if (!isMounted) return;
        
        const existingAccounts = slots.filter(slot => slot.userId && slot.name);
        console.log("WelcomeScreen: Found", existingAccounts.length, "accounts on device");
        
        setAccounts(existingAccounts);
        
      } catch (error) {
        console.error("WelcomeScreen: Failed to check accounts:", error);
        if (isMounted) {
          setError('Failed to load accounts. You can create new ones below.');
          setAccounts([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    checkForAccounts();
    
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleAccountSelected = (account: UserAccount) => {
    console.log("WelcomeScreen: Account selected, redirecting:", account.name);
    
    toast("Welcome Back!", {
      description: `Logged in as ${account.name}`,
    });
    
    navigate('/');
  };

  const handleContinueToAccount = (account: AccountSlot) => {
    console.log("WelcomeScreen: Continue to account clicked:", account.name);
    setSelectedAccount(account);
    setPassword("");
    setShowPasswordDialog(true);
  };

  const handlePasswordLogin = async () => {
    if (!selectedAccount || !password) {
      toast("Missing Information", {
        description: "Please enter your password"
      });
      return;
    }

    setLoggingIn(true);

    try {
      console.log("WelcomeScreen: Attempting login for:", selectedAccount.name);
      
      const fullAccount = await getAccountBySlot(selectedAccount.slotId);
      if (!fullAccount) {
        toast("Account Error", {
          description: "Could not load account data"
        });
        return;
      }

      const isValid = await verifyAccountPassword(fullAccount, password);
      if (!isValid) {
        toast("Invalid Password", {
          description: "Please check your password and try again"
        });
        return;
      }

      // Set as active account
      await setActiveAccountSlot(selectedAccount.slotId);
      
      console.log("WelcomeScreen: Login successful for", fullAccount.name);
      
      toast("Welcome Back!", {
        description: `Logged in as ${fullAccount.name}`,
        icon: <User className="h-4 w-4 text-green-500" />
      });

      setShowPasswordDialog(false);
      setPassword("");
      setSelectedAccount(null);
      
      // Navigate to home
      navigate('/');

    } catch (error) {
      console.error("WelcomeScreen: Login failed:", error);
      toast("Login Failed", {
        description: "Could not log in. Please try again."
      });
    } finally {
      setLoggingIn(false);
    }
  };

  const handleContinueAsGuest = () => {
    console.log("WelcomeScreen: User chose to continue as guest");
    navigate("/");
  };

  const formatLastLogin = (lastLogin: string | null) => {
    if (!lastLogin) return "Never";
    const date = new Date(lastLogin);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Error state with timeout protection
  if (error && !loading && accounts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-red-50 to-red-100 flex items-center justify-center p-4">
        <ModernCard className="w-full max-w-md mx-auto p-8 text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Loading Error</h1>
          <p className="text-gray-600 mb-4 text-sm">{error}</p>
          <div className="space-y-2">
            <Button onClick={() => window.location.reload()} className="w-full">
              Try Again
            </Button>
            <Button onClick={handleContinueAsGuest} variant="outline" className="w-full">
              Continue as Guest
            </Button>
          </div>
        </ModernCard>
      </div>
    );
  }

  // Loading state with timeout fallback
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800 flex items-center justify-center">
        <ModernCard className="w-full max-w-md mx-auto p-8 text-center">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-amber-400 text-lg mb-6">Loading your spiritual journey...</div>
            <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
            <div className="mt-4">
              <button 
                onClick={() => {
                  setLoading(false);
                  setError(null);
                }}
                className="text-amber-600 dark:text-amber-400 hover:underline text-sm"
              >
                Having trouble? Click here
              </button>
            </div>
          </div>
        </ModernCard>
      </div>
    );
  }

  // Main welcome screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-6xl lg:text-7xl mb-4">🕉️</div>
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
            Welcome to Mantra Verse
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg lg:text-xl mb-8">
            Your spiritual journey begins here
          </p>
          
          {accounts.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                📱 Found {accounts.length} account{accounts.length > 1 ? 's' : ''} on this device
              </p>
            </div>
          )}
        </div>
        
        {/* Display existing accounts with login buttons */}
        {accounts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-center mb-6 text-gray-800 dark:text-gray-200">
              Continue with Your Account
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {accounts.map((account) => (
                <ModernCard
                  key={account.slotId}
                  className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/30 dark:hover:to-indigo-800/30 transition-all duration-300"
                >
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {account.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{account.name}</h3>
                        <p className="text-sm text-gray-500">Account {account.slotId}</p>
                      </div>
                      <Shield className="h-5 w-5 text-blue-500" />
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Created: {new Date(account.createdAt || '').toLocaleDateString()}</span>
                      </div>
                      <p>Last Login: {formatLastLogin(account.lastLogin)}</p>
                    </div>
                    
                    <Button
                      onClick={() => handleContinueToAccount(account)}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Continue to this account
                    </Button>
                  </div>
                </ModernCard>
              ))}
            </div>
          </div>
        )}
        
        {/* Account Manager for creating new accounts */}
        <AccountManager onAccountSelected={handleAccountSelected} />
        
        <div className="text-center mt-8">
          <Button
            variant="ghost"
            onClick={handleContinueAsGuest}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-zinc-800/50"
          >
            Continue as Guest (Limited Features)
          </Button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-zinc-700/50">
          <p className="text-xs lg:text-sm text-center text-gray-500 dark:text-gray-400">
            Your accounts are stored securely on your device using 8-layer data persistence. <br/>
            <button 
              className="text-amber-500 dark:text-amber-400 hover:underline"
              onClick={() => navigate('/identity-guide')}
            >
              Learn more about our security features
            </button>
          </p>
        </div>
      </div>

      {/* Password Login Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={(open) => {
        setShowPasswordDialog(open);
        if (!open) {
          setSelectedAccount(null);
          setPassword("");
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Welcome Back!</DialogTitle>
            <DialogDescription>
              Enter your password to continue as {selectedAccount?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-2">
                {selectedAccount?.name?.charAt(0).toUpperCase()}
              </div>
              <p className="font-medium">{selectedAccount?.name}</p>
              <p className="text-sm text-gray-500">Account {selectedAccount?.slotId}</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !loggingIn && handlePasswordLogin()}
                autoFocus
              />
            </div>
            
            <Button
              onClick={handlePasswordLogin}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              disabled={loggingIn}
            >
              <LogIn className="h-4 w-4 mr-2" />
              {loggingIn ? "Logging in..." : "Continue"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WelcomeScreen;
