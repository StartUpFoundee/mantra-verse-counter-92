
import { clearActiveAccount } from "@/utils/accountStorage";
import { toast } from "@/components/ui/sonner";
import { LogOut } from "lucide-react";

export const handleLogout = async (): Promise<void> => {
  try {
    console.log("LogoutHandler: Starting logout process");
    
    // Clear all active account data
    await clearActiveAccount();
    
    // Clear any cached data
    sessionStorage.clear();
    
    // Show logout message
    toast("Logged Out", {
      description: "You have been logged out successfully",
      icon: <LogOut className="h-4 w-4 text-blue-500" />
    });
    
    // Dispatch logout event for components to listen
    window.dispatchEvent(new CustomEvent('user-logout'));
    
    console.log("LogoutHandler: Logout completed");
    
  } catch (error) {
    console.error("LogoutHandler: Logout failed:", error);
    
    // Still try to clear session and redirect even if there's an error
    sessionStorage.clear();
    window.dispatchEvent(new CustomEvent('user-logout'));
  }
};

export default { handleLogout };
