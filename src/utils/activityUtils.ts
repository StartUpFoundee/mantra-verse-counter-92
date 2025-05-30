
import { getData, storeData, getAllData } from './indexedDBUtils';

const STORES = {
  activity: "activityData"
};

export interface DailyActivity {
  date: string;
  count: number;
  timestamp: number;
}

export interface StreakData {
  currentStreak: number;
  maxStreak: number;
  totalActiveDays: number;
}

export interface AchievementCategory {
  id: string;
  name: string;
  range: { min: number; max: number };
  icon: string;
  color: string;
  description: string;
}

// Achievement categories for Naam Japa
export const ACHIEVEMENT_CATEGORIES: AchievementCategory[] = [
  {
    id: 'beginner',
    name: 'Beginner',
    range: { min: 5, max: 108 },
    icon: '🌱',
    color: 'bg-green-200/70 dark:bg-green-800/50',
    description: '5-108 Jaaps'
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    range: { min: 109, max: 500 },
    icon: '🌿',
    color: 'bg-emerald-300/80 dark:bg-emerald-700/60',
    description: '109-500 Jaaps'
  },
  {
    id: 'committed',
    name: 'Committed',
    range: { min: 501, max: 1000 },
    icon: '🌳',
    color: 'bg-emerald-400/90 dark:bg-emerald-600/70',
    description: '501-1000 Jaaps'
  },
  {
    id: 'devotee',
    name: 'Devotee',
    range: { min: 1001, max: 1500 },
    icon: '🏆',
    color: 'bg-yellow-400/90 dark:bg-yellow-600/70',
    description: '1001-1500 Jaaps'
  },
  {
    id: 'master',
    name: 'Master',
    range: { min: 1501, max: 2100 },
    icon: '👑',
    color: 'bg-purple-400/90 dark:bg-purple-600/70',
    description: '1501-2100 Jaaps'
  },
  {
    id: 'saint',
    name: 'Saint',
    range: { min: 2101, max: Infinity },
    icon: '✨',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    description: '2100+ Jaaps'
  }
];

/**
 * Get achievement category for a given count
 */
export const getAchievementCategory = (count: number): AchievementCategory | null => {
  if (count < 5) return null; // Minimum threshold for any achievement
  
  return ACHIEVEMENT_CATEGORIES.find(category => 
    count >= category.range.min && count <= category.range.max
  ) || null;
};

/**
 * Get achievement icon for a given count
 */
export const getActivityIcon = (count: number): string => {
  const category = getAchievementCategory(count);
  return category ? category.icon : '';
};

/**
 * Get activity level (for backward compatibility)
 */
export const getActivityLevel = (count: number): string => {
  if (count === 0) return "bg-gray-200/50 dark:bg-gray-700/50";
  
  const category = getAchievementCategory(count);
  return category ? category.color : "bg-gray-200/50 dark:bg-gray-700/50";
};

/**
 * Record daily activity when user completes jaaps
 */
export const recordDailyActivity = async (count: number = 1): Promise<void> => {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    // Get existing activity for today
    const existingActivity = await getData(STORES.activity, today);
    const currentCount = existingActivity ? existingActivity.count : 0;
    
    // Update activity count
    const activityData: DailyActivity = {
      date: today,
      count: currentCount + count,
      timestamp: Date.now()
    };
    
    await storeData(STORES.activity, activityData, today);
    
    // Log achievement if reached
    const category = getAchievementCategory(activityData.count);
    if (category && currentCount < category.range.min && activityData.count >= category.range.min) {
      console.log(`Achievement unlocked: ${category.name} (${category.description})`);
    }
  } catch (error) {
    console.error("Failed to record daily activity:", error);
  }
};

/**
 * Get all activity data for calendar display
 */
export const getActivityData = async (): Promise<{[date: string]: number}> => {
  try {
    const allActivity = await getAllData(STORES.activity);
    const activityMap: {[date: string]: number} = {};
    
    allActivity.forEach((activity: DailyActivity) => {
      activityMap[activity.date] = activity.count;
    });
    
    return activityMap;
  } catch (error) {
    console.error("Failed to get activity data:", error);
    return {};
  }
};

/**
 * Get achievement statistics
 */
export const getAchievementStats = async (): Promise<{[categoryId: string]: number}> => {
  try {
    const activityData = await getActivityData();
    const stats: {[categoryId: string]: number} = {};
    
    // Initialize all categories with 0
    ACHIEVEMENT_CATEGORIES.forEach(category => {
      stats[category.id] = 0;
    });
    
    // Count days in each category
    Object.values(activityData).forEach(count => {
      const category = getAchievementCategory(count);
      if (category) {
        stats[category.id]++;
      }
    });
    
    return stats;
  } catch (error) {
    console.error("Failed to get achievement statistics:", error);
    return {};
  }
};

/**
 * Calculate streak data
 */
export const getStreakData = async (): Promise<StreakData> => {
  try {
    const activityData = await getActivityData();
    const dates = Object.keys(activityData).filter(date => activityData[date] >= 5).sort(); // Only count days with at least 5 jaaps
    
    if (dates.length === 0) {
      return { currentStreak: 0, maxStreak: 0, totalActiveDays: 0 };
    }
    
    // Calculate total active days (with at least 5 jaaps)
    const totalActiveDays = dates.length;
    
    // Calculate current streak (working backwards from today)
    const today = new Date().toISOString().split('T')[0];
    let currentStreak = 0;
    let checkDate = new Date();
    
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (activityData[dateStr] && activityData[dateStr] >= 5) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (dateStr === today) {
        // If today has no activity, start checking from yesterday
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      } else {
        break;
      }
    }
    
    // Calculate max streak
    let maxStreak = 0;
    let tempStreak = 0;
    let previousDate: Date | null = null;
    
    dates.forEach(dateStr => {
      const currentDate = new Date(dateStr);
      
      if (previousDate) {
        const dayDiff = Math.floor((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
          tempStreak++;
        } else {
          maxStreak = Math.max(maxStreak, tempStreak);
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      
      previousDate = currentDate;
    });
    
    maxStreak = Math.max(maxStreak, tempStreak);
    
    return {
      currentStreak,
      maxStreak,
      totalActiveDays
    };
  } catch (error) {
    console.error("Failed to calculate streak data:", error);
    return { currentStreak: 0, maxStreak: 0, totalActiveDays: 0 };
  }
};

export default {
  recordDailyActivity,
  getActivityData,
  getStreakData,
  getAchievementCategory,
  getActivityIcon,
  getActivityLevel,
  getAchievementStats,
  ACHIEVEMENT_CATEGORIES
};
