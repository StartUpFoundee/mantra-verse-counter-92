
import React, { useState, useEffect } from "react";
import { getUserData } from "@/utils/spiritualIdUtils";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { getRandomDefaultQuote } from "@/utils/spiritualQuotesService";
import ModernCard from "./ModernCard";

const WelcomePopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [quote, setQuote] = useState(getRandomDefaultQuote());
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // Load user data early to improve perceived performance
    const userDataObj = getUserData();
    setUserData(userDataObj);
    
    // Check if we've shown the popup today already
    const today = new Date().toDateString();
    const lastShownDate = localStorage.getItem('welcomePopupLastShown');
    
    if (userDataObj) {
      // Always show the popup on page reload regardless of last shown date
      setIsOpen(true);
      // Save that we've shown the popup today
      localStorage.setItem('welcomePopupLastShown', today);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!userData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-amber-200/50 dark:border-amber-700/50 text-gray-900 dark:text-white max-w-md mx-auto shadow-2xl">
        <DialogClose 
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-amber-500/20 hover:text-amber-600 dark:hover:text-amber-400 transition-all duration-300"
          onClick={handleClose}
        >
          <X className="h-5 w-5" />
        </DialogClose>
        
        <DialogHeader>
          <div className="flex flex-col items-center text-center pt-6">
            <ModernCard className="w-20 h-20 flex items-center justify-center mb-4 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-300/50 dark:border-amber-600/50">
              <span className="text-4xl">{userData.symbolImage || "🕉️"}</span>
            </ModernCard>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Namaste, {userData.name} Ji
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 mt-2">
          <ModernCard className="p-4 bg-gradient-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200/50 dark:border-amber-700/50" gradient>
            <p className="text-lg text-amber-700 dark:text-amber-300 italic text-center mb-2">"{quote.english}"</p>
            <p className="text-sm text-amber-600/80 dark:text-amber-200/70 text-center">"{quote.hindi}"</p>
          </ModernCard>
          
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
            May your spiritual journey be filled with divine blessings today.
          </p>
        </div>
        
        <div className="mt-4 text-center">
          <Button
            onClick={handleClose}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-2 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Begin Practice
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomePopup;
