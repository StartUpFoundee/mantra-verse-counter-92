
import { clearActiveAccount } from "@/utils/accountStorage";
import { getCurrentDeviceId } from "@/utils/deviceIdentification";
import { toast } from "@/components/ui/sonner";
import { LogOut } from "lucide-react";

export const handleLogout = async (): Promise<void> => {
  try {
    console.log("LogoutHandler: Starting logout process");
    
    // Get current device ID for proper cleanup
    const deviceId = getCurrentDeviceId();
    console.log("LogoutHandler: Using device ID:", deviceId);
    
    // Clear all active account data
    await clearActiveAccount();
    
    // Clear session storage for this device
    if (deviceId) {
      sessionStorage.removeItem(`${deviceId}_activeAccountSlot`);
    }
    
    // Clear any other cached data but preserve device identification
    const keysToKeep = [
      'device_permanent_id',
      'device_metadata'
    ];
    
    // Clear sessionStorage except device-related keys
    const sessionKeys = Object.keys(sessionStorage);
    sessionKeys.forEach(key => {
      if (!keysToKeep.some(keepKey => key.includes(keepKey))) {
        sessionStorage.removeItem(key);
      }
    });
    
    // Show logout message
    toast("Logged Out", {
      description: "You have been logged out successfully",
      icon: <LogOut className="h-4 w-4 text-blue-500" />
    });
    
    // Dispatch logout event for components to listen
    window.dispatchEvent(new CustomEvent('user-logout'));
    
    console.log("LogoutHandler: Logout completed successfully");
    
  } catch (error) {
    console.error("LogoutHandler: Logout failed:", error);
    
    // Still try to clear session and redirect even if there's an error
    sessionStorage.clear();
    window.dispatchEvent(new CustomEvent('user-logout'));
  }
};

export default { handleLogout };
