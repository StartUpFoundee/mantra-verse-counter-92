
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import AccountManager from "./AccountManager";
import ModernCard from "./ModernCard";
import { getActiveAccount, type UserAccount } from "@/utils/accountStorage";

const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    checkForActiveAccount();
  }, []);

  const checkForActiveAccount = async () => {
    try {
      const activeAccount = await getActiveAccount();
      if (activeAccount) {
        // User has an active account, redirect to home
        navigate('/');
        return;
      }
    } catch (error) {
      console.error("Failed to check active account:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountSelected = (account: UserAccount) => {
    toast("Welcome Back!", {
      description: `Logged in as ${account.name}`,
    });
    
    // Redirect to home page
    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  const handleContinueAsGuest = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800 flex items-center justify-center">
        <ModernCard className="w-full max-w-md mx-auto p-8 text-center">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-amber-400 text-lg mb-6">Loading your spiritual journey...</div>
            <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </ModernCard>
      </div>
    );
  }

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
        </div>
        
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
            Your accounts are stored securely on your device using advanced encryption. <br/>
            <button 
              className="text-amber-500 dark:text-amber-400 hover:underline"
              onClick={() => navigate('/identity-guide')}
            >
              Learn more about our security features
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
