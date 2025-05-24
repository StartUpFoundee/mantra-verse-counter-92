
import React from "react";
import { useNavigate } from "react-router-dom";
import ManualCounter from "@/components/ManualCounter";
import { ArrowLeft, Home, Sparkles } from "lucide-react";

const ManualCountPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800">
      {/* Header */}
      <header className="relative px-4 py-6">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm border border-gray-200/50 dark:border-zinc-700/50 hover:scale-105 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Manual Counter
            </h1>
          </div>
          
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm border border-gray-200/50 dark:border-zinc-700/50 hover:scale-105 transition-transform"
          >
            <Home className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </header>
      
      <main className="flex-1 px-4 pb-8">
        <div className="max-w-md mx-auto">
          <ManualCounter />
        </div>
      </main>
    </div>
  );
};

export default ManualCountPage;
