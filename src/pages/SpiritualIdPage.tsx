
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Download, Share2, Printer, QrCode } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { generateSpiritualId, validateSpiritualId } from "@/utils/spiritualIdUtils";

const SpiritualIdPage: React.FC = () => {
  const navigate = useNavigate();
  const [spiritualId, setSpiritualId] = useState<string>("");
  const [inputId, setInputId] = useState<string>("");
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const [showInputField, setShowInputField] = useState<boolean>(false);
  const [inputValid, setInputValid] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user already has a spiritual ID stored
    const storedId = localStorage.getItem("spiritualID");
    
    if (storedId) {
      setSpiritualId(storedId);
      setIsNewUser(false);
    } else {
      // Generate a new spiritual ID for first time users
      const newId = generateSpiritualId();
      setSpiritualId(newId);
      localStorage.setItem("spiritualID", newId);
      setIsNewUser(true);
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

  const handleSubmitId = () => {
    const isValid = validateSpiritualId(inputId);
    setInputValid(isValid);
    
    if (isValid) {
      // If valid, update the stored ID
      localStorage.setItem("spiritualID", inputId);
      setSpiritualId(inputId);
      setShowInputField(false);
      toast.success("Spiritual ID updated successfully!", {
        style: { background: '#262626', color: '#fcd34d' }
      });
    } else {
      toast.error("Invalid spiritual ID format", {
        style: { background: '#262626', color: '#ea384c' }
      });
    }
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

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
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
        <Button 
          variant="ghost" 
          size="icon"
          className="text-amber-400 hover:bg-zinc-800"
          onClick={() => navigate('/')}
        >
          <Home className="h-6 w-6" />
        </Button>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md">
          {isNewUser ? (
            <div className="bg-amber-500/20 border-2 border-amber-500 rounded-lg p-6 mb-8 animate-fade-in">
              <div className="text-center mb-6">
                <div className="text-6xl mb-2">🕉️</div>
                <h2 className="text-2xl font-bold text-amber-400 mb-3">Welcome, Spiritual Seeker</h2>
                <p className="text-gray-300 mb-1">Your unique spiritual number has been created</p>
                <p className="text-amber-300 text-sm">आपका विशिष्ट आध्यात्मिक नंबर बना दिया गया है</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-1 rounded-lg mb-6">
                  <div className="bg-black rounded-lg p-4 text-center">
                    <p className="text-gray-400 text-xs mb-1">Your Spiritual ID / आपका आध्यात्मिक आईडी</p>
                    <p className="text-3xl md:text-4xl font-bold tracking-wider text-amber-400">{spiritualId}</p>
                  </div>
                </div>
                
                <div className="bg-zinc-800/80 rounded-lg p-4 mb-6 text-sm">
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
            <div className="bg-zinc-800/80 border border-zinc-700 rounded-lg p-6 mb-8">
              <div className="text-center mb-6">
                <div className="text-6xl mb-2">🕉️</div>
                <h2 className="text-xl font-bold text-amber-400 mb-2">Your Spiritual Identity</h2>
                <p className="text-gray-300 text-sm">आपकी आध्यात्मिक पहचान</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-1 rounded-lg mb-6">
                  <div className="bg-black rounded-lg p-4 text-center">
                    <p className="text-gray-400 text-xs mb-1">Spiritual ID / आध्यात्मिक आईडी</p>
                    <p className="text-3xl md:text-4xl font-bold tracking-wider text-amber-400">{spiritualId}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Input section for users to enter their ID on a new device */}
          {showInputField ? (
            <div className="bg-zinc-800/80 border border-zinc-700 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-medium text-amber-400 mb-2">Enter Your Spiritual ID</h3>
              <p className="text-gray-300 text-sm mb-4">अपना आध्यात्मिक आईडी दर्ज करें</p>
              
              <div className="mb-4">
                <Input 
                  className={`bg-zinc-900 border ${
                    inputValid === null ? 'border-zinc-600' : 
                    inputValid ? 'border-green-500' : 'border-red-500'
                  } text-amber-400 text-xl text-center tracking-wider h-16`}
                  placeholder="OM1234AB"
                  value={inputId}
                  onChange={handleInputChange}
                  maxLength={8}
                />
                
                {inputValid === false && (
                  <p className="text-red-500 text-sm mt-2">
                    Invalid format. IDs usually start with OM and have 6-8 characters.
                    <br />
                    अमान्य प्रारूप। आईडी आमतौर पर OM से शुरू होती है और इसमें 6-8 अक्षर होते हैं।
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
              
              <div className="flex gap-2">
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
              className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 w-full mb-8"
              onClick={() => setShowInputField(true)}
            >
              Enter Different ID / अलग आईडी दर्ज करें
            </Button>
          )}
          
          {/* Sharing options */}
          <div className="bg-zinc-800/80 border border-zinc-700 rounded-lg p-6">
            <h3 className="text-lg font-medium text-amber-400 mb-4 text-center">
              Share Your Spiritual ID
              <br />
              <span className="text-sm font-normal text-gray-300">अपना आध्यात्मिक आईडी साझा करें</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 flex flex-col items-center py-6"
                onClick={handleDownloadScreenshot}
              >
                <Download className="h-6 w-6 mb-2" />
                <span>Screenshot</span>
                <span className="text-xs text-gray-400">स्क्रीनशॉट</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 flex flex-col items-center py-6"
                onClick={handleShareWhatsApp}
              >
                <Share2 className="h-6 w-6 mb-2" />
                <span>WhatsApp</span>
                <span className="text-xs text-gray-400">व्हाट्सएप</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 flex flex-col items-center py-6"
                onClick={handlePrint}
              >
                <Printer className="h-6 w-6 mb-2" />
                <span>Print Card</span>
                <span className="text-xs text-gray-400">प्रिंट कार्ड</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 flex flex-col items-center py-6"
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
