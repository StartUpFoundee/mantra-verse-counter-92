import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ThemeToggle from "@/components/ThemeToggle";
import ProfileHeader from "@/components/ProfileHeader";
import ModernCard from "@/components/ModernCard";

const IdentityGuidePage: React.FC = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<"english" | "hindi">("english");

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800">
      <header className="py-4 lg:py-6 px-4 lg:px-8 flex justify-between items-center">
        <Button 
          variant="ghost" 
          size="icon"
          className="text-amber-600 dark:text-amber-400 hover:bg-white/50 dark:hover:bg-zinc-800/50 w-10 h-10 lg:w-12 lg:h-12"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5 lg:h-6 lg:w-6" />
        </Button>
        <h1 className="text-xl lg:text-2xl font-bold text-amber-600 dark:text-amber-400">Identity Management Guide</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ProfileHeader />
          <Button 
            variant="ghost" 
            size="icon"
            className="text-amber-600 dark:text-amber-400 hover:bg-white/50 dark:hover:bg-zinc-800/50 w-10 h-10 lg:w-12 lg:h-12"
            onClick={() => navigate('/')}
          >
            <Home className="h-5 w-5 lg:h-6 lg:w-6" />
          </Button>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-start p-4 lg:p-8">
        <div className="w-full max-w-4xl">
          <Tabs defaultValue="english" className="mb-6">
            <TabsList className="grid w-full grid-cols-2 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm border border-amber-200/50 dark:border-zinc-700/50">
              <TabsTrigger 
                value="english"
                onClick={() => setLanguage("english")}
                className={`text-base lg:text-lg ${language === "english" ? "data-[state=active]:bg-amber-500 data-[state=active]:text-white" : ""}`}
              >
                English
              </TabsTrigger>
              <TabsTrigger 
                value="hindi"
                onClick={() => setLanguage("hindi")}
                className={`text-base lg:text-lg ${language === "hindi" ? "data-[state=active]:bg-amber-500 data-[state=active]:text-white" : ""}`}
              >
                हिन्दी (Hindi)
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="english" className="mt-6">
              <ModernCard className="p-6 lg:p-8 border-amber-200/50 dark:border-amber-700/50" gradient>
                <div className="space-y-6 lg:space-y-8">
                  <section>
                    <h2 className="text-2xl lg:text-3xl font-bold text-amber-600 dark:text-amber-400 mb-4">Managing Your Spiritual Identity</h2>
                    
                    <h3 className="text-lg lg:text-xl font-semibold text-amber-500 dark:text-amber-300 mb-3">What is your Identity?</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4 text-base lg:text-lg leading-relaxed">
                      Your spiritual identity in our app consists of your chosen name, date of birth, and spiritual symbol. 
                      This identity helps personalize your chanting experience.
                    </p>
                    
                    <h3 className="text-lg lg:text-xl font-semibold text-amber-500 dark:text-amber-300 mb-3">Your Unique ID</h3>
                    <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-2 mb-4 text-base lg:text-lg leading-relaxed">
                      <li>Your ID follows the format: DDMMYYYY_XXXX</li>
                      <li>The first part is your date of birth (e.g., 15082000 for August 15, 2000)</li>
                      <li>The second part is a unique number generated when you created your account</li>
                      <li>This format makes it easy to remember - just know your birthday and the 4 digits</li>
                    </ul>
                    
                    <h3 className="text-lg lg:text-xl font-semibold text-amber-500 dark:text-amber-300 mb-3">How to Recover Your ID</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-2 text-base lg:text-lg">If you forget your full ID but remember your date of birth:</p>
                    <ol className="list-decimal pl-5 text-gray-700 dark:text-gray-300 space-y-2 mb-4 text-base lg:text-lg leading-relaxed">
                      <li>Click on "Enter Different ID" on the login screen</li>
                      <li>Enter your date of birth</li>
                      <li>The system will help you recover your ID</li>
                      <li>Select your ID to access your account</li>
                    </ol>
                    
                    <h3 className="text-lg lg:text-xl font-semibold text-amber-500 dark:text-amber-300 mb-3">How Your Identity is Stored</h3>
                    <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-2 mb-4 text-base lg:text-lg leading-relaxed">
                      <li>Your identity is stored locally on your device using browser storage</li>
                      <li>No data is sent to external servers</li>
                      <li>Your information remains private and accessible only on your current device</li>
                    </ul>
                  </section>
                  
                  <section>
                    <h3 className="text-lg lg:text-xl font-semibold text-amber-500 dark:text-amber-300 mb-3">Accessing Your Identity on Different Devices</h3>
                    
                    <h4 className="font-medium text-amber-400 dark:text-amber-200 mb-2 text-base lg:text-lg">On Chrome Browser:</h4>
                    <ol className="list-decimal pl-5 text-gray-700 dark:text-gray-300 space-y-2 mb-4 text-base lg:text-lg leading-relaxed">
                      <li>Simply enter your ID on the login screen</li>
                      <li>Alternatively, use the ID recovery option with your date of birth</li>
                      <li>Your profile will be restored with all your chanting history</li>
                    </ol>
                    
                    <h4 className="font-medium text-amber-400 dark:text-amber-200 mb-2 text-base lg:text-lg">On Mobile Devices:</h4>
                    <ol className="list-decimal pl-5 text-gray-700 dark:text-gray-300 space-y-2 mb-4 text-base lg:text-lg leading-relaxed">
                      <li>Use the same ID on any device to access your profile</li>
                      <li>For best experience, add our website to your home screen</li>
                      <li>Your identity will remain saved as long as you don't clear browser data</li>
                    </ol>
                  </section>
                  
                  <section>
                    <h3 className="text-lg lg:text-xl font-semibold text-amber-500 dark:text-amber-300 mb-3">Security Considerations</h3>
                    <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-2 mb-4 text-base lg:text-lg leading-relaxed">
                      <li>Anyone with access to your device can access your profile</li>
                      <li>To protect your data, logout when using shared devices</li>
                      <li>Remember your unique ID to recover your account on any device</li>
                    </ul>
                    
                    <h3 className="text-lg lg:text-xl font-semibold text-amber-500 dark:text-amber-300 mb-3">Troubleshooting</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-2 text-base lg:text-lg">If you can't access your account:</p>
                    <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-2 mb-4 text-base lg:text-lg leading-relaxed">
                      <li>Check if you've entered your ID correctly</li>
                      <li>Try the ID recovery option with your date of birth</li>
                      <li>Make sure you haven't cleared browser data recently</li>
                      <li>Create a new identity if needed</li>
                    </ul>
                  </section>
                </div>
              </ModernCard>
            </TabsContent>
            
            <TabsContent value="hindi" className="mt-6">
              <ModernCard className="p-6 lg:p-8 border-amber-200/50 dark:border-amber-700/50" gradient>
                <div className="space-y-6 lg:space-y-8">
                  <section>
                    <h2 className="text-2xl lg:text-3xl font-bold text-amber-600 dark:text-amber-400 mb-4">आपकी आध्यात्मिक पहचान का प्रबंधन</h2>
                    
                    <h3 className="text-lg lg:text-xl font-semibold text-amber-500 dark:text-amber-300 mb-3">आपकी पहचान क्या है?</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4 text-base lg:text-lg leading-relaxed">
                      हमारे ऐप में आपकी आध्यात्मिक पहचान में आपका चुना हुआ नाम, जन्म तिथि और आध्यात्मिक प्रतीक शामिल है। 
                      यह पहचान आपके जप अनुभव को व्यक्तिगत बनाने में मदद करती है।
                    </p>
                    
                    <h3 className="text-lg lg:text-xl font-semibold text-amber-500 dark:text-amber-300 mb-3">आपकी अनूठी आईडी</h3>
                    <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-2 mb-4 text-base lg:text-lg leading-relaxed">
                      <li>आपकी आईडी इस प्रारूप का अनुसरण करती है: DDMMYYYY_XXXX</li>
                      <li>पहला भाग आपकी जन्म तिथि है (उदाहरण के लिए, 15 अगस्त 2000 के लिए 15082000)</li>
                      <li>दूसरा भाग एक अनूठा नंबर है जो आपके खाता बनाते समय उत्पन्न होता है</li>
                      <li>यह प्रारूप याद रखना आसान बनाता है - बस अपना जन्मदिन और 4 अंक जानें</li>
                    </ul>
                    
                    <h3 className="text-lg lg:text-xl font-semibold text-amber-500 dark:text-amber-300 mb-3">अपनी आईडी को पुनः प्राप्त कैसे करें</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-2 text-base lg:text-lg">यदि आप अपनी पूरी आईडी भूल जाते हैं लेकिन अपनी जन्म तिथि याद है:</p>
                    <ol className="list-decimal pl-5 text-gray-700 dark:text-gray-300 space-y-2 mb-4 text-base lg:text-lg leading-relaxed">
                      <li>लॉगिन स्क्रीन पर "अलग आईडी दर्ज करें" पर क्लिक करें</li>
                      <li>अपनी जन्म तिथि दर्ज करें</li>
                      <li>सिस्टम आपको आपकी आईडी पुनर्प्राप्त करने में मदद करेगा</li>
                      <li>अपने खाते तक पहुंचने के लिए अपनी आईडी का चयन करें</li>
                    </ol>
                    
                    <h3 className="text-lg lg:text-xl font-semibold text-amber-500 dark:text-amber-300 mb-3">आपकी पहचान कैसे संग्रहीत की जाती है</h3>
                    <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-2 mb-4 text-base lg:text-lg leading-relaxed">
                      <li>आपकी पहचान ब्राउज़र स्टोरेज का उपयोग करके आपके डिवाइस पर स्थानीय रूप से संग्रहीत की जाती है</li>
                      <li>कोई डेटा बाहरी सर्वर पर नहीं भेजा जाता है</li>
                      <li>आपकी जानकारी निजी रहती है और केवल आपके वर्तमान डिवाइस पर ही पहुंच योग्य होती है</li>
                    </ul>
                  </section>
                  
                  <section>
                    <h3 className="text-lg lg:text-xl font-semibold text-amber-500 dark:text-amber-300 mb-3">विभिन्न डिवाइसों पर अपनी पहचान तक पहुंचना</h3>
                    
                    <h4 className="font-medium text-amber-400 dark:text-amber-200 mb-2 text-base lg:text-lg">Chrome ब्राउज़र पर:</h4>
                    <ol className="list-decimal pl-5 text-gray-700 dark:text-gray-300 space-y-2 mb-4 text-base lg:text-lg leading-relaxed">
                      <li>लॉगिन स्क्रीन पर अपनी आईडी दर्ज करें</li>
                      <li>वैकल्पिक रूप से, अपनी जन्म तिथि के साथ आईडी पुनर्प्राप्ति विकल्प का उपयोग करें</li>
                      <li>आपकी प्रोफ़ाइल आपके सभी जप इतिहास के साथ पुनर्स्थापित की जाएगी</li>
                    </ol>
                    
                    <h4 className="font-medium text-amber-400 dark:text-amber-200 mb-2 text-base lg:text-lg">मोबाइल डिवाइस पर:</h4>
                    <ol className="list-decimal pl-5 text-gray-700 dark:text-gray-300 space-y-2 mb-4 text-base lg:text-lg leading-relaxed">
                      <li>अपनी प्रोफ़ाइल तक पहुंचने के लिए किसी भी डिवाइस पर समान आईडी का उपयोग करें</li>
                      <li>सर्वोत्तम अनुभव के लिए, हमारी वेबसाइट को अपनी होम स्क्रीन पर जोड़ें</li>
                      <li>जब तक आप ब्राउज़र डेटा साफ़ नहीं करते, तब तक आपकी पहचान सहेजी रहेगी</li>
                    </ol>
                  </section>
                  
                  <section>
                    <h3 className="text-lg lg:text-xl font-semibold text-amber-500 dark:text-amber-300 mb-3">सुरक्षा विचार</h3>
                    <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-2 mb-4 text-base lg:text-lg leading-relaxed">
                      <li>आपके डिवाइस तक पहुंच रखने वाला कोई भी व्यक्ति आपकी प्रोफ़ाइल तक पहुंच सकता है</li>
                      <li>अपने डेटा की सुरक्षा के लिए, साझा डिवाइस का उपयोग करते समय लॉगआउट करें</li>
                      <li>किसी भी डिवाइस पर अपना खाता पुनर्प्राप्त करने के लिए अपनी अनूठी आईडी याद रखें</li>
                    </ul>
                    
                    <h3 className="text-lg lg:text-xl font-semibold text-amber-500 dark:text-amber-300 mb-3">समस्या निवारण</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-2 text-base lg:text-lg">यदि आप अपने खाते तक नहीं पहुंच सकते हैं:</p>
                    <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-2 mb-4 text-base lg:text-lg leading-relaxed">
                      <li>जांचें कि क्या आपने अपनी आईडी सही दर्ज की है</li>
                      <li>अपनी जन्म तिथि के साथ आईडी पुनर्प्राप्ति विकल्प का प्रयास करें</li>
                      <li>सुनिश्चित करें कि आपने हाल ही में ब्राउज़र डेटा साफ़ नहीं किया है</li>
                      <li>यदि आवश्यक हो तो नई पहचान बनाएं</li>
                    </ul>
                  </section>
                </div>
              </ModernCard>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default IdentityGuidePage;
