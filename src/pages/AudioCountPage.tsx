
import React from "react";
import { useNavigate } from "react-router-dom";
import MantraCounter from "@/components/MantraCounter";
import { ArrowLeft, Home, Sparkles } from "lucide-react";
import ModernCard from "@/components/ModernCard";

const AudioCountPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800">
      {/* Header */}
      <header className="relative px-4 lg:px-8 py-6 lg:py-8">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <ModernCard 
            onClick={() => navigate('/')}
            className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 lg:w-6 lg:w-6 text-gray-700 dark:text-gray-300" />
          </ModernCard>
          
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
              <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </div>
            <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Audio Counter
            </h1>
          </div>
          
          <ModernCard 
            onClick={() => navigate('/')}
            className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
          >
            <Home className="w-5 h-5 lg:w-6 lg:w-6 text-gray-700 dark:text-gray-300" />
          </ModernCard>
        </div>
      </header>
      
      <main className="flex-1 px-4 lg:px-8 pb-8 lg:pb-12">
        <div className="max-w-4xl mx-auto flex justify-center">
          <MantraCounter />
        </div>
      </main>
    </div>
  );
};

export default AudioCountPage;
