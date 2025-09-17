import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History, FileText, Calendar, User, DollarSign, CheckCircle, XCircle, Eye, Building2, ArrowUpDown, Loader2, Phone, Mail, MapPin, Download, Scale, MessageSquare } from "lucide-react";
import { EmployeeSidebar } from "@/components/EmployeeSidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Application {
  id: string;
  application_id: string;
  borrower_name: string;
  loan_type: string;
  loan_amount: number;
  status: string;
  submission_date: string;
  bank_name: string;
  created_at: string;
  updated_at: string;
}

const PastApplications = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [selectedBank, setSelectedBank] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [signedDocuments, setSignedDocuments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"litigation" | "legal-opinion">("litigation");

  // Determine if this is an admin route
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Fetch signed documents for the selected application
  const fetchSignedDocuments = async (applicationId: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('signed-documents')
        .list('', {
          search: applicationId
        });

      if (error) {
        console.error('Error fetching signed documents:', error);
        return [];
      }

      // Filter files that contain the application ID in their name
      const filteredFiles = data?.filter(file => 
        file.name.includes(applicationId)
      ) || [];

      // Get public URLs for the files
      const documentsWithUrls = filteredFiles.map(file => ({
        ...file,
        url: supabase.storage.from('signed-documents').getPublicUrl(file.name).data.publicUrl
      }));

      return documentsWithUrls;
    } catch (error) {
      console.error('Error fetching signed documents:', error);
      return [];
    }
  };

  // Fetch applications from Supabase
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('applications')
          .select('*')
          .in('status', ['approved', 'rejected', 'completed', 'submitted'])
          .order('updated_at', { ascending: false });

        if (error) {
          throw error;
        }

        setApplications(data || []);
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast({
          title: "Error",
          description: "Failed to fetch applications. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [toast]);

  // Fetch signed documents when application is selected
  useEffect(() => {
    if (selectedApplication?.application_id) {
      fetchSignedDocuments(selectedApplication.application_id).then(setSignedDocuments);
    }
  }, [selectedApplication]);

  // Get unique banks for filter
  const banks = useMemo(() => {
    const uniqueBanks = [...new Set(applications
      .map(app => app.bank_name)
      .filter(bankName => bankName && bankName.trim() !== '') // Filter out empty/null bank names
    )];
    return uniqueBanks.sort();
  }, [applications]);

  // Count applications by type
  const litigationCount = useMemo(() => {
    return applications.filter(app => {
      const loanType = app.loan_type?.toLowerCase() || '';
      return loanType.includes('litigation');
    }).length;
  }, [applications]);

  const legalOpinionCount = useMemo(() => {
    return applications.filter(app => {
      const loanType = app.loan_type?.toLowerCase() || '';
      return loanType.includes('legal') || loanType.includes('opinion');
    }).length;
  }, [applications]);

  // Filter and sort applications
  const filteredAndSortedApplications = useMemo(() => {
    let filtered = applications;

    // Filter by application type (Litigation vs Legal Opinion)
    filtered = filtered.filter(app => {
      const loanType = app.loan_type?.toLowerCase() || '';
      if (activeTab === "litigation") {
        return loanType.includes('litigation');
      } else {
        return loanType.includes('legal') || loanType.includes('opinion');
      }
    });

    // Filter by bank
    if (selectedBank !== "all") {
      filtered = filtered.filter(app => app.bank_name === selectedBank);
    }

    // Sort by date
    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.updated_at);
      const dateB = new Date(b.updated_at);
      
      return sortOrder === "newest" 
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });

    return sorted;
  }, [applications, selectedBank, sortOrder, activeTab]);
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "submitted":
        return <FileText className="h-4 w-4 text-blue-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Rejected
          </Badge>
        );
      case "submitted":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            Submitted
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
            Completed
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
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
          toast({
            title: 'Error',
            description: 'Could not access file',
            variant: 'destructive'
          });
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
        toast({
          title: 'Error',
          description: 'Could not check file availability',
          variant: 'destructive'
        });
        return;
      }

      const foundFile = fileList?.find(f => f.name === fileName);
      if (!foundFile) {
        toast({
          title: 'File Not Found',
          description: 'The document was not found in storage.',
          variant: 'destructive'
        });
        return;
      }

      // File found at root level
      const { data: signedUrlData, error: signedError } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(fileName, 3600);

      if (signedError) {
        console.error('Error creating signed URL:', signedError);
        toast({
          title: 'Error',
          description: 'Could not access file',
          variant: 'destructive'
        });
        return;
      }

      if (signedUrlData?.signedUrl) {
        await downloadFile(signedUrlData.signedUrl, fileName);
      } else {
        toast({
          title: 'Error',
          description: 'Could not access file',
          variant: 'destructive'
        });
      }

    } catch (error) {
      console.error('Error in handleFileView:', error);
      toast({
        title: 'Error',
        description: 'Failed to access document',
        variant: 'destructive'
      });
    }
  };

  const downloadFile = async (url: string, fileName: string) => {
    try {
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
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      
      toast({
        title: 'Success',
        description: `${fileName} downloaded successfully`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Download error:', error);
      
      try {
        const newWindow = window.open(url, '_blank');
        if (!newWindow) {
          toast({
            title: 'Popup Blocked',
            description: 'Please allow popups or check your downloads folder',
            variant: 'destructive'
          });
        }
      } catch (fallbackError) {
        toast({
          title: 'Error',
          description: 'Could not download or open the file',
          variant: 'destructive'
        });
      }
    }
  };

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
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg flex items-center justify-center">
                      <History className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-amber-600 bg-clip-text text-transparent">Past Applications</h1>
                      <p className="text-sm text-slate-600">View completed loan applications</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="px-6 py-8">
              <Card className="bg-white/95 backdrop-blur-sm shadow-elegant border border-white/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Completed Applications
                      </CardTitle>
                      <CardDescription>
                        Showing {filteredAndSortedApplications.length} of {activeTab === "litigation" ? litigationCount : legalOpinionCount} {activeTab === "litigation" ? "litigation" : "legal opinion"} applications
                      </CardDescription>
                    </div>
                    
                    {/* Sorting Controls */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-slate-500" />
                        <Select value={selectedBank} onValueChange={setSelectedBank}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by bank" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Banks</SelectItem>
                            {banks.map((bank) => (
                              <SelectItem key={bank} value={bank}>
                                {bank}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <ArrowUpDown className="h-4 w-4 text-slate-500" />
                        <Select value={sortOrder} onValueChange={(value: "newest" | "oldest") => setSortOrder(value)}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="oldest">Oldest First</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "litigation" | "legal-opinion")} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="litigation" className="flex items-center gap-2">
                        <Scale className="h-4 w-4" />
                        Litigation
                        <Badge variant="secondary" className="ml-2">
                          {litigationCount}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger value="legal-opinion" className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Legal Opinion
                        <Badge variant="secondary" className="ml-2">
                          {legalOpinionCount}
                        </Badge>
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value={activeTab} className="mt-4">
                      {loading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
                          <span className="ml-2 text-slate-600">Loading applications...</span>
                        </div>
                      ) : filteredAndSortedApplications.length === 0 ? (
                        <div className="text-center py-8">
                          <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-slate-900 mb-2">No {activeTab === "litigation" ? "Litigation" : "Legal Opinion"} applications found</h3>
                          <p className="text-slate-600">No {activeTab === "litigation" ? "litigation" : "legal opinion"} applications match your current filters.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                      {filteredAndSortedApplications.map((application) => (
                        <Card key={application.id} className="border border-slate-200 hover:shadow-md transition-shadow duration-200">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-semibold text-slate-800">
                                      {application.borrower_name}
                                    </h3>
                                    <div className="flex items-center gap-1">
                                      {getStatusIcon(application.status)}
                                      {getStatusBadge(application.status)}
                                    </div>
                                  </div>
                                  <div className="text-sm text-slate-500">
                                    ID: {application.application_id}
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-slate-400" />
                                    <span className="text-slate-600 font-medium">{application.bank_name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-slate-400" />
                                    <span className="text-slate-600">{application.loan_type}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-slate-400" />
                                    <span className="text-slate-600">₹{Number(application.loan_amount).toLocaleString()}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-slate-400" />
                                    <span className="text-slate-600">
                                      Updated: {new Date(application.updated_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="ml-4">
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
                                        Application Details - {selectedApplication?.application_id}
                                      </DialogTitle>
                                    </DialogHeader>
                                    
                                    {selectedApplication && (
                                      <div className="space-y-6 mt-4">
                                        {/* Status */}
                                        <div className="flex items-center justify-between">
                                          <h3 className="text-lg font-semibold text-slate-700">Status</h3>
                                          {getStatusBadge(selectedApplication.status)}
                                        </div>

                                        {/* Borrower Information */}
                                        <div className="bg-slate-50 rounded-lg p-4">
                                          <h3 className="text-lg font-semibold text-slate-700 mb-4">Borrower Information</h3>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center space-x-2">
                                              <User className="h-4 w-4 text-slate-500" />
                                              <span className="text-sm text-slate-500">Name:</span>
                                              <span className="font-medium">{selectedApplication.borrower_name}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                              <FileText className="h-4 w-4 text-slate-500" />
                                              <span className="text-sm text-slate-500">Customer ID:</span>
                                              <span className="font-medium">{(selectedApplication as any).customer_id || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                              <Phone className="h-4 w-4 text-slate-500" />
                                              <span className="text-sm text-slate-500">Phone:</span>
                                              <span className="font-medium">{(selectedApplication as any).phone || (selectedApplication as any).contact_number || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                              <Mail className="h-4 w-4 text-slate-500" />
                                              <span className="text-sm text-slate-500">Email:</span>
                                              <span className="font-medium">{(selectedApplication as any).email || 'N/A'}</span>
                                            </div>
                                          </div>
                                          {(selectedApplication as any).address && (
                                            <div className="mt-4 flex items-start space-x-2">
                                              <MapPin className="h-4 w-4 text-slate-500 mt-1" />
                                              <span className="text-sm text-slate-500">Address:</span>
                                              <span className="font-medium">{(selectedApplication as any).address}</span>
                                            </div>
                                          )}
                                        </div>

                                        {/* Loan Information */}
                                        <div className="bg-blue-50 rounded-lg p-4">
                                          <h3 className="text-lg font-semibold text-slate-700 mb-4">Loan Information</h3>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center space-x-2">
                                              <Building2 className="h-4 w-4 text-slate-500" />
                                              <span className="text-sm text-slate-500">Bank:</span>
                                              <span className="font-medium">{selectedApplication.bank_name}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                              <FileText className="h-4 w-4 text-slate-500" />
                                              <span className="text-sm text-slate-500">Application Type:</span>
                                              <span className="font-medium">{(selectedApplication as any).application_type || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                              <DollarSign className="h-4 w-4 text-slate-500" />
                                              <span className="text-sm text-slate-500">Loan Type:</span>
                                              <span className="font-medium">{selectedApplication.loan_type}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                              <span className="text-sm text-slate-500">Loan Amount:</span>
                                              <span className="font-semibold text-emerald-600">₹{Number(selectedApplication.loan_amount).toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                              <Calendar className="h-4 w-4 text-slate-500" />
                                              <span className="text-sm text-slate-500">Submission Date:</span>
                                              <span className="font-medium">{new Date(selectedApplication.submission_date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                              <Calendar className="h-4 w-4 text-slate-500" />
                                              <span className="text-sm text-slate-500">Updated Date:</span>
                                              <span className="font-medium">{new Date(selectedApplication.updated_at).toLocaleDateString()}</span>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Assignment Status */}
                                        {(selectedApplication as any).assigned_to_username && (
                                          <div className="bg-green-50 rounded-lg p-4">
                                            <h3 className="text-lg font-semibold text-slate-700 mb-2">Assigned To</h3>
                                            <div className="flex items-center space-x-2">
                                              <User className="h-4 w-4 text-green-600" />
                                              <span className="font-medium text-green-700">{(selectedApplication as any).assigned_to_username}</span>
                                            </div>
                                          </div>
                                        )}

                                        {/* Additional Information */}
                                        {(selectedApplication as any).additional_notes && (
                                          <div className="bg-yellow-50 rounded-lg p-4">
                                            <h3 className="text-lg font-semibold text-slate-700 mb-2">Additional Notes</h3>
                                            <p className="text-slate-600">{(selectedApplication as any).additional_notes}</p>
                                          </div>
                                        )}

                                        {/* Uploaded Files */}
                                        {(selectedApplication as any).uploaded_files && (selectedApplication as any).uploaded_files.length > 0 && (
                                          <div className="bg-green-50 rounded-lg p-4">
                                            <h3 className="text-lg font-semibold text-slate-700 mb-4">Uploaded Documents</h3>
                                            <div className="space-y-2">
                                              {(selectedApplication as any).uploaded_files.map((file: any, index: number) => (
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
                                          </div>
                                        )}

                                        {/* Signed Documents */}
                                        {signedDocuments.length > 0 && (
                                          <div className="bg-blue-50 rounded-lg p-4">
                                            <h3 className="text-lg font-semibold text-slate-700 mb-4">Digitally Signed Documents</h3>
                                            <div className="space-y-2">
                                              {signedDocuments.map((file: any, index: number) => (
                                                <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 border border-blue-200">
                                                  <div className="flex items-center space-x-2">
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                    <span className="font-medium">{file.name}</span>
                                                    <span className="text-sm text-slate-500">({(file.size / 1024).toFixed(1)} KB)</span>
                                                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Digitally Signed</span>
                                                  </div>
                                                  <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => handleFileView(file, 'signed-documents')}
                                                  >
                                                    <Download className="h-4 w-4" />
                                                  </Button>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default PastApplications;