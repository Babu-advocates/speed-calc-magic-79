import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { BankEmployeeSidebar } from "@/components/BankEmployeeSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { HelpCircle, Send, Reply, Calendar, User, FileText, Paperclip, Download, Upload, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface QueryWithApplication {
  id: string;
  application_id: string;
  sender_type: 'employee' | 'bank';
  sender_name: string;
  sender_email?: string;
  message: string;
  attached_files: any[];
  is_read: boolean;
  created_at: string;
  updated_at: string;
  application?: {
    borrower_name: string;
    loan_type: string;
    bank_name: string;
    submitted_by: string;
  };
}

function BankEmployeeQueries() {
  const [queries, setQueries] = useState<QueryWithApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuery, setSelectedQuery] = useState<QueryWithApplication | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [replyAttachedFiles, setReplyAttachedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const replyFileInputRef = useRef<HTMLInputElement>(null);
  const [conversationQueries, setConversationQueries] = useState<QueryWithApplication[]>([]);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const { toast } = useToast();

  // Get current user info (in real app, this would come from auth)
  const currentUser = {
    type: 'bank' as const,
    name: 'Bank Representative',
    email: 'bank@example.com'
  };

  useEffect(() => {
    fetchQueries();
    
    // Set up real-time subscription for new queries
    const channel = supabase
      .channel('bank-queries-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queries'
        },
        () => {
          fetchQueries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      
      // Fetch all queries first
      const { data: queriesData, error: queriesError } = await supabase
        .from('queries')
        .select('*')
        .order('created_at', { ascending: false });

      if (queriesError) {
        console.error('Error fetching queries:', queriesError);
        toast({
          title: "Error",
          description: "Failed to load queries",
          variant: "destructive",
        });
        return;
      }

      // Fetch applications for each unique application_id
      const applicationIds = [...new Set(queriesData?.map(q => q.application_id) || [])];
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('applications')
        .select('application_id, borrower_name, loan_type, bank_name, submitted_by')
        .in('application_id', applicationIds);

      if (applicationsError) {
        console.error('Error fetching applications:', applicationsError);
      }

      // Combine queries with application data
      const formattedQueries = (queriesData || []).map(query => {
        const application = applicationsData?.find(app => app.application_id === query.application_id);
        return {
          ...query,
          sender_type: query.sender_type as 'employee' | 'bank',
          attached_files: (query.attached_files as any[]) || [],
          application
        };
      });

      setQueries(formattedQueries);
    } catch (error) {
      console.error('Error in fetchQueries:', error);
      toast({
        title: "Error",
        description: "Failed to load queries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchConversationQueries = async (applicationId: string) => {
    try {
      setLoadingConversation(true);
      
      // Fetch all queries for this application
      const { data: queriesData, error: queriesError } = await supabase
        .from('queries')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: true });

      if (queriesError) {
        console.error('Error fetching conversation queries:', queriesError);
        return;
      }

      // Get application details
      const { data: applicationData, error: applicationError } = await supabase
        .from('applications')
        .select('application_id, borrower_name, loan_type, bank_name, submitted_by')
        .eq('application_id', applicationId)
        .single();

      if (applicationError) {
        console.error('Error fetching application details:', applicationError);
      }

      // Format conversation queries
      const formattedConversationQueries = (queriesData || []).map(query => ({
        ...query,
        sender_type: query.sender_type as 'employee' | 'bank',
        attached_files: (query.attached_files as any[]) || [],
        application: applicationData
      }));

      setConversationQueries(formattedConversationQueries);
    } catch (error) {
      console.error('Error in fetchConversationQueries:', error);
    } finally {
      setLoadingConversation(false);
    }
  };

  const handleReplyDialogOpen = (query: QueryWithApplication) => {
    setSelectedQuery(query);
    setIsReplyDialogOpen(true);
    fetchConversationQueries(query.application_id);
  };

  const uploadReplyFiles = async (files: File[]): Promise<any[]> => {
    const uploadedFiles = [];

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedQuery?.application_id}_reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `${selectedQuery?.application_id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('query-attachments')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('query-attachments')
        .getPublicUrl(filePath);

      uploadedFiles.push({
        name: file.name,
        path: filePath,
        url: urlData.publicUrl,
        size: file.size,
        type: file.type,
        uploaded_at: new Date().toISOString()
      });
    }

    return uploadedFiles;
  };

  const handleReply = async () => {
    if (!selectedQuery || (!replyText.trim() && replyAttachedFiles.length === 0)) {
      toast({
        title: "Error",
        description: "Please enter a reply message or attach a file",
        variant: "destructive",
      });
      return;
    }

    try {
      setSending(true);
      setUploading(replyAttachedFiles.length > 0);

      let uploadedFiles: any[] = [];
      if (replyAttachedFiles.length > 0) {
        uploadedFiles = await uploadReplyFiles(replyAttachedFiles);
      }

      const { error } = await supabase
        .from('queries')
        .insert({
          application_id: selectedQuery.application_id,
          sender_type: currentUser.type,
          sender_name: currentUser.name,
          sender_email: currentUser.email,
          message: replyText.trim(),
          attached_files: uploadedFiles
        });

      if (error) {
        console.error('Error sending reply:', error);
        toast({
          title: "Error",
          description: "Failed to send reply",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Reply sent successfully",
        variant: "default",
      });

      setIsReplyDialogOpen(false);
      setReplyText("");
      setReplyAttachedFiles([]);
      setSelectedQuery(null);
      if (replyFileInputRef.current) {
        replyFileInputRef.current.value = "";
      }
      
      // Refresh queries
      fetchQueries();
    } catch (error) {
      console.error('Error in handleReply:', error);
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive",
      });
    } finally {
      setSending(false);
      setUploading(false);
    }
  };

  const handleReplyFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setReplyAttachedFiles(prev => [...prev, ...Array.from(files)]);
    }
  };

  const removeReplyAttachedFile = (index: number) => {
    setReplyAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDownloadFile = (file: any) => {
    window.open(file.url, '_blank');
  };

  const receivedQueries = queries.filter(q => q.sender_type === 'employee');
  const sentQueries = queries.filter(q => q.sender_type === 'bank');

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <BankEmployeeSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Queries</h1>
                <p className="text-gray-600">Manage received and sent queries</p>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6 bg-gray-50">
            <Tabs defaultValue="received" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="received">Received Queries</TabsTrigger>
                <TabsTrigger value="sent">Sent Queries</TabsTrigger>
              </TabsList>

              {/* Received Queries Tab */}
              <TabsContent value="received" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Received Queries</h2>
                  <div className="text-sm text-gray-600">
                    {receivedQueries.length} queries received
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-8 text-gray-500">
                    Loading queries...
                  </div>
                ) : receivedQueries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No queries received yet.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {receivedQueries.map((query) => (
                      <Card key={query.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                               <div className="flex items-center gap-2">
                                <CardTitle className="text-lg">Query #{query.id.slice(-8)}</CardTitle>
                                <Badge variant="destructive" className="text-xs">
                                  High
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  Pending Reply
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1 font-semibold text-primary">
                                  <FileText className="h-4 w-4" />
                                  App: {query.application_id}
                                </span>
                                <span className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  {query.application?.borrower_name || 'Unknown Applicant'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {formatDistanceToNow(new Date(query.created_at), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <CardDescription>
                            Sent by: {query.sender_name} | <strong>Loan Type:</strong> {query.application?.loan_type || 'N/A'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <p className="text-gray-700">{query.message}</p>
                            </div>
                            
                            {query.attached_files && query.attached_files.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium">Attachments:</h4>
                                {query.attached_files.map((file: any, fileIndex: number) => (
                                  <div
                                    key={fileIndex}
                                    className="flex items-center justify-between p-2 bg-gray-100 rounded text-sm cursor-pointer hover:bg-gray-200"
                                    onClick={() => handleDownloadFile(file)}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Paperclip className="h-4 w-4" />
                                      <span>{file.name}</span>
                                      <span className="text-gray-500">
                                        ({(file.size / 1024).toFixed(1)} KB)
                                      </span>
                                    </div>
                                    <Download className="h-4 w-4" />
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            <Button 
                              onClick={() => handleReplyDialogOpen(query)}
                              className="gap-2"
                            >
                              <Reply className="h-4 w-4" />
                              Reply to Query
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Sent Queries Tab */}
              <TabsContent value="sent" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Sent Queries</h2>
                  <div className="text-sm text-gray-600">
                    {sentQueries.length} queries sent
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-8 text-gray-500">
                    Loading queries...
                  </div>
                ) : sentQueries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No queries sent yet.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {sentQueries.map((query) => (
                      <Card key={query.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <CardTitle className="text-lg">Query #{query.id.slice(-8)}</CardTitle>
                                <Badge variant="secondary" className="text-xs">
                                  From Bank
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <FileText className="h-4 w-4" />
                                  App: {query.application_id}
                                </span>
                                <span className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  {query.application?.borrower_name || 'Unknown Applicant'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {formatDistanceToNow(new Date(query.created_at), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <CardDescription>
                            Sent by: {query.sender_name} | <strong>Loan Type:</strong> {query.application?.loan_type || 'N/A'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <p className="text-gray-700">{query.message}</p>
                            </div>
                            
                            {query.attached_files && query.attached_files.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium">Attachments:</h4>
                                {query.attached_files.map((file: any, fileIndex: number) => (
                                  <div
                                    key={fileIndex}
                                    className="flex items-center justify-between p-2 bg-gray-100 rounded text-sm cursor-pointer hover:bg-gray-200"
                                    onClick={() => handleDownloadFile(file)}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Paperclip className="h-4 w-4" />
                                      <span>{file.name}</span>
                                      <span className="text-gray-500">
                                        ({(file.size / 1024).toFixed(1)} KB)
                                      </span>
                                    </div>
                                    <Download className="h-4 w-4" />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Reply Dialog */}
            <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
              <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Reply to Query</DialogTitle>
                  <DialogDescription>
                    Reply to query for application {selectedQuery?.application_id}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {/* Conversation History */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Conversation History:</h4>
                    <div className="max-h-60 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                      {loadingConversation ? (
                        <div className="text-center py-4 text-gray-500">
                          Loading conversation...
                        </div>
                      ) : conversationQueries.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                          No conversation history
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {conversationQueries.map((query, index) => (
                            <div key={query.id} className="space-y-2">
                              <div className={`p-3 rounded-lg ${
                                query.sender_type === 'employee' 
                                  ? 'bg-blue-100 ml-4' 
                                  : 'bg-green-100 mr-4'
                              }`}>
                                <div className="flex items-center gap-2 mb-1">
                                  <User className="h-3 w-3" />
                                  <span className="text-xs font-medium">{query.sender_name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {query.sender_type === 'employee' ? 'Employee' : 'Bank'}
                                  </Badge>
                                  <span className="text-xs text-gray-500 ml-auto">
                                    {formatDistanceToNow(new Date(query.created_at), { addSuffix: true })}
                                  </span>
                                </div>
                                
                                {query.message && (
                                  <p className="text-sm mb-2">{query.message}</p>
                                )}
                                
                                {query.attached_files && query.attached_files.length > 0 && (
                                  <div className="space-y-1">
                                    {query.attached_files.map((file: any, fileIndex: number) => (
                                      <div
                                        key={fileIndex}
                                        className="flex items-center gap-1 text-xs p-1 bg-white/50 rounded cursor-pointer hover:bg-white/80"
                                        onClick={() => handleDownloadFile(file)}
                                      >
                                        <Paperclip className="h-3 w-3" />
                                        <span>{file.name}</span>
                                        <Download className="h-3 w-3 ml-auto" />
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* File Attachments for Reply */}
                  {replyAttachedFiles.length > 0 && (
                    <div className="border rounded-lg p-3">
                      <div className="text-sm font-medium mb-2">Attached Files:</div>
                      <div className="space-y-2">
                        {replyAttachedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                            <div className="flex items-center gap-2">
                              <Paperclip className="h-4 w-4" />
                              <span>{file.name}</span>
                              <span className="text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeReplyAttachedFile(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label htmlFor="reply">Your Reply</Label>
                    <Textarea
                      id="reply"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Enter your reply..."
                      rows={4}
                    />
                  </div>

                  {/* File Upload Section */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => replyFileInputRef.current?.click()}
                      disabled={sending || uploading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Attach Files
                    </Button>
                    <Input
                      ref={replyFileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleReplyFileSelect}
                    />
                    <span className="text-xs text-gray-500">
                      Attach documents to support your reply
                    </span>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsReplyDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleReply} 
                    className="gap-2"
                    disabled={sending || uploading || (!replyText.trim() && replyAttachedFiles.length === 0)}
                  >
                    {uploading ? (
                      <>Uploading Files...</>
                    ) : sending ? (
                      <>Sending...</>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Reply
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default BankEmployeeQueries;