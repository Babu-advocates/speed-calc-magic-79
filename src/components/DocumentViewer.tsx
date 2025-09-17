import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, User, Building2, FileText, Download, Eye, DollarSign, Clock, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { showToast } from "@/lib/toast";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  application: any;
}

export const DocumentViewer = ({ isOpen, onClose, application }: DocumentViewerProps) => {
  const { toast } = useToast();
  
  if (!application) return null;

  const downloadFile = async (url: string, fileName: string) => {
    try {
      // First try: Use fetch with proper headers to bypass Chrome blocking
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Accept': 'application/pdf, application/octet-stream, */*',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the blob URL
        setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 100);
        
        toast({ title: 'Success', description: `${fileName} downloaded successfully` });
        return;
      }
    } catch (fetchError) {
      console.log('Fetch download failed, trying alternative method:', fetchError);
    }

    // Second try: Create a hidden iframe to download the file
    try {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);
      
      // Remove iframe after a delay
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 3000);
      
      toast({ title: 'Download Started', description: `${fileName} download initiated. Check your downloads folder.` });
      return;
    } catch (iframeError) {
      console.log('Iframe download failed:', iframeError);
    }

    // Third try: Open in new window as last resort
    try {
      const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
      if (newWindow) {
        toast({ title: 'Opening File', description: `${fileName} opened in new tab. Use browser's download option if needed.` });
      } else {
        toast({ title: 'Popup Blocked', description: 'Please allow popups and try again, or check your downloads folder', variant: 'destructive' });
      }
    } catch (error) {
      console.error('All download methods failed:', error);
      toast({ title: 'Download Failed', description: 'Unable to download file. Please try refreshing the page or contact support.', variant: 'destructive' });
    }
  };

  const handleDownloadOpinion = async (opinionFile: any) => {
    try {
      console.log('Attempting to download opinion file:', opinionFile);
      const fileName = opinionFile?.name || 'opinion-document.pdf';
      
      // Check if file has a direct URL
      if (opinionFile?.url) {
        console.log('Using direct URL:', opinionFile.url);
        await downloadFile(opinionFile.url, fileName);
        return;
      }

      // Check if file has a storage path
      if (opinionFile?.path) {
        console.log('Using storage path:', opinionFile.path);
        const { data: signedUrlData, error: signedError } = await supabase.storage
          .from('opinion-documents')
          .createSignedUrl(opinionFile.path, 3600);

        if (signedError) {
          console.error('Error creating signed URL:', signedError);
          toast({ title: 'Error', description: 'Could not access file', variant: 'destructive' });
          return;
        }

        if (signedUrlData?.signedUrl) {
          console.log('Using signed URL:', signedUrlData.signedUrl);
          await downloadFile(signedUrlData.signedUrl, fileName);
          return;
        }
      }

      console.log('No valid URL or path found for opinion file');
      toast({ title: 'Error', description: 'Could not access file', variant: 'destructive' });
    } catch (error) {
      console.error('Error downloading opinion:', error);
      toast({ title: 'Error', description: 'Failed to download opinion document', variant: 'destructive' });
    }
  };

  const handleDownload = () => {
    // Download the first opinion file if available
    if (application.opinion_files && application.opinion_files.length > 0) {
      handleDownloadOpinion(application.opinion_files[0]);
    } else {
      toast({ title: 'No Opinion', description: 'No opinion document available for download', variant: 'destructive' });
    }
  };

  const handleViewDocument = () => {
    // View the first opinion file if available
    if (application.opinion_files && application.opinion_files.length > 0) {
      const opinionFile = application.opinion_files[0];
      if (opinionFile?.url) {
        window.open(opinionFile.url, '_blank');
      } else {
        toast({ title: 'No Opinion', description: 'No opinion document available to view', variant: 'destructive' });
      }
    } else {
      toast({ title: 'No Opinion', description: 'No opinion document available to view', variant: 'destructive' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen max-w-none max-h-none m-0 p-6 overflow-y-auto rounded-none border-0">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Legal Opinion Document - {application.application_id}</span>
          </DialogTitle>
          <DialogDescription>
            View and download legal opinion documents and details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Actions */}
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(application.status)}>
              {application.status?.charAt(0).toUpperCase() + application.status?.slice(1)}
            </Badge>
            <div className="flex space-x-2">
              <Button onClick={handleViewDocument} variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View Document
              </Button>
              <Button onClick={handleDownload} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          <Separator />

          {/* Application Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Bank Name</p>
                  <p className="text-sm text-gray-600">{application.bank_name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Borrower</p>
                  <p className="text-sm text-gray-600">{application.borrower_name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Application Type</p>
                  <p className="text-sm text-gray-600">{application.application_type}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Loan Amount</p>
                  <p className="text-sm text-gray-600">₹{parseFloat(application.loan_amount).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Loan Type</p>
                  <p className="text-sm text-gray-600">{application.loan_type}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Submitted Date</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(application.created_at), 'dd/MM/yyyy HH:mm')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Submission Details */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900">Submission Details</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Submitted By:</span>
                <span className="text-sm text-gray-600">{application.submitted_by}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Branch Code:</span>
                <span className="text-sm text-gray-600">{application.branch_code || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Priority:</span>
                <Badge variant="outline" className="text-xs">
                  {application.priority || 'Normal'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Document Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900">Document Information</h3>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Legal Opinion Document</p>
                  <p className="text-sm text-gray-600">PDF Format • Last updated today</p>
                </div>
              </div>
              <div className="flex space-x-2 mb-4">
                <Button onClick={handleViewDocument} variant="outline" size="sm" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Document
                </Button>
                <Button onClick={handleDownload} size="sm" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
              
              {/* Opinion Files List */}
              {application.opinion_files && application.opinion_files.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Available Opinion Documents:</p>
                  {application.opinion_files.map((file: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">{file.name}</span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownloadOpinion(file)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="border-t border-gray-200 pt-4">
                <Button 
                  onClick={() => showToast.success("Opening opinion form...")} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Give Opinion
                </Button>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          {application.notes && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-900">Notes</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-gray-700">{application.notes}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};