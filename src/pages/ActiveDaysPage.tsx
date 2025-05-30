
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Flame, Target, TrendingUp, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  getActivityData, 
  getStreakData, 
  getAchievementStats,
  getActivityLevel,
  getActivityIcon,
  ACHIEVEMENT_CATEGORIES,
  type AchievementCategory 
} from "@/utils/activityUtils";
import ModernCard from "@/components/ModernCard";

interface ActivityData {
  [date: string]: number;
}

interface StreakData {
  currentStreak: number;
  maxStreak: number;
  totalActiveDays: number;
}

const ActiveDaysPage: React.FC = () => {
  const navigate = useNavigate();
  const [activityData, setActivityData] = useState<ActivityData>({});
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    maxStreak: 0,
    totalActiveDays: 0
  });
  const [achievementStats, setAchievementStats] = useState<{[categoryId: string]: number}>({});
  const [hoveredDay, setHoveredDay] = useState<{date: string, count: number} | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [activity, streaks, achievements] = await Promise.all([
          getActivityData(),
          getStreakData(),
          getAchievementStats()
        ]);
        
        setActivityData(activity);
        setStreakData(streaks);
        setAchievementStats(achievements);
      } catch (error) {
        console.error("Failed to load active days data:", error);
      }
    };
    loadData();
  }, []);

  const generateCalendarData = () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364);
    
    const days = [];
    const currentDay = new Date(startDate);
    
    while (currentDay <= today) {
      const dateStr = currentDay.toISOString().split('T')[0];
      const count = activityData[dateStr] || 0;
      const isToday = dateStr === today.toISOString().split('T')[0];
      
      days.push({
        date: dateStr,
        count,
        isToday,
        dayOfWeek: currentDay.getDay(),
        month: currentDay.getMonth(),
        dayOfMonth: currentDay.getDate(),
        displayDate: new Date(currentDay),
        icon: getActivityIcon(count)
      });
      
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const calendarDays = generateCalendarData();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800 p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 max-w-6xl mx-auto">
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-100/50 dark:hover:bg-amber-900/20 backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Button>
        <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent text-center">
          Active Days
        </h1>
        <div className="w-28"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-8 lg:mb-12 max-w-6xl mx-auto">
        <ModernCard className="p-6 lg:p-8 bg-gradient-to-br from-orange-400/20 to-red-500/20 border-orange-300/30 dark:border-orange-600/30" gradient>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <Flame className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg lg:text-xl font-semibold text-orange-600 dark:text-orange-400 mb-1">Current Streak</h3>
              <div className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{streakData.currentStreak}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">days in a row</p>
            </div>
          </div>
        </ModernCard>

        <ModernCard className="p-6 lg:p-8 bg-gradient-to-br from-emerald-400/20 to-green-500/20 border-emerald-300/30 dark:border-emerald-600/30" gradient>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg lg:text-xl font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Max Streak</h3>
              <div className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{streakData.maxStreak}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">personal best</p>
            </div>
          </div>
        </ModernCard>

        <ModernCard className="p-6 lg:p-8 bg-gradient-to-br from-purple-400/20 to-indigo-500/20 border-purple-300/30 dark:border-purple-600/30" gradient>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
              <Target className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg lg:text-xl font-semibold text-purple-600 dark:text-purple-400 mb-1">Total Active Days</h3>
              <div className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{streakData.totalActiveDays}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">lifetime practice</p>
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Achievement Categories */}
      <div className="max-w-6xl mx-auto mb-8 lg:mb-12">
        <ModernCard className="p-6 lg:p-8 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl border-amber-200/50 dark:border-amber-700/50" gradient>
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-6 h-6 lg:w-7 lg:h-7 text-amber-600 dark:text-amber-400" />
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Achievement Categories</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Your progress across different levels of spiritual practice</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {ACHIEVEMENT_CATEGORIES.map((category: AchievementCategory) => (
              <div
                key={category.id}
                className={`p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 ${category.color} text-center transition-all duration-300 hover:scale-105`}
              >
                <div className="text-3xl mb-2">{category.icon}</div>
                <h3 className="font-semibold text-sm mb-1">{category.name}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{category.description}</p>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {achievementStats[category.id] || 0}
                  <span className="text-xs font-normal ml-1">days</span>
                </div>
              </div>
            ))}
          </div>
        </ModernCard>
      </div>

      {/* Calendar Grid */}
      <div className="max-w-6xl mx-auto">
        <ModernCard className="p-6 lg:p-8 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl border-amber-200/50 dark:border-amber-700/50" gradient>
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-6 h-6 lg:w-7 lg:h-7 text-amber-600 dark:text-amber-400" />
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Activity Calendar</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Your spiritual practice journey over the past year</p>
          </div>

          <div className="space-y-4">
            {/* Weekday Labels */}
            <div className="flex gap-1 lg:gap-2 ml-12 lg:ml-16">
              {weekdays.map((day) => (
                <div key={day} className="w-6 h-6 lg:w-8 lg:h-8 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
                  {day[0]}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="flex gap-1 lg:gap-2 overflow-x-auto pb-4">
              {Array.from({ length: 53 }, (_, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1 lg:gap-2">
                  {/* Month label */}
                  {weekIndex === 0 || (calendarDays[weekIndex * 7] && calendarDays[weekIndex * 7].displayDate.getDate() <= 7) ? (
                    <div className="h-4 lg:h-6 text-xs text-gray-500 dark:text-gray-400 mb-1 lg:mb-2 min-w-[48px] lg:min-w-[64px]">
                      {calendarDays[weekIndex * 7] && months[calendarDays[weekIndex * 7].month]}
                    </div>
                  ) : (
                    <div className="h-4 lg:h-6 mb-1 lg:mb-2"></div>
                  )}
                  
                  {Array.from({ length: 7 }, (_, dayIndex) => {
                    const dayData = calendarDays[weekIndex * 7 + dayIndex];
                    if (!dayData) return <div key={dayIndex} className="w-6 h-6 lg:w-8 lg:h-8"></div>;
                    
                    return (
                      <div
                        key={dayIndex}
                        className={`w-6 h-6 lg:w-8 lg:h-8 rounded-sm cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-amber-400 relative flex items-center justify-center ${
                          getActivityLevel(dayData.count)
                        } ${dayData.isToday ? 'ring-2 ring-amber-500' : ''}`}
                        onMouseEnter={(e) => {
                          setHoveredDay({ date: dayData.date, count: dayData.count });
                          handleMouseMove(e);
                        }}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={() => setHoveredDay(null)}
                      >
                        {dayData.icon && (
                          <span className="text-xs lg:text-sm">{dayData.icon}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 lg:gap-3 text-xs lg:text-sm text-gray-500 dark:text-gray-400 justify-center flex-wrap">
              <span>Less</span>
              <div className="w-4 h-4 lg:w-6 lg:h-6 bg-gray-200/50 dark:bg-gray-700/50 rounded-sm"></div>
              {ACHIEVEMENT_CATEGORIES.slice(0, 4).map(category => (
                <div 
                  key={category.id}
                  className={`w-4 h-4 lg:w-6 lg:h-6 rounded-sm flex items-center justify-center ${category.color}`}
                  title={category.description}
                >
                  <span className="text-xs">{category.icon}</span>
                </div>
              ))}
              <span>More</span>
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Tooltip */}
      {hoveredDay && (
        <div
          className="fixed z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-amber-200/50 dark:border-amber-700/50 rounded-xl px-4 py-3 text-sm pointer-events-none shadow-xl"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y - 50,
          }}
        >
          <div className="text-gray-900 dark:text-white font-medium mb-1">
            {new Date(hoveredDay.date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
          <div className="text-amber-600 dark:text-amber-400">
            {hoveredDay.count} jaaps completed
          </div>
          {hoveredDay.count >= 5 && (
            <div className="text-emerald-600 dark:text-emerald-400 text-xs mt-1">
              Achievement unlocked! {getActivityIcon(hoveredDay.count)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActiveDaysPage;
