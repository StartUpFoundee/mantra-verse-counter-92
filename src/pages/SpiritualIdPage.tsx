
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Download, Share2, Printer, QrCode, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { 
  generateSpiritualId, 
  validateSpiritualId, 
  extractNameFromId, 
  spiritualIcons 
} from "@/utils/spiritualIdUtils";
import { Label } from "@/components/ui/label";
import SpiritualIconSelector from "@/components/SpiritualIconSelector";
import ThemeToggle from "@/components/ThemeToggle";

const SpiritualIdPage: React.FC = () => {
  const navigate = useNavigate();
  const [spiritualId, setSpiritualId] = useState<string>("");
  const [spiritualName, setSpiritualName] = useState<string>("");
  const [nameInput, setNameInput] = useState<string>("");
  const [inputId, setInputId] = useState<string>("");
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const [showInputField, setShowInputField] = useState<boolean>(false);
  const [showNameInput, setShowNameInput] = useState<boolean>(false);
  const [inputValid, setInputValid] = useState<boolean | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<string>("om");

  useEffect(() => {
    // Check if user already has a spiritual ID stored
    const storedId = localStorage.getItem("spiritualID");
    const storedName = localStorage.getItem("spiritualName");
    const storedIcon = localStorage.getItem("spiritualIcon");
    
    if (storedId) {
      setSpiritualId(storedId);
      setIsNewUser(false);
      
      if (storedName) {
        setSpiritualName(storedName);
      } else {
        // Try to extract name from ID if not stored separately
        const extractedName = extractNameFromId(storedId);
        if (extractedName) {
          setSpiritualName(extractedName);
          localStorage.setItem("spiritualName", extractedName);
        }
      }
      
      if (storedIcon) {
        setSelectedIcon(storedIcon);
      }
    } else {
      // For new users, show name input first
      setIsNewUser(true);
      setShowNameInput(true);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setInputId(value);
    
    if (value.length >= 6) {
      // Validate as user types if the input is long enough
      const isValid = validateSpiritualId(value);
      setInputValid(isValid);
    } else {
      setInputValid(null);
    }
  };

  const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameInput(e.target.value);
  };

  const handleIconSelect = (iconId: string) => {
    setSelectedIcon(iconId);
  };

  const handleNameSubmit = () => {
    if (!nameInput.trim()) {
      toast.error("Please enter your name", {
        style: { background: '#262626', color: '#ea384c' }
      });
      return;
    }

    // Generate ID with name and save both
    const newId = generateSpiritualId(nameInput);
    setSpiritualId(newId);
    setSpiritualName(nameInput);
    localStorage.setItem("spiritualID", newId);
    localStorage.setItem("spiritualName", nameInput);
    localStorage.setItem("spiritualIcon", selectedIcon);
    setShowNameInput(false);
    
    toast.success("Spiritual ID created successfully!", {
      style: { background: '#262626', color: '#fcd34d' }
    });
  };

  const handleSubmitId = () => {
    const isValid = validateSpiritualId(inputId);
    setInputValid(isValid);
    
    if (isValid) {
      // If valid, update the stored ID
      localStorage.setItem("spiritualID", inputId);
      setSpiritualId(inputId);
      localStorage.setItem("spiritualIcon", selectedIcon);
      setShowInputField(false);
      
      // Try to extract name from ID
      const extractedName = extractNameFromId(inputId);
      if (extractedName) {
        setSpiritualName(extractedName);
        localStorage.setItem("spiritualName", extractedName);
      }
      
      toast.success("Spiritual ID updated successfully!", {
        style: { background: '#262626', color: '#fcd34d' }
      });
    } else {
      toast.error("Invalid spiritual ID format", {
        style: { background: '#262626', color: '#ea384c' }
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("spiritualID");
    localStorage.removeItem("spiritualName");
    localStorage.removeItem("spiritualIcon");
    setShowNameInput(true);
    setSpiritualId("");
    setSpiritualName("");
    setInputId("");
    setIsNewUser(true);
    setSelectedIcon("om");
    
    toast.info("Logged out successfully", {
      style: { background: '#262626', color: '#fcd34d' }
    });
  };

  const handleDownloadScreenshot = () => {
    // Simple notification for now - will implement actual screenshot in future
    toast.info("Screenshot function will be implemented soon", {
      style: { background: '#262626', color: '#fcd34d' }
    });
  };

  const handleShareWhatsApp = () => {
    const shareText = `My spiritual ID: ${spiritualId}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handlePrint = () => {
    // Simple notification for now - will implement actual printing in future
    toast.info("Print function will be implemented soon", {
      style: { background: '#262626', color: '#fcd34d' }
    });
  };

  const handleQrCode = () => {
    // Simple notification for now - will implement QR code generation in future
    toast.info("QR code function will be implemented soon", {
      style: { background: '#262626', color: '#fcd34d' }
    });
  };

  // Find the selected icon
  const selectedIconObj = spiritualIcons.find(icon => icon.id === selectedIcon);
  const iconSymbol = selectedIconObj ? selectedIconObj.symbol : "🕉️";

  // Name input screen for new users
  if (showNameInput) {
    return (
      <div className="min-h-screen flex flex-col bg-black text-white dark:bg-zinc-900">
        <header className="py-4 px-4 flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="icon"
            className="text-amber-400 hover:bg-zinc-800"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold text-amber-400">Spiritual ID</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="icon"
              className="text-amber-400 hover:bg-zinc-800"
              onClick={() => navigate('/')}
            >
              <Home className="h-6 w-6" />
            </Button>
          </div>
        </header>
        
        <main className="flex-1 flex flex-col items-center justify-center px-4 pb-12">
          <div className="w-full max-w-md">
            <div className="bg-amber-500/20 border-2 border-amber-500 rounded-lg p-6 mb-8 animate-fade-in">
              <div className="text-center mb-6">
                <div className="text-6xl mb-2">🕉️</div>
                <h2 className="text-2xl font-bold text-amber-400 mb-3">Welcome, Spiritual Seeker</h2>
                <p className="text-gray-300 mb-1">Please enter your name to start your spiritual journey</p>
                <p className="text-amber-300 text-sm">कृपया अपनी आध्यात्मिक यात्रा शुरू करने के लिए अपना नाम लिखें</p>
              </div>
              
              <div className="flex flex-col items-center gap-4">
                <div className="w-full">
                  <Label htmlFor="name-input" className="text-amber-400 mb-1 block">
                    Enter your name / अपना नाम लिखें
                  </Label>
                  <Input 
                    id="name-input"
                    className="bg-zinc-900 border border-zinc-600 text-white text-lg h-14 text-center dark:bg-zinc-800"
                    placeholder="Your Name / आपका नाम"
                    value={nameInput}
                    onChange={handleNameInputChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                  />
                </div>
                
                <SpiritualIconSelector selectedIcon={selectedIcon} onSelectIcon={handleIconSelect} />
                
                <Button 
                  className="bg-amber-500 hover:bg-amber-600 text-black w-full h-12 text-lg"
                  onClick={handleNameSubmit}
                >
                  Start My Journey / मेरी यात्रा शुरू करें
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white dark:bg-zinc-900">
      <header className="py-4 px-4 flex justify-between items-center">
        <Button 
          variant="ghost" 
          size="icon"
          className="text-amber-400 hover:bg-zinc-800"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold text-amber-400">Spiritual ID</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button 
            variant="ghost" 
            size="icon"
            className="text-amber-400 hover:bg-zinc-800"
            onClick={() => navigate('/')}
          >
            <Home className="h-6 w-6" />
          </Button>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md">
          {isNewUser ? (
            <div className="bg-amber-500/20 border-2 border-amber-500 rounded-lg p-6 mb-8 animate-fade-in">
              <div className="text-center mb-6">
                <div className="text-6xl mb-2">{iconSymbol}</div>
                <h2 className="text-2xl font-bold text-amber-400 mb-3">
                  Welcome, {spiritualName ? `${spiritualName} Ji` : 'Spiritual Seeker'}
                </h2>
                <p className="text-gray-300 mb-1">Your unique spiritual number has been created</p>
                <p className="text-amber-300 text-sm">आपका विशिष्ट आध्यात्मिक नंबर बना दिया गया है</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-1 rounded-lg mb-6">
                  <div className="bg-black rounded-lg p-4 text-center dark:bg-zinc-900">
                    <p className="text-gray-400 text-xs mb-1">Your Spiritual ID / आपका आध्यात्मिक आईडी</p>
                    <p className="text-3xl md:text-4xl font-bold tracking-wider text-amber-400">{spiritualId}</p>
                  </div>
                </div>
                
                <div className="bg-zinc-800/80 rounded-lg p-4 mb-6 text-sm dark:bg-zinc-800/50">
                  <p className="text-gray-200 mb-2">
                    Your spiritual number helps save your progress. Please write down this number: <span className="font-bold text-amber-400">{spiritualId}</span>. You will need it if you use a different phone or computer.
                  </p>
                  <p className="text-gray-300 text-xs">
                    आपका आध्यात्मिक नंबर आपकी प्रगति को सहेजने में मदद करता है। कृपया इस नंबर को लिख लें: <span className="font-bold text-amber-400">{spiritualId}</span>। अगर आप दूसरा फोन या कंप्यूटर इस्तेमाल करते हैं, तो आपको यह नंबर चाहिए होगा।
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-800/80 border border-zinc-700 rounded-lg p-6 mb-8 dark:bg-zinc-800/50">
              <div className="text-center mb-6">
                <div className="text-6xl mb-2">{iconSymbol}</div>
                <h2 className="text-xl font-bold text-amber-400 mb-2">
                  {spiritualName ? `${spiritualName} Ji, आपका स्वागत है` : 'Your Spiritual Identity'}
                </h2>
                <p className="text-gray-300 text-sm">आपकी आध्यात्मिक पहचान</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-1 rounded-lg mb-6">
                  <div className="bg-black rounded-lg p-4 text-center dark:bg-zinc-900">
                    <p className="text-gray-400 text-xs mb-1">Spiritual ID / आध्यात्मिक आईडी</p>
                    <p className="text-3xl md:text-4xl font-bold tracking-wider text-amber-400">{spiritualId}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Input section for users to enter their ID on a new device */}
          {showInputField ? (
            <div className="bg-zinc-800/80 border border-zinc-700 rounded-lg p-6 mb-8 dark:bg-zinc-800/50">
              <h3 className="text-lg font-medium text-amber-400 mb-2">Enter Your Spiritual ID</h3>
              <p className="text-gray-300 text-sm mb-4">अपना आध्यात्मिक आईडी दर्ज करें</p>
              
              <div className="mb-4">
                <Input 
                  className={`bg-zinc-900 border ${
                    inputValid === null ? 'border-zinc-600' : 
                    inputValid ? 'border-green-500' : 'border-red-500'
                  } text-amber-400 text-xl text-center tracking-wider h-16 dark:bg-zinc-800`}
                  placeholder="OMName123A"
                  value={inputId}
                  onChange={handleInputChange}
                  maxLength={15}
                />
                
                {inputValid === false && (
                  <p className="text-red-500 text-sm mt-2">
                    Invalid format. IDs usually start with OM and have your name followed by numbers.
                    <br />
                    अमान्य प्रारूप। आईडी आमतौर पर OM से शुरू होती है और इसके बाद आपका नाम और अंक होते हैं।
                  </p>
                )}
                
                {inputValid === true && (
                  <p className="text-green-500 text-sm mt-2">
                    Valid spiritual ID format! ✓
                    <br />
                    मान्य आध्यात्मिक आईडी प्रारूप! ✓
                  </p>
                )}
              </div>
              
              <SpiritualIconSelector selectedIcon={selectedIcon} onSelectIcon={handleIconSelect} />
              
              <div className="flex gap-2 mt-4">
                <Button 
                  className="bg-amber-500 hover:bg-amber-600 text-black flex-1"
                  onClick={handleSubmitId}
                  disabled={!inputId || inputValid === false}
                >
                  Confirm / पुष्टि करें
                </Button>
                <Button 
                  className="bg-zinc-700 hover:bg-zinc-600 text-white"
                  onClick={() => setShowInputField(false)}
                >
                  Cancel / रद्द करें
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 w-full mb-4 dark:bg-zinc-800/70"
              onClick={() => setShowInputField(true)}
            >
              Enter Different ID / अलग आईडी दर्ज करें
            </Button>
          )}
          
          {/* Logout button */}
          <Button 
            className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 w-full mb-8 flex items-center justify-center gap-2 dark:bg-zinc-800/70"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span>Logout / लॉग आउट करें</span>
          </Button>
          
          {/* Sharing options */}
          <div className="bg-zinc-800/80 border border-zinc-700 rounded-lg p-6 dark:bg-zinc-800/50">
            <h3 className="text-lg font-medium text-amber-400 mb-4 text-center">
              Share Your Spiritual ID
              <br />
              <span className="text-sm font-normal text-gray-300">अपना आध्यात्मिक आईडी साझा करें</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 flex flex-col items-center py-6 dark:bg-zinc-800/70"
                onClick={handleDownloadScreenshot}
              >
                <Download className="h-6 w-6 mb-2" />
                <span>Screenshot</span>
                <span className="text-xs text-gray-400">स्क्रीनशॉट</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 flex flex-col items-center py-6 dark:bg-zinc-800/70"
                onClick={handleShareWhatsApp}
              >
                <Share2 className="h-6 w-6 mb-2" />
                <span>WhatsApp</span>
                <span className="text-xs text-gray-400">व्हाट्सएप</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 flex flex-col items-center py-6 dark:bg-zinc-800/70"
                onClick={handlePrint}
              >
                <Printer className="h-6 w-6 mb-2" />
                <span>Print Card</span>
                <span className="text-xs text-gray-400">प्रिंट कार्ड</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 flex flex-col items-center py-6 dark:bg-zinc-800/70"
                onClick={handleQrCode}
              >
                <QrCode className="h-6 w-6 mb-2" />
                <span>QR Code</span>
                <span className="text-xs text-gray-400">क्यूआर कोड</span>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SpiritualIdPage;
