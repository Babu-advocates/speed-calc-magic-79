import { supabase } from "@/integrations/supabase/client";
import { PDFDocument, rgb } from 'pdf-lib';

export interface SignaturePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const addSignatureToDocument = async (
  originalFile: File,
  signatureDataUrl: string,
  applicationData?: any,
  position: SignaturePosition = { x: 400, y: 680, width: 150, height: 75 }
): Promise<Blob> => {
  try {
    // Read the original file as array buffer
    const originalBytes = await originalFile.arrayBuffer();
    
    // Load the existing PDF
    const pdfDoc = await PDFDocument.load(originalBytes);
    
    // Convert signature data URL to PNG bytes
    const signatureImageBytes = await fetch(signatureDataUrl).then(res => res.arrayBuffer());
    const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
    
    // Get the first page (or you could iterate through all pages)
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { height: pageHeight } = firstPage.getSize();
    
    // Add signature to the first page at specified position
    // Note: PDF coordinate system has origin at bottom-left, so we need to adjust Y
    firstPage.drawImage(signatureImage, {
      x: position.x,
      y: pageHeight - position.y - position.height, // Flip Y coordinate
      width: position.width,
      height: position.height,
    });
    
    // Save the PDF with signature
    const pdfBytes = await pdfDoc.save();
    
    // Convert to blob
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    throw new Error(`Failed to add signature to document: ${error}`);
  }
};

export const uploadSignedDocument = async (
  signedDocumentBlob: Blob,
  applicationId: string,
  applicationNumber: string,
  originalFileName: string
): Promise<string> => {
  // Create filename with application number for easy identification
  const fileName = `${applicationNumber}_signed_${originalFileName.replace(/\.[^/.]+$/, "")}_${Date.now()}.pdf`;
  
  const { data, error } = await supabase.storage
    .from('signed-documents')
    .upload(fileName, signedDocumentBlob, {
      contentType: 'application/pdf',
      upsert: false
    });

  if (error) {
    throw new Error(`Failed to upload signed document: ${error.message}`);
  }

  // Get the public URL
  const { data: publicUrlData } = supabase.storage
    .from('signed-documents')
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
};