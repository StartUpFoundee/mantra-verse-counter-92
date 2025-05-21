
import React from 'react';

interface QRCodeProps {
  value: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
  level?: 'L' | 'M' | 'Q' | 'H';
  className?: string;
}

// This is a simple QR code component that uses a CDN from QRCode.react
// In a production app, we'd use a proper package like 'react-qr-code'
const QRCode: React.FC<QRCodeProps> = ({ 
  value, 
  size = 200, 
  bgColor = "#ffffff", 
  fgColor = "#000000",
  level = 'M',
  className = ""
}) => {
  // Encode the data for URL
  const encodedValue = encodeURIComponent(value);
  // Use QR Server API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedValue}&bgcolor=${bgColor.replace('#', '')}&color=${fgColor.replace('#', '')}&qzone=1&format=svg`;

  return (
    <div className={className}>
      <img 
        src={qrCodeUrl} 
        alt="QR Code" 
        width={size} 
        height={size}
        className="mx-auto"
      />
    </div>
  );
};

export { QRCode };
