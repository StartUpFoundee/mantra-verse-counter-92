
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { SpeechDetection } from "@/utils/speechDetection";
import TargetSelector from "@/components/TargetSelector";
import CompletionAlert from "@/components/CompletionAlert";
import { Mic, MicOff, Volume, Volume2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";

const MantraCounter: React.FC = () => {
  const [targetCount, setTargetCount] = useState<number | null>(null);
  const [currentCount, setCurrentCount] = useState<number>(0);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  const [showCompletionAlert, setShowCompletionAlert] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [sensitivityLevel, setSensitivityLevel] = useState<number>(2); // 0: low, 1: medium, 2: high
  const [lifetimeCount, setLifetimeCount] = useState<number>(0);
  const [todayCount, setTodayCount] = useState<number>(0);
  const speechDetection = useRef<SpeechDetection | null>(null);
  const lastSpeechTime = useRef<number>(0);
  const speechDetected = useRef<boolean>(false);

  // Load saved counts from localStorage on component mount
  useEffect(() => {
    const savedLifetimeCount = localStorage.getItem('lifetimeCount');
    const savedTodayCount = localStorage.getItem('todayCount');
    const savedLastDate = localStorage.getItem('lastCountDate');
    
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
  }, []);

  useEffect(() => {
    // Check if target is reached
    if (targetCount !== null && currentCount >= targetCount && targetCount > 0) {
      handleCompletion();
    }
  }, [currentCount, targetCount]);

  const handleCompletion = () => {
    if (isListening) {
      stopListening();
    }
    setShowCompletionAlert(true);
  };

  const handleSelectTarget = (target: number) => {
    setTargetCount(target);
    setCurrentCount(0);
    setShowCompletionAlert(false);
  };

  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setMicPermission(true);
      toast.success("Microphone access granted");
      return true;
    } catch (error) {
      console.error("Error requesting microphone permission:", error);
      setMicPermission(false);
      toast.error("Microphone access denied. Please enable microphone access in your browser settings.");
      return false;
    }
  };

  const startListening = async () => {
    if (!micPermission) {
      const granted = await requestMicPermission();
      if (!granted) return;
    }
    
    const minDecibelsSettings = [-50, -60, -70]; // low, medium, high
    
    if (!speechDetection.current) {
      speechDetection.current = new SpeechDetection({
        onSpeechDetected: () => {
          speechDetected.current = true;
          setAudioLevel(prev => Math.min(100, prev + 30)); // Visual feedback
          console.log("Speech detected");
        },
        onSpeechEnded: () => {
          if (speechDetected.current) {
            const now = Date.now();
            if (now - lastSpeechTime.current > 800) {
              setCurrentCount(count => {
                const newCount = count + 1;
                toast.success(`Mantra counted: ${newCount}`, {
                  duration: 1000,
                  style: { background: '#262626', color: '#fcd34d' },
                });
                
                // Update lifetime and today counts
                setLifetimeCount(prevLifetime => {
                  const newLifetime = prevLifetime + 1;
                  localStorage.setItem('lifetimeCount', newLifetime.toString());
                  return newLifetime;
                });
                
                setTodayCount(prevToday => {
                  const newToday = prevToday + 1;
                  localStorage.setItem('todayCount', newToday.toString());
                  localStorage.setItem('lastCountDate', new Date().toDateString());
                  return newToday;
                });
                
                return newCount;
              });
              console.log("Mantra counted");
            }
            lastSpeechTime.current = now;
            speechDetected.current = false;
          }
          setAudioLevel(0); // Reset visual feedback
        },
        minDecibels: minDecibelsSettings[sensitivityLevel]
      });
    }
    
    const started = await speechDetection.current.start();
    if (started) {
      setIsListening(true);
      lastSpeechTime.current = Date.now();
      toast.success(`Listening for mantras (Sensitivity: ${getSensitivityLabel()})`, {
        style: { background: '#262626', color: '#fcd34d' }
      });
    } else {
      toast.error("Failed to start listening. Please try again.", {
        style: { background: '#262626', color: '#fcd34d' }
      });
    }
  };

  const getSensitivityLabel = () => {
    const labels = ["Low", "Medium", "High"];
    return labels[sensitivityLevel];
  };

  const toggleSensitivity = () => {
    const wasListening = isListening;
    if (wasListening) {
      stopListening();
    }
    
    setSensitivityLevel((prev) => (prev + 1) % 3);
    
    if (wasListening) {
      // Small delay to ensure the previous instance is properly cleaned up
      setTimeout(() => {
        startListening();
      }, 300);
    }
    
    toast.info(`Microphone sensitivity: ${getSensitivityLabel()}`, {
      style: { background: '#262626', color: '#fcd34d' }
    });
  };

  const stopListening = () => {
    if (speechDetection.current) {
      speechDetection.current.stop();
      speechDetection.current = null;
    }
    setIsListening(false);
    setAudioLevel(0);
    toast.info("Stopped listening", {
      style: { background: '#262626', color: '#fcd34d' }
    });
  };

  const toggleListening = async () => {
    if (isListening) {
      stopListening();
    } else if (targetCount !== null) {
      startListening();
    }
  };

  const resetCounter = () => {
    if (isListening) {
      stopListening();
    }
    setCurrentCount(0);
    setShowCompletionAlert(false);
    toast.info("Counter reset", {
      style: { background: '#262626', color: '#fcd34d' }
    });
  };

  const handleReset = () => {
    resetCounter();
    setTargetCount(null);
  };

  const progressPercentage = targetCount ? (currentCount / targetCount) * 100 : 0;

  const getSensitivityIcon = () => {
    if (sensitivityLevel === 0) return <Volume className="w-5 h-5" />;
    if (sensitivityLevel === 1) return <Volume2 className="w-5 h-5" />;
    return <Volume2 className="w-5 h-5" />;
  };

  if (targetCount === null) {
    return <TargetSelector onSelectTarget={handleSelectTarget} />;
  }

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto px-4">
      <div className="mb-4 text-center w-full">
        <div className="text-amber-400 text-lg">{currentCount} / {targetCount}</div>
        <div className="text-sm text-gray-400">{Math.round(progressPercentage)}% complete</div>
      </div>
      
      <div className="stats w-full flex gap-4 mb-6">
        <div className="stat flex-1 bg-zinc-800/80 rounded-lg p-3 text-center">
          <h3 className="text-xs text-gray-400">Lifetime</h3>
          <p className="text-lg font-bold text-amber-400">{lifetimeCount}</p>
        </div>
        
        <div className="stat flex-1 bg-zinc-800/80 rounded-lg p-3 text-center">
          <h3 className="text-xs text-gray-400">Today</h3>
          <p className="text-lg font-bold text-amber-400">{todayCount}</p>
        </div>
      </div>
      
      {/* Advertisement placeholder */}
      <div className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-6">
        <p className="text-center text-gray-400 text-sm">Advertisement</p>
        <p className="text-center text-gray-500 text-xs">Place your ad here</p>
      </div>
      
      <div className="counter-display relative mb-10">
        {/* Gold circle */}
        <div className="relative">
          <div className="w-48 h-48 rounded-full bg-amber-500 flex items-center justify-center">
            <div className="text-white text-5xl font-bold">
              {/* Om symbol and counter */}
              <div className="text-3xl mb-2">ॐ</div>
              <div>{currentCount}</div>
            </div>
          </div>
          
          {/* Listening indicator */}
          {isListening && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1 rounded-full transition-all ${
                    audioLevel > i * 20 ? 'bg-white' : 'bg-amber-700'
                  }`} 
                  style={{ height: `${Math.min(8 + (i * 3), 20) + (audioLevel > i * 20 ? 4 : 0)}px` }}
                />
              ))}
            </div>
          )}
        </div>
        
        <button 
          onClick={toggleListening}
          className={`absolute -bottom-5 left-1/2 transform -translate-x-1/2 flex items-center justify-center w-16 h-16 rounded-full shadow-lg ${
            isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600'
          } text-black transition-colors`}
        >
          {isListening ? (
            <MicOff className="w-7 h-7" />
          ) : (
            <Mic className="w-7 h-7" />
          )}
        </button>
      </div>
      
      <div className="text-center mb-5">
        <p className="text-gray-300">
          {isListening 
            ? "Listening active - Speak your mantra with 1 second pauses"
            : "Press the microphone button to start listening"}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {isListening
            ? "ध्वनि सक्रिय - 1 सेकंड के अंतराल के साथ मंत्र का जाप करें"
            : "सुनना शुरू करने के लिए माइक्रोफोन बटन दबाएं"}
        </p>
      </div>
      
      <button
        onClick={toggleSensitivity}
        className="flex items-center justify-center gap-2 mb-5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-full text-sm font-medium text-amber-400 transition-colors"
      >
        {getSensitivityIcon()}
        <span>Sensitivity: {getSensitivityLabel()}</span>
      </button>
      
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700"
          onClick={resetCounter}
        >
          Reset Count
        </Button>
        <Button 
          variant="outline" 
          className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700"
          onClick={handleReset}
        >
          Change Target
        </Button>
      </div>

      <CompletionAlert 
        isOpen={showCompletionAlert} 
        targetCount={targetCount} 
        onClose={() => setShowCompletionAlert(false)} 
      />
    </div>
  );
};

export default MantraCounter;
