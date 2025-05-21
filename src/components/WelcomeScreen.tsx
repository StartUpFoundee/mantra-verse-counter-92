
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateUserID, spiritualIcons, saveUserData } from "@/utils/spiritualIdUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SpiritualIconSelector from "./SpiritualIconSelector";
import { toast } from "@/hooks/use-toast";

const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("om");
  const [showLogin, setShowLogin] = useState(false);
  const [existingId, setExistingId] = useState("");

  const handleCreateIdentity = () => {
    if (!name || !dob || !selectedIcon) {
      toast({
        title: "Missing information",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    // Generate unique ID
    const userID = generateUserID(dob);

    // Get selected icon
    const iconObj = spiritualIcons.find(icon => icon.id === selectedIcon);

    // Create user data object
    const userData = {
      id: userID,
      name: name,
      dob: dob,
      symbol: selectedIcon,
      symbolImage: iconObj?.symbol || "🕉️",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      chantingStats: {}
    };

    // Save to localStorage
    saveUserData(userData);

    // Show success message
    toast({
      title: "Identity Created",
      description: `Your spiritual ID is ${userID}. Please remember it.`,
    });

    // Redirect to homepage
    navigate("/");
  };

  const handleExistingIdLogin = () => {
    if (!existingId) {
      toast({
        title: "Missing ID",
        description: "Please enter your spiritual ID",
        variant: "destructive"
      });
      return;
    }

    // In a real app, we'd validate this ID exists
    // For this demo, we'll just create a simple user object
    const userData = {
      id: existingId,
      name: "Returning User",
      symbol: "om",
      symbolImage: "🕉️",
      lastLogin: new Date().toISOString(),
    };

    saveUserData(userData);
    navigate("/");
  };

  const handleContinueAsGuest = () => {
    navigate("/");
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-zinc-800/50 border border-zinc-700 rounded-xl">
      <h1 className="text-2xl font-bold text-amber-400 text-center mb-6">
        Welcome to Mantra Counter
      </h1>
      
      {!showLogin ? (
        <>
          <div className="space-y-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-amber-400">
                Your Name / आपका नाम
              </Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-zinc-900 border-zinc-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dob" className="text-amber-400">
                Date of Birth / जन्म तिथि
              </Label>
              <Input
                id="dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="bg-zinc-900 border-zinc-700"
              />
            </div>
            
            <SpiritualIconSelector 
              selectedIcon={selectedIcon}
              onSelectIcon={setSelectedIcon}
            />
          </div>
          
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleCreateIdentity}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Create Your Spiritual Identity
            </Button>
            
            <div className="flex items-center gap-2 my-2">
              <div className="h-px flex-1 bg-zinc-700"></div>
              <span className="text-zinc-500 text-sm">or</span>
              <div className="h-px flex-1 bg-zinc-700"></div>
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowLogin(true)}
              className="border-zinc-700 text-gray-300 hover:bg-zinc-700"
            >
              Login with Existing ID
            </Button>
            
            <Button
              variant="ghost"
              onClick={handleContinueAsGuest}
              className="text-gray-400 hover:text-gray-300 hover:bg-zinc-800"
            >
              Continue as Guest
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="existingId" className="text-amber-400">
                Your Spiritual ID / आपका आध्यात्मिक आईडी
              </Label>
              <Input
                id="existingId"
                placeholder="Enter your ID (e.g., 01012000_1234)"
                value={existingId}
                onChange={(e) => setExistingId(e.target.value)}
                className="bg-zinc-900 border-zinc-700"
              />
              <p className="text-xs text-gray-400">
                Format: DDMMYYYY_XXXX (based on your date of birth)
              </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleExistingIdLogin}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Continue Your Journey
            </Button>
            
            <div className="flex items-center gap-2 my-2">
              <div className="h-px flex-1 bg-zinc-700"></div>
              <span className="text-zinc-500 text-sm">or</span>
              <div className="h-px flex-1 bg-zinc-700"></div>
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowLogin(false)}
              className="border-zinc-700 text-gray-300 hover:bg-zinc-700"
            >
              Create New Identity
            </Button>
            
            <Button
              variant="ghost"
              onClick={handleContinueAsGuest}
              className="text-gray-400 hover:text-gray-300 hover:bg-zinc-800"
            >
              Continue as Guest
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default WelcomeScreen;
