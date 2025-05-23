
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  generateUserID, 
  spiritualIcons, 
  saveUserData, 
  validateUserID, 
  correctUserID,
  findIDsByDOB,
  extractDOBFromID
} from "@/utils/spiritualIdUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SpiritualIconSelector from "./SpiritualIconSelector";
import { toast } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("om");
  const [activeTab, setActiveTab] = useState<"create" | "login" | "recover">("create");
  const [existingId, setExistingId] = useState("");
  const [recoveryDob, setRecoveryDob] = useState("");
  const [recoveredIds, setRecoveredIds] = useState<string[]>([]);
  const [isRecoverySearched, setIsRecoverySearched] = useState(false);

  useEffect(() => {
    // Check URL for ID parameter (for QR code logins)
    const params = new URLSearchParams(location.search);
    const idParam = params.get('id');
    
    if (idParam) {
      setExistingId(idParam);
      setActiveTab("login");
    }
  }, [location]);

  const handleCreateIdentity = () => {
    if (!name || !dob || !selectedIcon) {
      toast("Missing information", {
        description: "Please fill all required fields",
      });
      return;
    }

    // Generate unique ID based on DOB
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
    toast("Identity Created", {
      description: `Your spiritual ID is ${userID}. Please remember it.`,
    });

    // Redirect to homepage
    navigate("/");
  };

  const handleExistingIdLogin = () => {
    if (!existingId) {
      toast("Missing ID", {
        description: "Please enter your spiritual ID",
      });
      return;
    }

    // Correct common mistakes in ID format
    const correctedId = correctUserID(existingId);
    
    // Validate ID format
    if (!validateUserID(correctedId)) {
      toast("Invalid ID Format", {
        description: "Please enter a valid spiritual ID (format: DDMMYYYY_XXXX)",
      });
      return;
    }

    // Create a basic user object from the ID
    const dob = extractDOBFromID(correctedId);
    const iconObj = spiritualIcons.find(icon => icon.id === selectedIcon);
    
    const userData = {
      id: correctedId,
      name: name || "Spiritual Seeker", // Use entered name or default
      dob: dob,
      symbol: selectedIcon,
      symbolImage: iconObj?.symbol || "🕉️",
      lastLogin: new Date().toISOString(),
    };

    saveUserData(userData);
    navigate("/");
  };

  const handleRecoverySearch = () => {
    if (!recoveryDob) {
      toast("Date Required", {
        description: "Please enter your date of birth",
      });
      return;
    }

    // Search for IDs matching this DOB
    const foundIds = findIDsByDOB(recoveryDob);
    setRecoveredIds(foundIds);
    setIsRecoverySearched(true);
    
    if (foundIds.length === 0) {
      toast("No IDs Found", {
        description: "No spiritual IDs found matching this date of birth",
      });
    }
  };

  const handleSelectRecoveredId = (id: string) => {
    setExistingId(id);
    setActiveTab("login");
    
    toast("ID Selected", {
      description: "You can now log in with this spiritual ID",
    });
  };

  const handleContinueAsGuest = () => {
    navigate("/");
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-zinc-800/50 border border-zinc-700 rounded-xl">
      <h1 className="text-2xl font-bold text-amber-400 text-center mb-6">
        Welcome to Mantra Counter
      </h1>
      
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as "create" | "login" | "recover")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Create Identity</TabsTrigger>
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="recover">Recover ID</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="mt-6 space-y-4">
          <div className="space-y-4">
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
          
          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={handleCreateIdentity}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Create Your Spiritual Identity
            </Button>
            
            <Button
              variant="ghost"
              onClick={handleContinueAsGuest}
              className="text-gray-400 hover:text-gray-300 hover:bg-zinc-800"
            >
              Continue as Guest
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="login" className="mt-6 space-y-4">
          <div className="space-y-4">
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
            
            <div className="space-y-2">
              <Label htmlFor="name-login" className="text-amber-400">
                Your Name (Optional) / आपका नाम
              </Label>
              <Input
                id="name-login"
                placeholder="Enter your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-zinc-900 border-zinc-700"
              />
            </div>
            
            <SpiritualIconSelector 
              selectedIcon={selectedIcon}
              onSelectIcon={setSelectedIcon}
            />
          </div>
          
          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={handleExistingIdLogin}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Continue Your Journey
            </Button>
            
            <Button
              variant="ghost"
              onClick={handleContinueAsGuest}
              className="text-gray-400 hover:text-gray-300 hover:bg-zinc-800"
            >
              Continue as Guest
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="recover" className="mt-6 space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="recovery-dob" className="text-amber-400 mb-2 block">
                Enter Your Date of Birth / अपनी जन्म तिथि दर्ज करें
              </Label>
              <Input
                id="recovery-dob"
                type="date"
                value={recoveryDob}
                onChange={(e) => setRecoveryDob(e.target.value)}
                className="bg-zinc-900 border-zinc-700"
              />
              <p className="text-xs text-gray-400 mt-1">
                We'll find IDs associated with this birth date
              </p>
            </div>
            
            <Button
              onClick={handleRecoverySearch}
              className="w-full bg-zinc-700 hover:bg-zinc-600 text-white"
            >
              Search for My ID
            </Button>
            
            {isRecoverySearched && (
              <div className="mt-4">
                <Label className="text-amber-400 mb-2 block">
                  {recoveredIds.length > 0 ? "Found IDs" : "No IDs Found"}
                </Label>
                
                {recoveredIds.length > 0 ? (
                  <div className="space-y-2">
                    {recoveredIds.map((id) => (
                      <div 
                        key={id} 
                        className="p-3 bg-zinc-700 border border-zinc-600 rounded-md cursor-pointer hover:bg-zinc-600"
                        onClick={() => handleSelectRecoveredId(id)}
                      >
                        <p className="font-medium text-amber-400">{id}</p>
                        <p className="text-xs text-gray-300 mt-1">Click to select this ID</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-zinc-700 border border-zinc-600 rounded-md">
                    <p className="text-gray-300">No spiritual IDs found matching this date of birth.</p>
                    <p className="text-sm text-gray-400 mt-2">
                      You may need to create a new identity or try another date.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-3 pt-4 mt-4">
            <Button
              variant="outline"
              onClick={() => setActiveTab("create")}
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
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 pt-4 border-t border-zinc-700">
        <p className="text-xs text-center text-gray-400">
          Your identity is stored locally on your device. <br/>
          <button 
            className="text-amber-400 hover:underline"
            onClick={() => navigate('/identity-guide')}
          >
            Learn more about identity management
          </button>
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
