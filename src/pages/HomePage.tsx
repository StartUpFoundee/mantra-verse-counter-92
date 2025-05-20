
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Hand, Infinity, Clock, UserRound } from "lucide-react";
import { extractNameFromId } from "@/utils/spiritualIdUtils";
import { spiritualIcons } from "@/utils/spiritualIdUtils";
import ThemeToggle from "@/components/ThemeToggle";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [lifetimeCount, setLifetimeCount] = useState<number>(0);
  const [todayCount, setTodayCount] = useState<number>(0);
  const [spiritualId, setSpiritualId] = useState<string>("");
  const [spiritualName, setSpiritualName] = useState<string>("");
  const [spiritualIcon, setSpiritualIcon] = useState<string>("om");

  useEffect(() => {
    // Load saved counts from localStorage on component mount
    const savedLifetimeCount = localStorage.getItem('lifetimeCount');
    const savedTodayCount = localStorage.getItem('todayCount');
    const savedLastDate = localStorage.getItem('lastCountDate');
    const savedId = localStorage.getItem('spiritualID');
    const savedName = localStorage.getItem('spiritualName');
    const savedIcon = localStorage.getItem('spiritualIcon');
    
    if (savedLifetimeCount) {
      setLifetimeCount(parseInt(savedLifetimeCount, 10));
    }
    
    const today = new Date().toDateString();
    if (savedTodayCount && savedLastDate === today) {
      setTodayCount(parseInt(savedTodayCount, 10));
    } else {
      // Reset today's count if it's a new day
      localStorage.setItem('todayCount', '0');
      localStorage.setItem('lastCountDate', today);
    }

    if (savedId) {
      setSpiritualId(savedId);
      
      if (savedName) {
        setSpiritualName(savedName);
      } else {
        // Try to extract name from ID
        const extractedName = extractNameFromId(savedId);
        if (extractedName) {
          setSpiritualName(extractedName);
        }
      }
      
      if (savedIcon) {
        setSpiritualIcon(savedIcon);
      }
    }
  }, []);

  // Find the selected icon
  const selectedIconObj = spiritualIcons.find(icon => icon.id === spiritualIcon);
  const iconSymbol = selectedIconObj ? selectedIconObj.symbol : "🕉️";

  return (
    <div className="min-h-screen flex flex-col bg-black text-white dark:bg-zinc-900">
      <header className="py-6 text-center relative">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>
        <h1 className="text-3xl font-bold text-amber-400">Mantra Counter</h1>
        <p className="text-gray-300 mt-2">Count your spiritual practice with ease</p>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-12 gap-8">
        <div className="stats w-full max-w-md flex gap-4 mb-4">
          <div className="stat flex-1 bg-zinc-800/80 rounded-lg p-4 border border-zinc-700 text-center dark:bg-zinc-800 dark:border-zinc-700">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Infinity className="w-5 h-5 text-amber-400" />
              <h2 className="text-gray-300 font-medium">Lifetime Chants</h2>
            </div>
            <p className="text-3xl font-bold text-amber-400">{lifetimeCount}</p>
          </div>
          
          <div className="stat flex-1 bg-zinc-800/80 rounded-lg p-4 border border-zinc-700 text-center dark:bg-zinc-800 dark:border-zinc-700">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <h2 className="text-gray-300 font-medium">Today</h2>
            </div>
            <p className="text-3xl font-bold text-amber-400">{todayCount}</p>
          </div>
        </div>
        
        <button
          onClick={() => navigate('/spiritual-id')}
          className="w-full max-w-md bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 rounded-lg p-1 mb-4"
        >
          <div className="bg-zinc-900 rounded-lg p-4 flex items-center justify-between dark:bg-zinc-800">
            <div className="flex items-center gap-3">
              {spiritualId ? (
                <div className="w-10 h-10 flex items-center justify-center text-2xl bg-amber-500/20 rounded-full">
                  {iconSymbol}
                </div>
              ) : (
                <UserRound size={24} className="text-amber-400" />
              )}
              <div className="text-left">
                {spiritualId ? (
                  <>
                    <h3 className="text-amber-400 font-medium">
                      {spiritualName ? `${spiritualName} Ji` : 'My Spiritual ID'}
                    </h3>
                    <p className="text-gray-400 text-xs">{spiritualId}</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-amber-400 font-medium">Create Spiritual ID</h3>
                    <p className="text-gray-400 text-xs">आध्यात्मिक आईडी बनाएं</p>
                  </>
                )}
              </div>
            </div>
            <div className="text-amber-400 text-xl">→</div>
          </div>
        </button>
        
        <div className="w-full max-w-md bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-8 dark:bg-zinc-800/30">
          <p className="text-center text-gray-400 text-sm">Advertisement</p>
          <p className="text-center text-gray-500 text-xs">Place your ad here</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-xl">
          <button 
            onClick={() => navigate('/manual')}
            className="bg-gradient-to-br from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 rounded-xl p-1"
          >
            <div className="bg-zinc-900 rounded-lg p-6 h-full dark:bg-zinc-800">
              <div className="flex justify-center mb-4">
                <Hand size={64} className="text-amber-400" />
              </div>
              <h2 className="text-xl font-semibold text-amber-400 mb-2 text-center">Manual</h2>
              <p className="text-gray-300 text-sm mb-1">Press by hand or press the earphone button or press volume up/down button</p>
              <p className="text-gray-400 text-xs italic">हाथ से दबाएं या ईयरफोन बटन या वॉल्यूम अप डाउन बटन दबाएं</p>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/audio')}
            className="bg-gradient-to-br from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 rounded-xl p-1"
          >
            <div className="bg-zinc-900 rounded-lg p-6 h-full dark:bg-zinc-800">
              <div className="flex justify-center mb-4">
                <Mic size={64} className="text-amber-400" />
              </div>
              <h2 className="text-xl font-semibold text-amber-400 mb-2 text-center">By Audio</h2>
              <p className="text-gray-300 text-sm mb-1">Chant mantra and take 1sec gap, counter will increase</p>
              <p className="text-gray-400 text-xs italic">मंत्र का जाप करें और 1 सेकंड का अंतराल रखें, काउंटर बढ़ेगा</p>
            </div>
          </button>
        </div>
      </main>
      
      <footer className="py-4 text-center text-gray-400 text-sm">
        <p>Created with love for spiritual practice</p>
      </footer>
    </div>
  );
};

export default HomePage;
