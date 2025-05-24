
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
import { initializeDatabase, migrateFromLocalStorage } from "@/utils/indexedDBUtils";
import ModernCard from "./ModernCard";

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
  const [isMigrating, setIsMigrating] = useState(false);

  useEffect(() => {
    const init = async () => {
      setIsMigrating(true);
      await initializeDatabase();
      const migrationSuccess = await migrateFromLocalStorage();
      if (migrationSuccess) {
        console.log("Data migration successful");
      }
      setIsMigrating(false);
    };
    init();
    
    const params = new URLSearchParams(location.search);
    const idParam = params.get('id');
    
    if (idParam) {
      setExistingId(idParam);
      setActiveTab("login");
    }
  }, [location]);

  if (isMigrating) {
    return (
      <ModernCard className="w-full max-w-md mx-auto p-8 text-center">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-amber-400 text-lg mb-6">Upgrading your spiritual journey...</div>
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </ModernCard>
    );
  }

  const handleCreateIdentity = async () => {
    if (!name || !dob || !selectedIcon) {
      toast("Missing information", {
        description: "Please fill all required fields",
      });
      return;
    }

    const userID = generateUserID(dob);
    const iconObj = spiritualIcons.find(icon => icon.id === selectedIcon);

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

    saveUserData(userData);

    toast("Identity Created", {
      description: `Your spiritual ID is ${userID}. Welcome!`,
    });

    // Force navigation to home page
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  };

  const handleExistingIdLogin = () => {
    if (!existingId) {
      toast("Missing ID", {
        description: "Please enter your spiritual ID",
      });
      return;
    }

    const correctedId = correctUserID(existingId);
    
    if (!validateUserID(correctedId)) {
      toast("Invalid ID Format", {
        description: "Please enter a valid spiritual ID (format: DDMMYYYY_XXXX)",
      });
      return;
    }

    const dob = extractDOBFromID(correctedId);
    const iconObj = spiritualIcons.find(icon => icon.id === selectedIcon);
    
    const userData = {
      id: correctedId,
      name: name || "Spiritual Seeker",
      dob: dob,
      symbol: selectedIcon,
      symbolImage: iconObj?.symbol || "🕉️",
      lastLogin: new Date().toISOString(),
    };

    saveUserData(userData);
    
    setTimeout(() => {
      window.location.href = "/";
    }, 500);
  };

  const handleRecoverySearch = () => {
    if (!recoveryDob) {
      toast("Date Required", {
        description: "Please enter your date of birth",
      });
      return;
    }

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
    <div className="w-full max-w-lg mx-auto p-4 lg:max-w-2xl lg:p-8">
      <ModernCard className="p-6 lg:p-8 border-amber-200/30 dark:border-amber-700/30" gradient>
        <div className="text-center mb-6 lg:mb-8">
          <div className="text-6xl lg:text-7xl mb-4">🕉️</div>
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
            Welcome to Mantra Verse
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm lg:text-base">
            Begin your spiritual journey with us
          </p>
        </div>
        
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as "create" | "login" | "recover")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-zinc-700/50">
            <TabsTrigger value="create" className="text-xs lg:text-sm data-[state=active]:bg-amber-500 data-[state=active]:text-white">Create</TabsTrigger>
            <TabsTrigger value="login" className="text-xs lg:text-sm data-[state=active]:bg-amber-500 data-[state=active]:text-white">Login</TabsTrigger>
            <TabsTrigger value="recover" className="text-xs lg:text-sm data-[state=active]:bg-amber-500 data-[state=active]:text-white">Recover</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="mt-6 space-y-4 lg:space-y-6">
            <div className="space-y-4 lg:space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-amber-600 dark:text-amber-400 font-medium">
                  Your Name / आपका नाम
                </Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/80 dark:bg-zinc-900/80 border-gray-300/50 dark:border-zinc-600/50 backdrop-blur-sm h-12 lg:h-14 text-base lg:text-lg"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dob" className="text-amber-600 dark:text-amber-400 font-medium">
                  Date of Birth / जन्म तिथि
                </Label>
                <Input
                  id="dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="bg-white/80 dark:bg-zinc-900/80 border-gray-300/50 dark:border-zinc-600/50 backdrop-blur-sm h-12 lg:h-14 text-base lg:text-lg"
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
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white h-12 lg:h-14 text-base lg:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Create Your Spiritual Identity
              </Button>
              
              <Button
                variant="ghost"
                onClick={handleContinueAsGuest}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-zinc-800/50 h-11 lg:h-12"
              >
                Continue as Guest
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="login" className="mt-6 space-y-4 lg:space-y-6">
            <div className="space-y-4 lg:space-y-5">
              <div className="space-y-2">
                <Label htmlFor="existingId" className="text-amber-600 dark:text-amber-400 font-medium">
                  Your Spiritual ID / आपका आध्यात्मिक आईडी
                </Label>
                <Input
                  id="existingId"
                  placeholder="Enter your ID (e.g., 01012000_1234)"
                  value={existingId}
                  onChange={(e) => setExistingId(e.target.value)}
                  className="bg-white/80 dark:bg-zinc-900/80 border-gray-300/50 dark:border-zinc-600/50 backdrop-blur-sm h-12 lg:h-14 text-base lg:text-lg"
                />
                <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                  Format: DDMMYYYY_XXXX (based on your date of birth)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name-login" className="text-amber-600 dark:text-amber-400 font-medium">
                  Your Name (Optional) / आपका नाम
                </Label>
                <Input
                  id="name-login"
                  placeholder="Enter your name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/80 dark:bg-zinc-900/80 border-gray-300/50 dark:border-zinc-600/50 backdrop-blur-sm h-12 lg:h-14 text-base lg:text-lg"
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
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white h-12 lg:h-14 text-base lg:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Continue Your Journey
              </Button>
              
              <Button
                variant="ghost"
                onClick={handleContinueAsGuest}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-zinc-800/50 h-11 lg:h-12"
              >
                Continue as Guest
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="recover" className="mt-6 space-y-4 lg:space-y-6">
            <div className="space-y-4 lg:space-y-5">
              <div>
                <Label htmlFor="recovery-dob" className="text-amber-600 dark:text-amber-400 font-medium mb-2 block">
                  Enter Your Date of Birth / अपनी जन्म तिथि दर्ज करें
                </Label>
                <Input
                  id="recovery-dob"
                  type="date"
                  value={recoveryDob}
                  onChange={(e) => setRecoveryDob(e.target.value)}
                  className="bg-white/80 dark:bg-zinc-900/80 border-gray-300/50 dark:border-zinc-600/50 backdrop-blur-sm h-12 lg:h-14 text-base lg:text-lg"
                />
                <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  We'll find IDs associated with this birth date
                </p>
              </div>
              
              <Button
                onClick={handleRecoverySearch}
                className="w-full bg-gradient-to-r from-zinc-600 to-zinc-700 hover:from-zinc-700 hover:to-zinc-800 text-white h-12 lg:h-14 text-base lg:text-lg"
              >
                Search for My ID
              </Button>
              
              {isRecoverySearched && (
                <div className="mt-4">
                  <Label className="text-amber-600 dark:text-amber-400 font-medium mb-2 block">
                    {recoveredIds.length > 0 ? "Found IDs" : "No IDs Found"}
                  </Label>
                  
                  {recoveredIds.length > 0 ? (
                    <div className="space-y-2">
                      {recoveredIds.map((id) => (
                        <ModernCard 
                          key={id} 
                          className="p-4 cursor-pointer hover:shadow-md transition-all duration-300"
                          onClick={() => handleSelectRecoveredId(id)}
                        >
                          <p className="font-medium text-amber-600 dark:text-amber-400 text-lg">{id}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Click to select this ID</p>
                        </ModernCard>
                      ))}
                    </div>
                  ) : (
                    <ModernCard className="p-6">
                      <p className="text-gray-700 dark:text-gray-300">No spiritual IDs found matching this date of birth.</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        You may need to create a new identity or try another date.
                      </p>
                    </ModernCard>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-3 pt-4 mt-4">
              <Button
                variant="outline"
                onClick={() => setActiveTab("create")}
                className="border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-zinc-800/50 h-11 lg:h-12"
              >
                Create New Identity
              </Button>
              
              <Button
                variant="ghost"
                onClick={handleContinueAsGuest}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-zinc-800/50 h-11 lg:h-12"
              >
                Continue as Guest
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 lg:mt-8 pt-4 border-t border-gray-200/50 dark:border-zinc-700/50">
          <p className="text-xs lg:text-sm text-center text-gray-500 dark:text-gray-400">
            Your identity is stored locally on your device. <br/>
            <button 
              className="text-amber-500 dark:text-amber-400 hover:underline"
              onClick={() => navigate('/identity-guide')}
            >
              Learn more about identity management
            </button>
          </p>
        </div>
      </ModernCard>
    </div>
  );
};

export default WelcomeScreen;
