import React from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
const ActiveDaysButton: React.FC = () => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/active-days');
  };
  return <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <Button onClick={handleClick} className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-amber-400/30 px-[24px] mx-0 my-[25px]">
        <Calendar className="w-5 h-5 mr-2" />
        <span className="font-medium">Active Days</span>
        <Flame className="w-4 h-4 ml-2 text-orange-300" />
      </Button>
    </div>;
};
export default ActiveDaysButton;