import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface DigitalSignatureProps {
  isOpen: boolean;
  onClose: () => void;
  onSignatureCapture: (signatureDataUrl: string) => void;
}

export const DigitalSignature = ({ isOpen, onClose, onSignatureCapture }: DigitalSignatureProps) => {
  const [signerName, setSignerName] = useState("SELVA RAJ BABU");

  const generateDigitalSignature = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Set canvas size
    canvas.width = 300;
    canvas.height = 120;
    
    // Set background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
    
    // Add signer name (large)
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(signerName, 15, 35);
    
    // Add "Digitally signed" text
    ctx.font = '12px Arial';
    ctx.fillText(`Digitally signed`, 15, 55);
    ctx.fillText(`by ${signerName}`, 15, 70);
    
    // Add current date and time
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '.');
    const timeStr = now.toTimeString().slice(0, 8);
    const timezoneStr = '+05\'30\''; // Indian timezone
    
    ctx.fillText(`Date:`, 15, 90);
    ctx.fillText(`${dateStr}`, 15, 105);
    ctx.fillText(`${timeStr} ${timezoneStr}`, 60, 105);
    
    // Convert to data URL
    const dataURL = canvas.toDataURL('image/png');
    
    onSignatureCapture(dataURL);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Digital Signature
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Enter the signer's name for the digital signature:
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="signerName">Signer Name</Label>
            <Input
              id="signerName"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="Enter full name"
            />
          </div>
          
          {/* Preview of the signature format */}
          <div className="border border-gray-300 rounded p-4 bg-gray-50">
            <div className="text-sm text-gray-600 mb-2">Preview:</div>
            <div className="border border-black p-2 bg-white text-xs">
              <div className="font-bold text-base">{signerName}</div>
              <div className="mt-1">Digitally signed</div>
              <div>by {signerName}</div>
              <div className="mt-1">Date:</div>
              <div>{new Date().toISOString().slice(0, 10).replace(/-/g, '.')}</div>
              <div>{new Date().toTimeString().slice(0, 8)} +05'30'</div>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="font-medium">The signed PDF will include:</div>
            <div>• Complete application details and borrower information</div>
            <div>• Original document processing information</div>
            <div>• Legal opinion certificate with digital signature</div>
            <div>• Timestamp and verification details</div>
            <div>• Official Babu Advocates letterhead and validation</div>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              onClick={generateDigitalSignature} 
              className="bg-orange-600 hover:bg-orange-700"
              disabled={!signerName.trim()}
            >
              Apply Digital Signature
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};