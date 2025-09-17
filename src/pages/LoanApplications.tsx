import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Filter, Building2, FileText, User, Calendar, CreditCard, RefreshCw, Phone, Mail, MapPin, Download, MessageSquare, Upload, Check, Trash2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { EmployeeSidebar } from "@/components/EmployeeSidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { QueryForm } from "@/components/QueryForm";
import { useState as useFileState } from "react";
import { DigitalSignature } from "@/components/DigitalSignature";
import { addSignatureToDocument, uploadSignedDocument } from "@/utils/documentSigning";

const LoanApplications = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBank, setSelectedBank] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [applicationTypeFilter, setApplicationTypeFilter] = useState("all");
  const [loanApplications, setLoanApplications] = useState<any[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAssignWork, setShowAssignWork] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [uploadingOpinion, setUploadingOpinion] = useState(false);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [submittingOpinion, setSubmittingOpinion] = useState(false);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [capturedSignature, setCapturedSignature] = useState<string | null>(null);

  // Fetch applications from database
  useEffect(() => {
    fetchApplications();

    // Real-time sync: update list when application status changes anywhere
    const channel = supabase
      .channel('applications-updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'applications' },
        (payload) => {
          setLoanApplications((prev) =>
            prev.map((app) => {
              if (app.id !== payload.new.id) return app;
              const updated = payload.new as any;
              return {
                ...app,
                ...updated,
                id: updated.id,
                applicationNumber: updated.application_id,
                name: updated.borrower_name,
                bankName: updated.bank_name,
                amount: `₹${Number(updated.loan_amount).toLocaleString('en-IN')}`,
                status: updated.status,
                date: new Date(updated.submission_date).toISOString().split('T')[0],
                loanType: updated.loan_type,
                applicationType: updated.application_type,
              };
            })
          );

          // Notify on status change
          if ((payload.old as any)?.status !== (payload.new as any)?.status) {
            toast({
              title: 'Status updated',
              description: `Application ${(payload.new as any).application_id} is now ${(payload.new as any).status}.`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      
      // Check if this is an employee viewing their assignments
      const isEmployeeLogin = localStorage.getItem("employeeLogin") === "true";
      const employeeUsername = localStorage.getItem("employeeUsername");
      
      let query = supabase
        .from('applications')
        .select('*');
      
      // If employee is logged in, filter to only show applications assigned to them
      if (isEmployeeLogin && employeeUsername && !isAdminRoute) {
        query = query.eq('assigned_to_username', employeeUsername);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
        toast({
          title: "Error",
          description: "Failed to fetch applications",
          variant: "destructive",
        });
        return;
      }

      // Transform data to match component expectations while keeping original data
      const transformedData = data?.map((app) => ({
        id: app.id,
        applicationNumber: app.application_id,
        name: app.borrower_name,
        bankName: app.bank_name,
        amount: `₹${Number(app.loan_amount).toLocaleString('en-IN')}`,
        status: app.status,
        date: new Date(app.submission_date).toISOString().split('T')[0],
        loanType: app.loan_type,
        applicationType: app.application_type,
        // Keep original database fields for detailed view
        ...app
      })) || [];

      setLoanApplications(transformedData);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const { data, error } = await supabase
        .from('employee_accounts')
        .select('id, username')
        .eq('is_active', true)
        .order('username');

      if (error) {
        console.error('Error fetching employees:', error);
        toast({
          title: "Error",
          description: "Failed to fetch employees",
          variant: "destructive",
        });
        return;
      }

      setEmployees(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive",
      });
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleAssignWork = async (employeeId: string, employeeUsername: string) => {
    try {
      // Update the application with assigned employee
      const { error } = await supabase
        .from('applications')
        .update({ 
          assigned_to: employeeId,
          assigned_to_username: employeeUsername,
          assigned_at: new Date().toISOString(),
          status: 'in_review',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedApplication.id);

      if (error) {
        console.error('Error assigning work:', error);
        toast({
          title: "Error",
          description: "Failed to assign work",
          variant: "destructive",
        });
        return;
      }

      // Send notification to the assigned employee
      try {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            type: 'work_assignment',
            employee_username: employeeUsername,
            application_id: selectedApplication.application_id,
            message: `New work assigned: ${selectedApplication.application_type} for ${selectedApplication.borrower_name} (${selectedApplication.bank_name})`
          });

        if (notificationError) {
          console.error('Error creating notification:', notificationError);
        }

        // Call the edge function to send email notification
        const { error: emailError } = await supabase.functions.invoke('send-assignment-notification', {
          body: {
            employeeUsername,
            applicationId: selectedApplication.application_id,
            applicationDetails: {
              applicationType: selectedApplication.application_type,
              borrowerName: selectedApplication.borrower_name,
              bankName: selectedApplication.bank_name,
              loanAmount: selectedApplication.loan_amount
            }
          }
        });

        if (emailError) {
          console.error('Error sending email notification:', emailError);
        }
      } catch (notificationError) {
        console.error('Error with notifications:', notificationError);
        // Don't fail the assignment if notification fails
      }

      toast({
        title: "Success",
        description: `Work assigned to ${employeeUsername} and notification sent`,
        variant: "default",
      });

      setShowAssignWork(false);
      fetchApplications(); // Refresh the applications list
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to assign work",
        variant: "destructive",
      });
    }
  };

  const handleFileView = async (file: any, bucketName = 'application-documents') => {
    try {
      const fileName = file?.name || 'document';
      console.log('Attempting to access file:', fileName);

      // Check if file has a direct URL (newer uploads)
      if (file?.url) {
        await downloadFile(file.url, fileName);
        return;
      }

      // Check if file has a storage path (newer uploads)
      if (file?.path) {
        const { data: signedUrlData, error: signedError } = await supabase.storage
          .from(bucketName)
          .createSignedUrl(file.path, 3600);

        if (signedError) {
          console.error('Error creating signed URL:', signedError);
          toast({ title: 'Error', description: 'Could not access file', variant: 'destructive' });
          return;
        }

        if (signedUrlData?.signedUrl) {
          await downloadFile(signedUrlData.signedUrl, fileName);
          return;
        }
      }

      // Legacy fallback - search for file in storage
      const { data: fileList, error: listError } = await supabase.storage
        .from('application-documents')
        .list('', {
          limit: 1000,
          search: fileName
        });

      if (listError) {
        console.error('Error checking file existence:', listError);
        toast({ title: 'Error', description: 'Could not check file availability', variant: 'destructive' });
        return;
      }

      const foundFile = fileList?.find(f => f.name === fileName);
      if (!foundFile) {
        // Search in subdirectories
        const { data: subdirs, error: subdirError } = await supabase.storage
          .from('application-documents')
          .list('');

        if (!subdirError && subdirs) {
          for (const dir of subdirs) {
            if (dir.name && dir.metadata?.isDirectory) {
              const { data: subFiles } = await supabase.storage
                .from('application-documents')
                .list(dir.name, { search: fileName });
              
              if (subFiles?.length > 0) {
                const fullPath = `${dir.name}/${subFiles[0].name}`;
                const { data: signedUrlData, error: signedError } = await supabase.storage
                  .from(bucketName)
                  .createSignedUrl(fullPath, 3600);

                if (!signedError && signedUrlData?.signedUrl) {
                  await downloadFile(signedUrlData.signedUrl, fileName);
                  return;
                }
              }
            }
          }
        }
        
        toast({ title: 'File Not Found', description: 'The document was not found in storage. It may have been uploaded before the storage system was implemented.', variant: 'destructive' });
        return;
      }

      // File found at root level
      const { data: signedUrlData, error: signedError } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(fileName, 3600);

      if (signedError) {
        console.error('Error creating signed URL:', signedError);
        toast({ title: 'Error', description: 'Could not access file', variant: 'destructive' });
        return;
      }

      if (signedUrlData?.signedUrl) {
        await downloadFile(signedUrlData.signedUrl, fileName);
      } else {
        toast({ title: 'Error', description: 'Could not access file', variant: 'destructive' });
      }

    } catch (error) {
      console.error('Error in handleFileView:', error);
      toast({ title: 'Error', description: 'Failed to access document', variant: 'destructive' });
    }
  };

  const downloadFile = async (url: string, fileName: string) => {
    try {
      // Use fetch to get the file as blob to avoid Chrome blocking
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      
      toast({ title: 'Success', description: `${fileName} downloaded successfully`, variant: 'default' });
    } catch (error) {
      console.error('Download error:', error);
      
      // Fallback: try opening in new window
      try {
        const newWindow = window.open(url, '_blank');
        if (!newWindow) {
          toast({ title: 'Popup Blocked', description: 'Please allow popups or check your downloads folder', variant: 'destructive' });
        }
      } catch (fallbackError) {
        toast({ title: 'Error', description: 'Could not download or open the file', variant: 'destructive' });
      }
    }
  };

  const handleOpinionUpload = async (file: File, applicationId: string) => {
    try {
      setUploadingOpinion(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${applicationId}_opinion_${Date.now()}.${fileExt}`;
      const filePath = `${applicationId}/${fileName}`;

      // Upload file to opinion-documents bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('opinion-documents')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        toast({
          title: "Upload Error",
          description: "Failed to upload opinion document",
          variant: "destructive",
        });
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('opinion-documents')
        .getPublicUrl(filePath);

      const opinionFile = {
        name: file.name,
        path: filePath,
        url: urlData.publicUrl,
        size: file.size,
        type: file.type,
        uploaded_at: new Date().toISOString()
      };

      // Update application with opinion file
      const currentApp = loanApplications.find(app => app.id === selectedApplication?.id);
      const currentOpinionFiles = currentApp?.opinion_files || [];
      const updatedOpinionFiles = [...currentOpinionFiles, opinionFile];

      const { error: updateError } = await supabase
        .from('applications')
        .update({ 
          opinion_files: updatedOpinionFiles,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedApplication?.id);

      if (updateError) {
        console.error('Error updating application:', updateError);
        toast({
          title: "Update Error",
          description: "Failed to save opinion document reference",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Opinion document uploaded successfully",
        variant: "default",
      });

      // Update local state instead of fetching all applications
      setLoanApplications(prevApps => 
        prevApps.map(app => 
          app.id === selectedApplication?.id 
            ? { ...app, opinion_files: updatedOpinionFiles, updated_at: new Date().toISOString() }
            : app
        )
      );
      
      // Update selected application to reflect new file
      if (selectedApplication) {
        setSelectedApplication({
          ...selectedApplication,
          opinion_files: updatedOpinionFiles,
          updated_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error in handleOpinionUpload:', error);
      toast({
        title: "Error",
        description: "Failed to upload opinion document",
        variant: "destructive",
      });
    } finally {
      setUploadingOpinion(false);
    }
  };

  const handleRemoveOpinion = async (fileIndex: number, file: any) => {
    try {
      if (!selectedApplication) return;

      // Remove file from storage
      const { error: deleteError } = await supabase.storage
        .from('opinion-documents')
        .remove([file.path]);

      if (deleteError) {
        console.error('Error deleting file from storage:', deleteError);
        toast({
          title: "Delete Error",
          description: "Failed to delete file from storage",
          variant: "destructive",
        });
        return;
      }

      // Update application to remove file from opinion_files array
      const currentApp = loanApplications.find(app => app.id === selectedApplication?.id);
      const currentOpinionFiles = currentApp?.opinion_files || [];
      const updatedOpinionFiles = currentOpinionFiles.filter((_: any, index: number) => index !== fileIndex);

      const { error: updateError } = await supabase
        .from('applications')
        .update({ 
          opinion_files: updatedOpinionFiles,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedApplication?.id);

      if (updateError) {
        console.error('Error updating application:', updateError);
        toast({
          title: "Update Error",
          description: "Failed to remove opinion document",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Opinion document removed successfully",
        variant: "default",
      });

      // Update local state instead of fetching all applications
      setLoanApplications(prevApps => 
        prevApps.map(app => 
          app.id === selectedApplication?.id 
            ? { ...app, opinion_files: updatedOpinionFiles, updated_at: new Date().toISOString() }
            : app
        )
      );
      
      // Update selected application to reflect removed file
      if (selectedApplication) {
        setSelectedApplication({
          ...selectedApplication,
          opinion_files: updatedOpinionFiles,
          updated_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error in handleRemoveOpinion:', error);
      toast({
        title: "Error",
        description: "Failed to remove opinion document",
        variant: "destructive",
      });
    }
  };

  const handleSignatureCapture = (signatureDataUrl: string) => {
    setCapturedSignature(signatureDataUrl);
    setShowSignatureDialog(false);
    // After capturing signature, show confirmation dialog
    setShowSubmitConfirmation(true);
  };

  const handleSubmitOpinion = async () => {
    try {
      setSubmittingOpinion(true);
      
      let signedDocumentUrl = null;
      
      // If we have a signature, process the document with digital signature
      if (capturedSignature && selectedApplication?.opinion_files && selectedApplication.opinion_files.length > 0) {
        try {
          // Get the first opinion file for signing
          const opinionFile = selectedApplication.opinion_files[0];
          
          // Create a mock file object for the existing opinion document
          const response = await fetch(opinionFile.url);
          const blob = await response.blob();
          const file = new File([blob], opinionFile.name, { type: blob.type });
          
          // Add digital signature to the document
          const signedDocumentBlob = await addSignatureToDocument(file, capturedSignature, selectedApplication);
          
          // Upload signed document to the signed-documents bucket
          signedDocumentUrl = await uploadSignedDocument(
            signedDocumentBlob,
            selectedApplication.id,
            selectedApplication.application_id || selectedApplication.applicationNumber,
            opinionFile.name
          );
          
          console.log('Signed document uploaded:', signedDocumentUrl);
        } catch (signatureError) {
          console.error('Error processing digital signature:', signatureError);
          toast({
            title: "Signature Error",
            description: "Failed to add digital signature, but proceeding with submission",
            variant: "destructive",
          });
        }
      }
      
      const { error: updateError } = await supabase
        .from('applications')
        .update({ 
          status: 'completed',
          digital_signature_applied: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedApplication?.id);

      if (updateError) {
        console.error('Error submitting opinion:', updateError);
        toast({
          title: "Submit Error",
          description: "Failed to submit opinion",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: signedDocumentUrl 
          ? "Opinion completed successfully with digital signature and moved to past applications" 
          : "Opinion completed successfully and moved to past applications",
        variant: "default",
      });

      // Update the local state instead of fetching all applications
      setLoanApplications(prevApps => 
        prevApps.map(app => 
          app.id === selectedApplication?.id 
            ? { ...app, status: 'completed', digital_signature_applied: true, updated_at: new Date().toISOString() }
            : app
        )
      );
      
      // Update selected application to reflect new status
      if (selectedApplication) {
        setSelectedApplication({
          ...selectedApplication,
          status: 'completed',
          digital_signature_applied: true,
          updated_at: new Date().toISOString()
        });
      }

      setShowSubmitConfirmation(false);
      setCapturedSignature(null);
      // Removed fetchApplications() call to prevent potential navigation side effects
    } catch (error) {
      console.error('Error in handleSubmitOpinion:', error);
      toast({
        title: "Error",
        description: "Failed to submit opinion",
        variant: "destructive",
      });
    } finally {
      setSubmittingOpinion(false);
    }
  };

  const banks = [
    "State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", 
    "Punjab National Bank", "Kotak Mahindra Bank", "IndusInd Bank", "YES Bank"
  ];

  const getStatusColor = (status: string) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'to be assigned':
      case 'submitted': // treated as To be assigned in admin view
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'in_review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
      case 'approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'under review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending documents':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  // Determine if this is an admin route
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Map DB status to display status for admin view
  const getDisplayStatus = (app: any) => {
    const s = (app?.status || '').toLowerCase();
    if (isAdminRoute) {
      // Show true backend status for admin
      if (s === 'submitted') return 'Submitted';
      if (s === 'in_review') return 'Under Review';
      if (s === 'completed') return 'Completed';
      if (s === 'rejected') return 'Rejected';
    }
    // Default: return as-is (capitalize first letter)
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
  };

  const filteredApplications = loanApplications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.bankName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBank = selectedBank === "all" || app.bankName === selectedBank;
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesType = isAdminRoute || applicationTypeFilter === "all" || app.applicationType === applicationTypeFilter;
    
    // For admin route (Legal Opinion), show all applications including submitted ones
    // For employee route, exclude submitted applications as they haven't been assigned yet
    const statusCondition = isAdminRoute ? true : app.status !== 'submitted';
    
    return matchesSearch && matchesBank && matchesStatus && matchesType && statusCondition;
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-legal-bg">
        {isAdminRoute ? <AppSidebar /> : <EmployeeSidebar />}
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-gradient-to-r from-white/95 to-blue-50/95 backdrop-blur-sm shadow-elegant border-b border-white/20">
            <div className="px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger className="text-slate-600 hover:text-blue-600 transition-colors duration-200" />
                  <div className="h-6 w-px bg-slate-300"></div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">Loan Application</h1>
                      <p className="text-sm text-slate-600">Manage all loan applications</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="px-6 py-8">
        {/* Filters Section */}
        <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-lg shadow-card border border-white/20 p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name, application number, or bank..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/50 border-slate-200 focus:border-blue-300 focus:ring-blue-200"
              />
            </div>
            
            <div className="flex gap-3">
              <Select value={selectedBank} onValueChange={setSelectedBank}>
                <SelectTrigger className="w-48 bg-white/50 border-slate-200">
                  <Building2 className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by Bank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Banks</SelectItem>
                  {banks.map(bank => (
                    <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 bg-white/50 border-slate-200">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Pending Documents">Pending Documents</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              {!isAdminRoute && (
                <Select value={applicationTypeFilter} onValueChange={setApplicationTypeFilter}>
                  <SelectTrigger className="w-48 bg-white/50 border-slate-200">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Application Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Loan Application">Loan Application</SelectItem>
                    <SelectItem value="Loan Recovery">Loan Recovery</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>

        {/* Applications Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-slate-600">Loading applications...</p>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-card border border-white/20 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-blue-50 to-purple-50 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100">
                  <TableHead className="font-semibold text-slate-700">Application ID</TableHead>
                  <TableHead className="font-semibold text-slate-700">Status</TableHead>
                  <TableHead className="font-semibold text-slate-700">Name</TableHead>
                  <TableHead className="font-semibold text-slate-700">Bank</TableHead>
                  <TableHead className="font-semibold text-slate-700">Loan Amount</TableHead>
                  <TableHead className="font-semibold text-slate-700">Loan Type</TableHead>
                  <TableHead className="font-semibold text-slate-700">Applied On</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application, index) => (
                  <TableRow 
                    key={application.id}
                    className="hover:bg-blue-50/50 transition-colors duration-200 border-b border-slate-100"
                  >
                    <TableCell className="font-medium text-slate-800">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span>{application.applicationNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(getDisplayStatus(application))} font-medium px-3 py-1`}>
                        {getDisplayStatus(application)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-slate-700">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-slate-500" />
                        <span>{application.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-slate-500" />
                        <span>{application.bankName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-emerald-600">
                      {application.amount}
                    </TableCell>
                    <TableCell className="text-slate-700">
                      {application.loanType}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span>{application.date}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline"
                            size="sm"
                            className="bg-gradient-primary hover:shadow-glow transition-all duration-300 text-white border-none"
                            onClick={() => setSelectedApplication(application)}
                          >
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="w-screen h-screen max-w-none max-h-none m-0 p-6 overflow-y-auto rounded-none border-0">
                          <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-slate-800">
                              Application Details - {application.applicationNumber}
                            </DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-6 mt-4">
                            {/* Status */}
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold text-slate-700">Status</h3>
                              <Badge className={`${getStatusColor(getDisplayStatus(application))} font-medium px-3 py-1`}>
                                {getDisplayStatus(application)}
                              </Badge>
                            </div>

                            {/* Borrower Information */}
                            <div className="bg-slate-50 rounded-lg p-4">
                              <h3 className="text-lg font-semibold text-slate-700 mb-4">Borrower Information</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2">
                                  <User className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm text-slate-500">Name:</span>
                                  <span className="font-medium">{application.name}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <FileText className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm text-slate-500">Customer ID:</span>
                                  <span className="font-medium">{application.customer_id || 'N/A'}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Phone className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm text-slate-500">Phone:</span>
                                  <span className="font-medium">{application.phone || 'N/A'}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Mail className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm text-slate-500">Email:</span>
                                  <span className="font-medium">{application.email || 'N/A'}</span>
                                </div>
                              </div>
                              <div className="mt-4 flex items-start space-x-2">
                                <MapPin className="h-4 w-4 text-slate-500 mt-1" />
                                <span className="text-sm text-slate-500">Address:</span>
                                <span className="font-medium">{application.address || 'N/A'}</span>
                              </div>
                            </div>

                            {/* Loan Information */}
                            <div className="bg-blue-50 rounded-lg p-4">
                              <h3 className="text-lg font-semibold text-slate-700 mb-4">Loan Information</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2">
                                  <Building2 className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm text-slate-500">Bank:</span>
                                  <span className="font-medium">{application.bankName}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <FileText className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm text-slate-500">Application Type:</span>
                                  <span className="font-medium">{application.applicationType}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <CreditCard className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm text-slate-500">Loan Type:</span>
                                  <span className="font-medium">{application.loanType}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-slate-500">Loan Amount:</span>
                                  <span className="font-semibold text-emerald-600">{application.amount}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Calendar className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm text-slate-500">Submission Date:</span>
                                  <span className="font-medium">{application.date}</span>
                                </div>
                                {application.sanction_date && (
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4 text-slate-500" />
                                    <span className="text-sm text-slate-500">Sanction Date:</span>
                                    <span className="font-medium">{application.sanction_date}</span>
                                  </div>
                            )}
                          </div>
                        </div>

                        {/* Assignment Status - Only show for admin */}
                        {application.assigned_to_username && !localStorage.getItem("employeeLogin") && (
                          <div className="bg-green-50 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-slate-700 mb-2">Assigned To</h3>
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-green-700">{application.assigned_to_username}</span>
                            </div>
                          </div>
                        )}

                        {/* Assign Work Section - Only show for admin */}
                        {showAssignWork && !localStorage.getItem("employeeLogin") && (
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-slate-700 mb-4">Assign Work to Employee</h3>
                            {loadingEmployees ? (
                              <div className="text-center py-4">
                                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <p className="mt-2 text-slate-600">Loading employees...</p>
                              </div>
                            ) : employees.length > 0 ? (
                              <div className="space-y-2">
                                {employees.map((employee) => (
                                  <div key={employee.id} className="flex items-center justify-between bg-white rounded-lg p-3 border hover:bg-blue-50 transition-colors">
                                    <div className="flex items-center space-x-2">
                                      <User className="h-4 w-4 text-slate-500" />
                                      <span className="font-medium">{employee.username}</span>
                                    </div>
                                    <Button 
                                      size="sm" 
                                      onClick={() => handleAssignWork(employee.id, employee.username)}
                                      className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                      Assign
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-slate-600">No active employees found.</p>
                            )}
                            <div className="mt-4 flex justify-end">
                              <Button 
                                variant="outline" 
                                onClick={() => setShowAssignWork(false)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons - Only show assign work for admin */}
                        {!showAssignWork && !localStorage.getItem("employeeLogin") && (
                          <div className="flex gap-3 pt-4 border-t border-slate-200">
                            <Button 
                              onClick={() => {
                                setShowAssignWork(true);
                                fetchEmployees();
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <User className="h-4 w-4 mr-2" />
                              Assign Work
                            </Button>
                          </div>
                        )}

                        {/* Additional Information */}
                            {application.additional_notes && (
                              <div className="bg-yellow-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-slate-700 mb-2">Additional Notes</h3>
                                <p className="text-slate-600">{application.additional_notes}</p>
                              </div>
                            )}

                            {/* Uploaded Files */}
                            {application.uploaded_files && application.uploaded_files.length > 0 && (
                              <div className="bg-green-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-slate-700 mb-4">Uploaded Documents</h3>
                                <div className="space-y-2">
                                  {application.uploaded_files.map((file: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 border">
                                      <div className="flex items-center space-x-2">
                                        <FileText className="h-4 w-4 text-slate-500" />
                                        <span className="font-medium">{file.name}</span>
                                        <span className="text-sm text-slate-500">({(file.size / 1024).toFixed(1)} KB)</span>
                                      </div>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => handleFileView(file)}
                                      >
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                                
                                {/* Give Opinion Button */}
                                <div className="mt-6 pt-4 border-t border-green-200">
                                  <div className="flex gap-2">
                                    <Button 
                                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                      onClick={() => {
                                        window.open('https://docs.google.com', '_blank');
                                      }}
                                    >
                                      <MessageSquare className="h-4 w-4 mr-2" />
                                      Work on Google Docs
                                    </Button>
                                    
                                    <div className="flex-1">
                                      <input
                                        type="file"
                                        id="opinion-upload"
                                        className="hidden"
                                        accept=".pdf,.doc,.docx"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file && selectedApplication) {
                                            handleOpinionUpload(file, selectedApplication.application_id);
                                          }
                                        }}
                                      />
                                      <Button 
                                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                                        onClick={() => document.getElementById('opinion-upload')?.click()}
                                        disabled={uploadingOpinion}
                                      >
                                        {uploadingOpinion ? (
                                          <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        ) : (
                                          <Upload className="h-4 w-4 mr-2" />
                                        )}
                                        Upload Opinion
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Opinion Documents */}
                            {application.opinion_files && application.opinion_files.length > 0 && (
                              <div className="bg-blue-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-slate-700 mb-4">Opinion Documents</h3>
                                <div className="space-y-2">
                                  {application.opinion_files.map((file: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 border border-blue-200">
                                      <div className="flex items-center space-x-2">
                                        <Check className="h-4 w-4 text-green-600" />
                                        <span className="font-medium">{file.name}</span>
                                        <span className="text-sm text-slate-500">({(file.size / 1024).toFixed(1)} KB)</span>
                                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">Opinion Uploaded</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          onClick={() => handleFileView(file, 'opinion-documents')}
                                        >
                                          <Download className="h-4 w-4" />
                                        </Button>
                                        {localStorage.getItem('employeeLogin') === 'true' && application.status !== 'submitted' && (
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => handleRemoveOpinion(index, file)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                
                                {/* Submit Opinion Button - Only show if employee is logged in and status is not already submitted */}
                                {localStorage.getItem('employeeLogin') === 'true' && application.status !== 'submitted' && (
                                  <div className="mt-4 pt-4 border-t border-blue-200">
                                    <Button 
                                      className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                                      onClick={() => setShowSignatureDialog(true)}
                                    >
                                      <Check className="h-4 w-4 mr-2" />
                                      Submit Opinion
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Query Communication Form */}
                            <div className="mt-6">
                              <QueryForm
                                applicationId={application.application_id}
                                currentUserType={localStorage.getItem('employeeLogin') === 'true' ? 'employee' : 'bank'}
                                currentUserName={
                                  localStorage.getItem('employeeLogin') === 'true' 
                                    ? localStorage.getItem('employeeUsername') || 'Employee'
                                    : localStorage.getItem('bankUsername') || 'Bank User'
                                }
                                currentUserEmail={
                                  localStorage.getItem('employeeLogin') === 'true' 
                                    ? 'employee@example.com'
                                    : application.email
                                }
                              />
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Submit Confirmation Dialog */}
        <Dialog open={showSubmitConfirmation} onOpenChange={setShowSubmitConfirmation}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Submission</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-slate-600">
                Are you sure you want to submit your opinion? Once submitted, you won't be able to make changes.
                {capturedSignature && (
                  <span className="block mt-2 text-green-600 font-medium">
                    ✓ Digital signature captured and will be applied to the document.
                  </span>
                )}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowSubmitConfirmation(false);
                  setCapturedSignature(null);
                }}
                disabled={submittingOpinion}
              >
                Cancel
              </Button>
              {!capturedSignature && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowSubmitConfirmation(false);
                    setShowSignatureDialog(true);
                  }}
                  disabled={submittingOpinion}
                  className="text-orange-600 border-orange-600 hover:bg-orange-50"
                >
                  Add Signature
                </Button>
              )}
              <Button 
                onClick={handleSubmitOpinion}
                disabled={submittingOpinion}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {submittingOpinion ? (
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : null}
                {capturedSignature ? 'Submit with Signature' : 'Submit Without Signature'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Digital Signature Dialog */}
        <DigitalSignature
          isOpen={showSignatureDialog}
          onClose={() => setShowSignatureDialog(false)}
          onSignatureCapture={handleSignatureCapture}
        />

        {/* No Results */}
        {!loading && filteredApplications.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No applications found</h3>
            <p className="text-slate-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default LoanApplications;