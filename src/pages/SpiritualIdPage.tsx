
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import AccountManager from "@/components/AccountManager";
import AccountProfile from "@/components/AccountProfile";
import { getActiveAccount, type UserAccount } from "@/utils/accountStorage";

const SpiritualIdPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeAccount, setActiveAccount] = useState<UserAccount | null>(null);
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

  const handleAccountSelected = (account: UserAccount) => {
    setActiveAccount(account);
  };

  const handleLogout = () => {
    setActiveAccount(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-600 dark:text-amber-400">Loading accounts...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800">
      <header className="py-4 lg:py-6 px-4 lg:px-8 flex justify-between items-center">
        <Button 
          variant="ghost" 
          size="icon"
          className="text-amber-600 dark:text-amber-400 hover:bg-white/50 dark:hover:bg-zinc-800/50 w-10 h-10 lg:w-12 lg:h-12"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-5 w-5 lg:h-6 lg:w-6" />
        </Button>
        <h1 className="text-xl lg:text-2xl font-bold text-amber-600 dark:text-amber-400">
          {activeAccount ? 'Account Profile' : 'Account Manager'}
        </h1>
        <Button 
          variant="ghost" 
          size="icon"
          className="text-amber-600 dark:text-amber-400 hover:bg-white/50 dark:hover:bg-zinc-800/50 w-10 h-10 lg:w-12 lg:h-12"
          onClick={() => navigate('/')}
        >
          <Home className="h-5 w-5 lg:h-6 lg:w-6" />
        </Button>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center px-4 lg:px-8 pb-12">
        {activeAccount ? (
          <AccountProfile 
            account={activeAccount} 
            onLogout={handleLogout}
          />
        ) : (
          <AccountManager 
            onAccountSelected={handleAccountSelected}
          />
        )}
      </main>
    </div>
  );
};

export default SpiritualIdPage;
