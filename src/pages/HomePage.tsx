
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Hand, Infinity, Clock, Sparkles, Calendar } from "lucide-react";
import { getActiveAccount, clearActiveAccount, type UserAccount } from "@/utils/accountStorage";
import ThemeToggle from "@/components/ThemeToggle";
import ProfileHeader from "@/components/ProfileHeader";
import WelcomePopup from "@/components/WelcomePopup";
import { getLifetimeCount, getTodayCount } from "@/utils/indexedDBUtils";
import { toast } from "@/components/ui/sonner";
import ModernCard from "@/components/ModernCard";
import StatsCard from "@/components/StatsCard";
import ActionCard from "@/components/ActionCard";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [lifetimeCount, setLifetimeCount] = useState<number>(0);
  const [todayCount, setTodayCount] = useState<number>(0);
  const [activeAccount, setActiveAccount] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        console.log("HomePage: Starting data load...");
        setIsLoading(true);
        setError(null);
        
        // Enhanced account checking with timeout protection
        const accountPromise = getActiveAccount();
        const timeoutPromise = new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error('Account check timeout')), 5000)
        );
        
        let account: UserAccount | null = null;
        
        try {
          account = await Promise.race([accountPromise, timeoutPromise]);
        } catch (timeoutError) {
          console.warn("HomePage: Account check timed out, redirecting to welcome");
          if (isMounted) {
            navigate('/welcome');
            return;
          }
        }
        
        if (!isMounted) return;
        
        console.log("HomePage: Account check result:", account?.name || "None");
        
        if (!account) {
          console.log("HomePage: No active account, redirecting to welcome");
          navigate('/welcome');
          return;
        }
        
        setActiveAccount(account);
        
        // Load count data with fallbacks and timeout protection
        try {
          const countPromise = Promise.all([
            getLifetimeCount().catch(() => 0),
            getTodayCount().catch(() => 0)
          ]);
          
          const countTimeout = new Promise<[number, number]>((_, reject) => 
            setTimeout(() => reject(new Error('Count data timeout')), 3000)
          );
          
          const [lifetime, today] = await Promise.race([countPromise, countTimeout]);
          
          if (isMounted) {
            setLifetimeCount(lifetime);
            setTodayCount(today);
          }
        } catch (dataError) {
          console.warn("HomePage: Error loading count data:", dataError);
          if (isMounted) {
            setLifetimeCount(0);
            setTodayCount(0);
          }
        }
        
      } catch (error) {
        console.error("HomePage: Critical error:", error);
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'Unknown error');
          // Don't stay stuck on error, redirect to welcome
          setTimeout(() => {
            if (isMounted) {
              navigate('/welcome');
            }
          }, 2000);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadData();
    
    // Listen for logout events
    const handleLogout = () => {
      console.log("HomePage: Logout event received, redirecting to spiritual-id");
      setActiveAccount(null);
      navigate('/spiritual-id');
    };
    
    window.addEventListener('user-logout', handleLogout);
    
    return () => {
      isMounted = false;
      window.removeEventListener('user-logout', handleLogout);
    };
  }, [navigate]);

  // Error state - simplified to prevent white screen
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 via-red-50 to-red-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center mx-4">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Loading Error</h1>
          <p className="text-gray-600 mb-4 text-sm">{error}</p>
          <div className="space-y-2">
            <button 
              onClick={() => window.location.href = '/welcome'}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Go to Welcome
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state with timeout protection
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800">
        <div className="mb-6 text-amber-600 dark:text-amber-400 text-xl font-medium">
          Loading your spiritual journey...
        </div>
        <div className="relative">
          <div className="w-16 h-16 border-4 border-amber-200 dark:border-amber-800 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-amber-500 rounded-full animate-spin"></div>
        </div>
        <div className="mt-4">
          <button 
            onClick={() => navigate('/welcome')}
            className="text-amber-600 dark:text-amber-400 hover:underline text-sm"
          >
            Having trouble? Go to Welcome
          </button>
        </div>
      </div>
    );
  }

  // Fallback if no active account
  if (!activeAccount) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="text-center">
          <div className="text-amber-600 text-lg mb-4">Redirecting to welcome...</div>
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <button 
            onClick={() => navigate('/welcome')}
            className="mt-4 text-amber-600 hover:underline text-sm"
          >
            Click here if not redirected
          </button>
        </div>
      </div>
    );
  }

  // Main app content
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800">
      <WelcomePopup />
      
      {/* Header */}
      <header className="relative px-4 lg:px-8 pt-6 lg:pt-8 pb-4 lg:pb-6">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Mantra Verse
              </h1>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300">
                Namaste, {activeAccount.name} Ji
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-3">
            <ThemeToggle />
            <ProfileHeader />
          </div>
        </div>
      </header>
      
      <main className="px-4 lg:px-8 pb-24 lg:pb-32">
        <div className="max-w-6xl mx-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <StatsCard
              title="Lifetime"
              value={lifetimeCount}
              subtitle="Total Jaaps"
              icon={Infinity}
              gradient="bg-gradient-to-br from-purple-400 to-purple-600"
            />
            
            <StatsCard
              title="Today"
              value={todayCount}
              subtitle="Daily Count"
              icon={Clock}
              gradient="bg-gradient-to-br from-emerald-400 to-emerald-600"
            />
            
            <div className="hidden lg:block">
              <StatsCard
                title="This Week"
                value={Math.floor(lifetimeCount * 0.1)}
                subtitle="Weekly Progress"
                icon={Calendar}
                gradient="bg-gradient-to-br from-blue-400 to-blue-600"
              />
            </div>
            
            <div className="hidden lg:block">
              <StatsCard
                title="Average"
                value={Math.floor(lifetimeCount / 30)}
                subtitle="Per Day"
                icon={Sparkles}
                gradient="bg-gradient-to-br from-pink-400 to-pink-600"
              />
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="space-y-4 lg:space-y-6">
            <h2 className="text-lg lg:text-xl xl:text-2xl font-semibold text-gray-900 dark:text-white px-1">Choose Your Practice</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <ActionCard
                title="Manual Counter"
                description="Tap screen, earphone or volume buttons"
                hindiDescription="हाथ से दबाएं या ईयरफोन/वॉल्यूम बटन का उपयोग करें"
                icon={Hand}
                gradient="bg-gradient-to-br from-amber-400 to-orange-500"
                onClick={() => navigate('/manual')}
              />
              
              <ActionCard
                title="Audio Counter"
                description="Chant with 1 second pauses for auto-count"
                hindiDescription="मंत्र जाप करें, 1 सेकंड रुकें, काउंटर बढ़ेगा"
                icon={Mic}
                gradient="bg-gradient-to-br from-blue-400 to-purple-500"
                onClick={() => navigate('/audio')}
              />
            </div>
          </div>

          <div className="mt-6 lg:mt-8">
            <ModernCard 
              onClick={() => navigate('/active-days')}
              className="p-6 lg:p-8 bg-gradient-to-r from-emerald-500 to-teal-600 text-white cursor-pointer hover:scale-[1.02] transition-all duration-300"
              glowEffect
            >
              <div className="flex items-center gap-4 lg:gap-6">
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Calendar className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg lg:text-xl xl:text-2xl font-semibold mb-1 lg:mb-2">Track Your Journey</h3>
                  <p className="text-sm lg:text-base text-emerald-100">View your practice streaks and active days</p>
                </div>
                <div className="text-2xl lg:text-3xl">🔥</div>
              </div>
            </ModernCard>
          </div>
        </div>
      </main>
      
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-t border-amber-200/50 dark:border-zinc-700/50 py-4 lg:py-6">
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm lg:text-base">
          Created with 🧡 for spiritual practice
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
