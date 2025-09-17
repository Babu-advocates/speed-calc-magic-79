import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Send, Upload, Download, User, Clock, Paperclip } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Query {
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
}

interface QueryFormProps {
  applicationId: string;
  currentUserType: 'employee' | 'bank';
  currentUserName: string;
  currentUserEmail?: string;
}

export function QueryForm({ applicationId, currentUserType, currentUserName, currentUserEmail }: QueryFormProps) {
  const [queries, setQueries] = useState<Query[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchQueries();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('queries-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queries',
          filter: `application_id=eq.${applicationId}`
        },
        () => {
          fetchQueries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [applicationId]);

  useEffect(() => {
    scrollToBottom();
  }, [queries]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchQueries = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('queries')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching queries:', error);
        return;
      }

      setQueries((data || []).map(query => ({
        ...query,
        sender_type: query.sender_type as 'employee' | 'bank',
        attached_files: (query.attached_files as any[]) || []
      })));
    } catch (error) {
      console.error('Error in fetchQueries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setAttachedFiles(prev => [...prev, ...Array.from(files)]);
    }
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (files: File[]): Promise<any[]> => {
    const uploadedFiles = [];

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${applicationId}_query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `${applicationId}/${fileName}`;

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

  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please enter a message or attach a file",
        variant: "destructive",
      });
      return;
    }

    try {
      setSending(true);
      setUploading(attachedFiles.length > 0);

      let uploadedFiles: any[] = [];
      if (attachedFiles.length > 0) {
        uploadedFiles = await uploadFiles(attachedFiles);
      }

      const { error } = await supabase
        .from('queries')
        .insert({
          application_id: applicationId,
          sender_type: currentUserType,
          sender_name: currentUserName,
          sender_email: currentUserEmail,
          message: newMessage.trim(),
          attached_files: uploadedFiles
        });

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        });
        return;
      }

      setNewMessage("");
      setAttachedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast({
        title: "Success",
        description: "Message sent successfully",
        variant: "default",
      });

      // Refresh queries will happen automatically via real-time subscription
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
      setUploading(false);
    }
  };

  const handleDownloadFile = (file: any) => {
    window.open(file.url, '_blank');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Query Communication
        </CardTitle>
        <CardDescription>
          Communicate with the {currentUserType === 'employee' ? 'bank' : 'assigned employee'} about this application. All queries include application sender details.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages Thread */}
        <div className="border rounded-lg">
          <ScrollArea className="h-[300px] p-4">
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Loading messages...
              </div>
            ) : queries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No messages yet. Start a conversation!
              </div>
            ) : (
              <div className="space-y-4">
                {queries.map((query, index) => (
                  <div key={query.id} className="space-y-2">
                    <div className={`flex ${query.sender_type === currentUserType ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-lg p-3 ${
                        query.sender_type === currentUserType 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-3 w-3" />
                          <span className="text-xs font-medium">{query.sender_name}</span>
                          <Badge variant="outline" className="text-xs">
                            {query.sender_type === 'employee' ? 'Employee' : 'Bank'}
                          </Badge>
                        </div>
                        
                        {query.message && (
                          <p className="text-sm mb-2 whitespace-pre-wrap">{query.message}</p>
                        )}
                        
                        {query.attached_files && query.attached_files.length > 0 && (
                          <div className="space-y-1">
                            {query.attached_files.map((file: any, fileIndex: number) => (
                              <div
                                key={fileIndex}
                                className="flex items-center justify-between p-2 bg-background/20 rounded text-xs cursor-pointer hover:bg-background/40"
                                onClick={() => handleDownloadFile(file)}
                              >
                                <div className="flex items-center gap-1">
                                  <Paperclip className="h-3 w-3" />
                                  <span>{file.name}</span>
                                  <span className="text-muted-foreground">
                                    ({(file.size / 1024).toFixed(1)} KB)
                                  </span>
                                </div>
                                <Download className="h-3 w-3" />
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1 mt-2 text-xs opacity-70">
                          <Clock className="h-3 w-3" />
                          <span>{formatDistanceToNow(new Date(query.created_at), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                    
                    {index < queries.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Message Composer */}
        <div className="space-y-3">
          {/* File Attachments */}
          {attachedFiles.length > 0 && (
            <div className="border rounded-lg p-3">
              <div className="text-sm font-medium mb-2">Attached Files:</div>
              <div className="space-y-2">
                {attachedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4" />
                      <span>{file.name}</span>
                      <span className="text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeAttachedFile(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message Input */}
          <Textarea
            placeholder="Type your message here..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="min-h-[100px]"
          />

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={sending}
              >
                <Upload className="h-4 w-4 mr-2" />
                Attach Files
              </Button>
              <Input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            <Button
              onClick={handleSendMessage}
              disabled={sending || uploading || (!newMessage.trim() && attachedFiles.length === 0)}
            >
              {uploading ? (
                <>Uploading Files...</>
              ) : sending ? (
                <>Sending...</>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}