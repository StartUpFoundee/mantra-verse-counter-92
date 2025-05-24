
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Download, Share2, Printer, QrCode, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { 
  generateUserID, 
  validateUserID, 
  extractDOBFromID, 
  spiritualIcons,
  getUserData,
  saveUserData,
  logoutUser
} from "@/utils/spiritualIdUtils";
import { Label } from "@/components/ui/label";
import SpiritualIconSelector from "@/components/SpiritualIconSelector";
import QRCodeModal from "@/components/QRCodeModal";
import ModernCard from "@/components/ModernCard";

const SpiritualIdPage: React.FC = () => {
  const navigate = useNavigate();
  const [spiritualId, setSpiritualId] = useState<string>("");
  const [spiritualName, setSpiritualName] = useState<string>("");
  const [nameInput, setNameInput] = useState<string>("");
  const [dobInput, setDobInput] = useState<string>("");
  const [inputId, setInputId] = useState<string>("");
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const [showInputField, setShowInputField] = useState<boolean>(false);
  const [showNameInput, setShowNameInput] = useState<boolean>(false);
  const [inputValid, setInputValid] = useState<boolean | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<string>("om");
  const [qrModalOpen, setQrModalOpen] = useState<boolean>(false);
  const [showLoginOptions, setShowLoginOptions] = useState<boolean>(false);

  useEffect(() => {
    const userData = getUserData();
    
    if (userData) {
      setSpiritualId(userData.id);
      setSpiritualName(userData.name || "");
      setSelectedIcon(userData.symbol || "om");
      setIsNewUser(false);
      setShowLoginOptions(false);
    } else {
      setIsNewUser(true);
      setShowNameInput(false);
      setShowLoginOptions(true);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputId(value);
    
    if (value.length >= 6) {
      const isValid = validateUserID(value);
      setInputValid(isValid);
    } else {
      setInputValid(null);
    }
  };

  const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameInput(e.target.value);
  };
  
  const handleDobInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDobInput(e.target.value);
  };

  const handleIconSelect = (iconId: string) => {
    setSelectedIcon(iconId);
  };

  const handleNameSubmit = () => {
    if (!nameInput.trim()) {
      toast("Missing Name", {
        description: "Please enter your name"
      });
      return;
    }
    
    if (!dobInput) {
      toast("Missing Date of Birth", {
        description: "Please enter your date of birth"
      });
      return;
    }

    const newId = generateUserID(dobInput);
    setSpiritualId(newId);
    setSpiritualName(nameInput);
    
    const iconObj = spiritualIcons.find(i => i.id === selectedIcon);
    const userData = {
      id: newId,
      name: nameInput,
      dob: dobInput,
      symbol: selectedIcon,
      symbolImage: iconObj?.symbol || "🕉️",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    
    saveUserData(userData);
    
    setShowNameInput(false);
    setShowLoginOptions(false);
    setIsNewUser(false);
    
    toast("Identity Created", {
      description: "Your spiritual ID was created successfully!"
    });
    
    navigate("/");
  };

  const handleSubmitId = () => {
    const isValid = validateUserID(inputId);
    setInputValid(isValid);
    
    if (isValid) {
      const extractedDob = extractDOBFromID(inputId);
      const iconSymbol = spiritualIcons.find(i => i.id === selectedIcon)?.symbol || "🕉️";
      
      const userData = {
        id: inputId,
        name: nameInput || "Spiritual Seeker",
        dob: extractedDob,
        symbol: selectedIcon,
        symbolImage: iconSymbol,
        lastLogin: new Date().toISOString()
      };
      
      saveUserData(userData);
      setSpiritualId(inputId);
      setSpiritualName(userData.name);
      setShowInputField(false);
      setShowLoginOptions(false);
      
      toast("Login Successful", {
        description: "You've logged in with your spiritual ID"
      });
      
      navigate("/");
    } else {
      toast("Invalid ID", {
        description: "Invalid spiritual ID format"
      });
    }
  };

  const handleLogout = () => {
    logoutUser();
    
    setShowLoginOptions(true);
    setSpiritualId("");
    setSpiritualName("");
    setInputId("");
    setIsNewUser(true);
    setSelectedIcon("om");
    
    toast("Logged Out", {
      description: "You have been logged out successfully"
    });
  };

  const handleShowCreateId = () => {
    setShowNameInput(true);
    setShowLoginOptions(false);
  };

  const handleShowLoginWithId = () => {
    setShowInputField(true);
    setShowLoginOptions(false);
  };

  const handleDownloadScreenshot = () => {
    setQrModalOpen(true);
  };

  const handleShareWhatsApp = () => {
    const shareText = `My spiritual ID: ${spiritualId}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handlePrint = () => {
    window.print();
    toast.info("Printing spiritual ID card");
  };

  const handleQrCode = () => {
    setQrModalOpen(true);
  };

  const selectedIconObj = spiritualIcons.find(icon => icon.id === selectedIcon);
  const iconSymbol = selectedIconObj ? selectedIconObj.symbol : "🕉️";

  // Login options screen
  if (showLoginOptions) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800">
        <header className="py-4 lg:py-6 px-4 lg:px-8 flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="icon"
            className="text-amber-600 dark:text-amber-400 hover:bg-white/50 dark:hover:bg-zinc-800/50 w-10 h-10 lg:w-12 lg:h-12"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-5 w-5 lg:h-6 lg:w-6" />
          </Button>
          <h1 className="text-xl lg:text-2xl font-bold text-amber-600 dark:text-amber-400">Spiritual ID</h1>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-amber-600 dark:text-amber-400 hover:bg-white/50 dark:hover:bg-zinc-800/50 w-10 h-10 lg:w-12 lg:h-12"
            onClick={() => navigate('/')}
          >
            <Home className="h-5 w-5 lg:h-6 lg:w-6" />
          </Button>
        </header>
        
        <main className="flex-1 flex flex-col items-center justify-center px-4 lg:px-8 pb-12">
          <div className="w-full max-w-md lg:max-w-lg">
            <ModernCard className="p-6 lg:p-8 border-amber-200/50 dark:border-amber-700/50" gradient glowEffect>
              <div className="text-center mb-6 lg:mb-8">
                <div className="text-6xl lg:text-7xl mb-4">🕉️</div>
                <h2 className="text-2xl lg:text-3xl font-bold text-amber-600 dark:text-amber-400 mb-3">Welcome, Spiritual Seeker</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-1 text-base lg:text-lg">Please choose an option to continue</p>
                <p className="text-amber-600 dark:text-amber-300 text-sm lg:text-base">आगे बढ़ने के लिए कृपया एक विकल्प चुनें</p>
              </div>
              
              <div className="flex flex-col items-center gap-4 lg:gap-5">
                <Button 
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white w-full h-12 lg:h-14 text-lg lg:text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={handleShowCreateId}
                >
                  Create New Identity / नई पहचान बनाएं
                </Button>
                
                <Button 
                  className="bg-gradient-to-r from-zinc-600 to-zinc-700 hover:from-zinc-700 hover:to-zinc-800 text-white w-full h-12 lg:h-14 text-lg lg:text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={handleShowLoginWithId}
                >
                  Login with ID / आईडी से लॉगिन करें
                </Button>
                
                <Button 
                  variant="ghost"
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-zinc-800/50 w-full h-11 lg:h-12 text-base lg:text-lg"
                  onClick={() => navigate('/')}
                >
                  Continue as Guest / अतिथि के रूप में जारी रखें
                </Button>
              </div>
            </ModernCard>
          </div>
        </main>
      </div>
    );
  }

  // Name input screen for new users
  if (showNameInput) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800">
        <header className="py-4 lg:py-6 px-4 lg:px-8 flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="icon"
            className="text-amber-600 dark:text-amber-400 hover:bg-white/50 dark:hover:bg-zinc-800/50 w-10 h-10 lg:w-12 lg:h-12"
            onClick={() => setShowLoginOptions(true)}
          >
            <ArrowLeft className="h-5 w-5 lg:h-6 lg:w-6" />
          </Button>
          <h1 className="text-xl lg:text-2xl font-bold text-amber-600 dark:text-amber-400">Spiritual ID</h1>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-amber-600 dark:text-amber-400 hover:bg-white/50 dark:hover:bg-zinc-800/50 w-10 h-10 lg:w-12 lg:h-12"
            onClick={() => navigate('/')}
          >
            <Home className="h-5 w-5 lg:h-6 lg:w-6" />
          </Button>
        </header>
        
        <main className="flex-1 flex flex-col items-center justify-center px-4 lg:px-8 pb-12">
          <div className="w-full max-w-md lg:max-w-lg">
            <ModernCard className="p-6 lg:p-8 border-amber-200/50 dark:border-amber-700/50" gradient glowEffect>
              <div className="text-center mb-6 lg:mb-8">
                <div className="text-6xl lg:text-7xl mb-4">🕉️</div>
                <h2 className="text-2xl lg:text-3xl font-bold text-amber-600 dark:text-amber-400 mb-3">Welcome, Spiritual Seeker</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-1 text-base lg:text-lg">Please enter your details to start your spiritual journey</p>
                <p className="text-amber-600 dark:text-amber-300 text-sm lg:text-base">कृपया अपनी आध्यात्मिक यात्रा शुरू करने के लिए अपना विवरण दर्ज करें</p>
              </div>
              
              <div className="flex flex-col items-center gap-4 lg:gap-6">
                <div className="w-full">
                  <Label htmlFor="name-input" className="text-amber-600 dark:text-amber-400 mb-2 block font-medium">
                    Enter your name / अपना नाम लिखें
                  </Label>
                  <Input 
                    id="name-input"
                    className="bg-white/80 dark:bg-zinc-900/80 border-gray-300/50 dark:border-zinc-600/50 backdrop-blur-sm h-12 lg:h-14 text-base lg:text-lg text-center"
                    placeholder="Your Name / आपका नाम"
                    value={nameInput}
                    onChange={handleNameInputChange}
                  />
                </div>
                
                <div className="w-full">
                  <Label htmlFor="dob-input" className="text-amber-600 dark:text-amber-400 mb-2 block font-medium">
                    Date of Birth / जन्म तिथि
                  </Label>
                  <Input 
                    id="dob-input"
                    type="date"
                    className="bg-white/80 dark:bg-zinc-900/80 border-gray-300/50 dark:border-zinc-600/50 backdrop-blur-sm h-12 lg:h-14 text-base lg:text-lg"
                    value={dobInput}
                    onChange={handleDobInputChange}
                  />
                </div>
                
                <SpiritualIconSelector selectedIcon={selectedIcon} onSelectIcon={handleIconSelect} />
                
                <Button 
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white w-full h-12 lg:h-14 text-lg lg:text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={handleNameSubmit}
                >
                  Start My Journey / मेरी यात्रा शुरू करें
                </Button>
              </div>
            </ModernCard>
          </div>
        </main>
      </div>
    );
  }

  // ID input for existing users
  if (showInputField) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800">
        <header className="py-4 lg:py-6 px-4 lg:px-8 flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="icon"
            className="text-amber-600 dark:text-amber-400 hover:bg-white/50 dark:hover:bg-zinc-800/50 w-10 h-10 lg:w-12 lg:h-12"
            onClick={() => setShowLoginOptions(true)}
          >
            <ArrowLeft className="h-5 w-5 lg:h-6 lg:w-6" />
          </Button>
          <h1 className="text-xl lg:text-2xl font-bold text-amber-600 dark:text-amber-400">Spiritual ID</h1>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-amber-600 dark:text-amber-400 hover:bg-white/50 dark:hover:bg-zinc-800/50 w-10 h-10 lg:w-12 lg:h-12"
            onClick={() => navigate('/')}
          >
            <Home className="h-5 w-5 lg:h-6 lg:w-6" />
          </Button>
        </header>
        
        <main className="flex-1 flex flex-col items-center justify-center px-4 lg:px-8 pb-12">
          <div className="w-full max-w-md lg:max-w-lg">
            <ModernCard className="p-6 lg:p-8 border-amber-200/50 dark:border-amber-700/50" gradient>
              <h3 className="text-lg lg:text-xl font-medium text-amber-600 dark:text-amber-400 mb-2 text-center">Enter Your Spiritual ID</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm lg:text-base mb-4 lg:mb-6 text-center">अपना आध्यात्मिक आईडी दर्ज करें</p>
              
              <div className="mb-4 lg:mb-6">
                <Input 
                  className={`bg-white/80 dark:bg-zinc-900/80 border ${
                    inputValid === null ? 'border-gray-300/50 dark:border-zinc-600/50' : 
                    inputValid ? 'border-green-500' : 'border-red-500'
                  } backdrop-blur-sm text-amber-600 dark:text-amber-400 text-xl lg:text-2xl text-center tracking-wider h-14 lg:h-16`}
                  placeholder="01012000_1234"
                  value={inputId}
                  onChange={handleInputChange}
                  maxLength={15}
                />
                
                {inputValid === false && (
                  <p className="text-red-500 text-sm lg:text-base mt-2">
                    Invalid format. Expected: DDMMYYYY_XXXX
                    <br />
                    अमान्य प्रारूप। अपेक्षित: DDMMYYYY_XXXX
                  </p>
                )}
              </div>
              
              <SpiritualIconSelector selectedIcon={selectedIcon} onSelectIcon={handleIconSelect} />
              
              <div className="flex gap-3 mt-6">
                <Button 
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white flex-1 h-12 lg:h-14 text-base lg:text-lg font-semibold"
                  onClick={handleSubmitId}
                  disabled={!inputId || inputValid === false}
                >
                  Login / लॉगिन करें
                </Button>
                <Button 
                  variant="outline"
                  className="border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-zinc-800/50 h-12 lg:h-14"
                  onClick={() => setShowLoginOptions(true)}
                >
                  Cancel / रद्द करें
                </Button>
              </div>
            </ModernCard>
          </div>
        </main>
      </div>
    );
  }

  // Main spiritual ID view (when logged in)
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800">
      <header className="py-4 lg:py-6 px-4 lg:px-8 flex justify-between items-center">
        <Button 
          variant="ghost" 
          size="icon"
          className="text-amber-600 dark:text-amber-400 hover:bg-white/50 dark:hover:bg-zinc-800/50 w-10 h-10 lg:w-12 lg:h-12"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-5 w-5 lg:h-6 lg:w-6" />
        </Button>
        <h1 className="text-xl lg:text-2xl font-bold text-amber-600 dark:text-amber-400">Spiritual ID</h1>
        <Button 
          variant="ghost" 
          size="icon"
          className="text-amber-600 dark:text-amber-400 hover:bg-white/50 dark:hover:bg-zinc-800/50 w-10 h-10 lg:w-12 lg:h-12"
          onClick={() => navigate('/')}
        >
          <Home className="h-5 w-5 lg:h-6 lg:w-6" />
        </Button>
      </header>
      
      {spiritualId && (
        <QRCodeModal 
          open={qrModalOpen} 
          onOpenChange={setQrModalOpen} 
          spiritualId={spiritualId}
        />
      )}
      
      <main className="flex-1 flex flex-col items-center justify-center px-4 lg:px-8 pb-12">
        <div className="w-full max-w-md lg:max-w-lg space-y-6 lg:space-y-8">
          <ModernCard className="p-6 lg:p-8 border-amber-200/50 dark:border-amber-700/50" gradient>
            <div className="text-center mb-6 lg:mb-8">
              <div className="text-6xl lg:text-7xl mb-4">{iconSymbol}</div>
              <h2 className="text-xl lg:text-2xl font-bold text-amber-600 dark:text-amber-400 mb-2">
                {spiritualName ? `${spiritualName} Ji, आपका स्वागत है` : 'Your Spiritual Identity'}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm lg:text-base">आपकी आध्यात्मिक पहचान</p>
            </div>
            
            <div className="flex flex-col items-center">
              <ModernCard className="p-4 lg:p-6 w-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-300/50 dark:border-amber-600/50">
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm mb-2">Spiritual ID / आध्यात्मिक आईडी</p>
                  <p className="text-2xl lg:text-3xl font-bold tracking-wider text-amber-700 dark:text-amber-300">{spiritualId}</p>
                </div>
              </ModernCard>
            </div>
          </ModernCard>
          
          <Button 
            className="bg-white/80 dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-700 text-amber-600 dark:text-amber-400 border border-amber-300/50 dark:border-amber-700/50 w-full flex items-center justify-center gap-2 h-12 lg:h-14 text-base lg:text-lg backdrop-blur-sm"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 lg:h-5 lg:w-5" />
            <span>Logout / लॉग आउट करें</span>
          </Button>
          
          <ModernCard className="p-6 lg:p-8 border-amber-200/50 dark:border-amber-700/50" gradient>
            <h3 className="text-lg lg:text-xl font-medium text-amber-600 dark:text-amber-400 mb-4 lg:mb-6 text-center">
              Share Your Spiritual ID
              <br />
              <span className="text-sm lg:text-base font-normal text-gray-600 dark:text-gray-300">अपना आध्यात्मिक आईडी साझा करें</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-3 lg:gap-4">
              <Button 
                variant="outline" 
                className="bg-white/60 dark:bg-zinc-800/60 hover:bg-white dark:hover:bg-zinc-700 text-amber-600 dark:text-amber-400 border-amber-300/50 dark:border-amber-700/50 flex flex-col items-center py-4 lg:py-6 h-auto backdrop-blur-sm"
                onClick={handleDownloadScreenshot}
              >
                <Download className="h-5 w-5 lg:h-6 lg:w-6 mb-2" />
                <span className="text-sm lg:text-base">Screenshot</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">स्क्रीनशॉट</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="bg-white/60 dark:bg-zinc-800/60 hover:bg-white dark:hover:bg-zinc-700 text-amber-600 dark:text-amber-400 border-amber-300/50 dark:border-amber-700/50 flex flex-col items-center py-4 lg:py-6 h-auto backdrop-blur-sm"
                onClick={handleShareWhatsApp}
              >
                <Share2 className="h-5 w-5 lg:h-6 lg:w-6 mb-2" />
                <span className="text-sm lg:text-base">WhatsApp</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">व्हाट्सएप</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="bg-white/60 dark:bg-zinc-800/60 hover:bg-white dark:hover:bg-zinc-700 text-amber-600 dark:text-amber-400 border-amber-300/50 dark:border-amber-700/50 flex flex-col items-center py-4 lg:py-6 h-auto backdrop-blur-sm"
                onClick={handlePrint}
              >
                <Printer className="h-5 w-5 lg:h-6 lg:w-6 mb-2" />
                <span className="text-sm lg:text-base">Print Card</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">प्रिंट कार्ड</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="bg-white/60 dark:bg-zinc-800/60 hover:bg-white dark:hover:bg-zinc-700 text-amber-600 dark:text-amber-400 border-amber-300/50 dark:border-amber-700/50 flex flex-col items-center py-4 lg:py-6 h-auto backdrop-blur-sm"
                onClick={handleQrCode}
              >
                <QrCode className="h-5 w-5 lg:h-6 lg:w-6 mb-2" />
                <span className="text-sm lg:text-base">QR Code</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">क्यूआर कोड</span>
              </Button>
            </div>
          </ModernCard>
        </div>
      </main>
    </div>
  );
};

export default SpiritualIdPage;
