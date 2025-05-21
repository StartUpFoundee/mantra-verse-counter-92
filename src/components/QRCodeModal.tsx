
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRCode } from "@/components/ui/qr-code";
import { generateIdQRData } from "@/utils/spiritualIdUtils";
import { Share2, Download, Copy } from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface QRCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spiritualId: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ open, onOpenChange, spiritualId }) => {
  const qrData = generateIdQRData(spiritualId);
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Spiritual ID",
          text: `Scan this QR code to access my spiritual identity: ${spiritualId}`,
          url: qrData,
        });
        toast("Shared Successfully", {
          description: "Your QR code has been shared"
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      toast("Sharing Not Supported", {
        description: "Your browser doesn't support sharing"
      });
    }
  };
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrData);
    toast("Link Copied", {
      description: "QR code link copied to clipboard"
    });
  };
  
  const downloadQRCode = () => {
    const canvas = document.querySelector(".qr-code-container canvas") as HTMLCanvasElement;
    if (!canvas) {
      // If canvas approach doesn't work, use the img approach
      const img = document.querySelector(".qr-code-container img") as HTMLImageElement;
      if (img) {
        // Create a temporary link element
        const link = document.createElement("a");
        link.download = `spiritual-id-${spiritualId}.png`;
        link.href = img.src;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast("QR Code Downloaded", {
          description: "Your QR code has been downloaded"
        });
      } else {
        toast("Download Failed", {
          description: "Unable to download the QR code"
        });
      }
      return;
    }
    
    try {
      const link = document.createElement("a");
      link.download = `spiritual-id-${spiritualId}.png`;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast("QR Code Downloaded", {
        description: "Your QR code has been downloaded"
        });
    } catch (error) {
      toast("Download Failed", {
        description: "Unable to download the QR code"
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-800 border-zinc-700 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-amber-400">Your Spiritual ID QR Code</DialogTitle>
          <DialogDescription className="text-gray-300">
            Scan this QR code to quickly log in on another device
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg">
          <div className="qr-code-container">
            <QRCode
              value={qrData}
              size={200}
              bgColor="#FFFFFF"
              fgColor="#000000"
            />
          </div>
        </div>
        
        <div className="text-center my-2">
          <p className="text-gray-300 text-sm">ID: {spiritualId}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <Button 
            onClick={handleShare}
            className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 flex-1"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
          
          <Button 
            onClick={downloadQRCode} 
            className="flex items-center justify-center gap-2 bg-zinc-700 hover:bg-zinc-600 flex-1"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </Button>
          
          <Button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 bg-zinc-700 hover:bg-zinc-600 flex-1"
          >
            <Copy className="h-4 w-4" />
            <span>Copy Link</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeModal;
