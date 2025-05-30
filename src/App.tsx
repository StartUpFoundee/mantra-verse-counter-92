
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import HomePage from "@/pages/HomePage";
import ManualCounterPage from "@/pages/ManualCounterPage";
import AudioCounterPage from "@/pages/AudioCounterPage";
import ActiveDaysPage from "@/pages/ActiveDaysPage";
import SpiritualIdPage from "@/pages/SpiritualIdPage";
import IdentityGuidePage from "@/pages/IdentityGuidePage";
import WelcomeScreen from "@/components/WelcomeScreen";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/welcome" element={<WelcomeScreen />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/manual" element={<ManualCounterPage />} />
          <Route path="/audio" element={<AudioCounterPage />} />
          <Route path="/active-days" element={<ActiveDaysPage />} />
          <Route path="/spiritual-id" element={<SpiritualIdPage />} />
          <Route path="/identity-guide" element={<IdentityGuidePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-center" />
      </div>
    </Router>
  );
}

export default App;
