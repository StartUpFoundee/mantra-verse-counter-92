
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Hand, Infinity, Clock, Sparkles, Calendar } from "lucide-react";
import { isUserLoggedIn, getUserData } from "@/utils/spiritualIdUtils";
import ThemeToggle from "@/components/ThemeToggle";
import WelcomeScreen from "@/components/WelcomeScreen";
import ProfileHeader from "@/components/ProfileHeader";
import WelcomePopup from "@/components/WelcomePopup";
import ActiveDaysButton from "@/components/ActiveDaysButton";
import { getLifetimeCount, getTodayCount } from "@/utils/indexedDBUtils";
import { toast } from "@/components/ui/sonner";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [lifetimeCount, setLifetimeCount] = useState<number>(0);
  const [todayCount, setTodayCount] = useState<number>(0);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMigrating, setIsMigrating] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Check if user is logged in
        const loggedIn = isUserLoggedIn();
        setIsLoggedIn(loggedIn);
        
        // If logged in, load counts from IndexedDB
        if (loggedIn) {
          const lifetime = await getLifetimeCount();
          const today = await getTodayCount();
          
          setLifetimeCount(lifetime);
          setTodayCount(today);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("There was an error loading your data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // If user is not logged in, show the welcome screen
  if (!isLoggedIn) {
    if (isLoading || isMigrating) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800">
          <div className="mb-6 text-amber-600 dark:text-amber-400 text-xl font-medium">
            {isMigrating ? "Upgrading your spiritual journey..." : "Loading..."}
          </div>
          <div className="relative">
            <div className="w-16 h-16 border-4 border-amber-200 dark:border-amber-800 rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-amber-500 rounded-full animate-spin"></div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800">
        <header className="py-6 text-center relative">
          <div className="absolute right-4 top-4">
            <ThemeToggle />
          </div>
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Mantra Verse
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Count your spiritual practice with ease</p>
        </header>
        
        <main className="flex-1 flex flex-col items-center justify-center px-4 pb-12">
          <WelcomeScreen />
        </main>
        
        <footer className="py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>Created with 🧡 for spiritual practice</p>
        </footer>
      </div>
    );
  }

  // Get user data
  const userData = getUserData();

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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800">
      <WelcomePopup />
      
      {/* Header */}
      <header className="relative px-4 pt-6 pb-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Mantra Verse
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {userData ? `Namaste, ${userData.name} Ji` : 'Spiritual Practice'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <ProfileHeader />
          </div>
        </div>
      </header>
      
      <main className="px-4 pb-24">
        <div className="max-w-md mx-auto space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-2xl p-5 border border-amber-200/50 dark:border-zinc-700/50 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                  <Infinity className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Lifetime</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{lifetimeCount.toLocaleString()}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Jaaps</p>
            </div>
            
            <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-2xl p-5 border border-amber-200/50 dark:border-zinc-700/50 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Today</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayCount.toLocaleString()}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Daily Count</p>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white px-1">Choose Your Practice</h2>
            
            {/* Manual Counter Card */}
            <div 
              onClick={() => navigate('/manual')}
              className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-2xl p-6 border border-amber-200/50 dark:border-zinc-700/50 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group hover:scale-[1.02]"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Hand className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Manual Counter</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    Tap screen, earphone or volume buttons
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                    हाथ से दबाएं या ईयरफोन/वॉल्यूम बटन का उपयोग करें
                  </p>
                </div>
              </div>
            </div>
            
            {/* Audio Counter Card */}
            <div 
              onClick={() => navigate('/audio')}
              className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-2xl p-6 border border-amber-200/50 dark:border-zinc-700/50 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group hover:scale-[1.02]"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Mic className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Audio Counter</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    Chant with 1 second pauses for auto-count
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                    मंत्र जाप करें, 1 सेकंड रुकें, काउंटर बढ़ेगा
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Active Days Card */}
          <div 
            onClick={() => navigate('/active-days')}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.02]"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">Track Your Journey</h3>
                <p className="text-sm text-emerald-100">View your practice streaks and active days</p>
              </div>
              <div className="text-2xl">🔥</div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-t border-amber-200/50 dark:border-zinc-700/50 py-4">
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
          Created with 🧡 for spiritual practice
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
