
import React, { useEffect } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface CompletionAlertProps {
  isOpen: boolean;
  targetCount: number;
  onClose: () => void;
}

const CompletionAlert: React.FC<CompletionAlertProps> = ({ isOpen, targetCount, onClose }) => {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    if (isOpen) {
      // Create audio element for alarm sound
      const audio = new Audio("https://cdn.freesound.org/previews/221/221683_1015240-lq.mp3");
      audioRef.current = audio;
      
      // Play the sound
      audio.loop = true;
      audio.play().catch(e => console.error("Error playing alarm:", e));
    } else if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isOpen]);

  return (
    <AlertDialog open={isOpen} onOpenChange={() => onClose()}>
      <AlertDialogContent className="bg-orange-50 border-2 border-orange-300">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl text-orange-600 text-center">
            Mantra Complete! 🙏
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-lg">
            <div className="py-4">
              <p className="text-gray-700">
                You have completed {targetCount} mantras.
              </p>
              <p className="mt-2 text-orange-600 font-medium">
                Om Shanti, Shanti, Shanti
              </p>
            </div>
            <button 
              onClick={onClose}
              className="mx-auto mt-4 px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              Close
            </button>
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CompletionAlert;
