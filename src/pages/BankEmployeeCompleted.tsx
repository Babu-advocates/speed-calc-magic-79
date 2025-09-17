import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Search, CheckCircle, Download, Filter, DollarSign, FileCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BankEmployeeSidebar } from "@/components/BankEmployeeSidebar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const BankEmployeeCompleted = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [completedApplications, setCompletedApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Get the current bank's name from localStorage
  const bankLogin = localStorage.getItem("bankLogin");
  const bankName = localStorage.getItem("bankName") || "";

  // Fetch completed applications from Supabase
  useEffect(() => {
    const fetchCompletedApplications = async () => {
      try {
        setLoading(true);
        
        let query = supabase
          .from('applications')
          .select('*')
          .eq('status', 'completed')
          .eq('digital_signature_applied', true)
          .order('updated_at', { ascending: false });

        // If bank employee is logged in, filter by bank name
        if (bankLogin === "true" && bankName) {
          query = query.eq('submitted_by', bankName.toLowerCase());
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching completed applications:', error);
          toast({
            title: "Error",
            description: "Failed to fetch completed applications",
            variant: "destructive",
          });
          return;
        }

        setCompletedApplications(data || []);
      } catch (error) {
        console.error('Error in fetchCompletedApplications:', error);
        toast({
          title: "Error", 
          description: "Failed to fetch completed applications",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedApplications();
  }, [toast, bankLogin, bankName]);

  // Filter applications based on search and filters
  const filteredDocuments = completedApplications.filter(app => {
    const matchesSearch = searchTerm === "" || 
      app.borrower_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.application_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.application_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.assigned_to_username?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || app.status.toLowerCase() === statusFilter.toLowerCase();
    
    // For now, treating all completed digitally signed applications as "completed" payment status
    const matchesPayment = paymentFilter === "all" || paymentFilter === "completed";
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
      case "completed":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string = "completed") => {
    switch(status.toLowerCase()) {
      case "completed":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Completed</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleDownload = () => {
    // Create CSV content
    const headers = ["Application ID", "Application Type", "Borrower Name", "Loan Amount", "Bank Name", "Completed Date", "Assigned To", "Status"];
    const csvContent = [
      headers.join(","),
      ...filteredDocuments.map(app => [
        app.application_id,
        app.application_type,
        app.borrower_name,
        app.loan_amount,
        app.bank_name,
        new Date(app.updated_at).toLocaleDateString(),
        app.assigned_to_username || "N/A",
        app.status
      ].join(","))
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `completed_applications_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalAmount = filteredDocuments
    .reduce((sum, app) => sum + (app.loan_amount || 0), 0);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-bank-light">
        <BankEmployeeSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-6 gap-4">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="flex justify-between items-center flex-1">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-green-600 rounded-lg flex items-center justify-center">
                  <FileCheck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Completed Documents</h1>
                  <p className="text-sm text-muted-foreground">All approved applications with payment status</p>
                </div>
              </div>
              
              <Button 
                onClick={handleDownload}
                className="bg-bank-success hover:bg-bank-success/90"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="px-6 py-8">

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/80">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-6 w-6 text-bank-success" />
                      <h3 className="font-semibold text-muted-foreground">Total Approved</h3>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{filteredDocuments.length}</p>
                    <p className="text-sm text-muted-foreground mt-1">Applications approved</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/80">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="h-6 w-6 text-emerald-600" />
                      <h3 className="font-semibold text-muted-foreground">Payment Received</h3>
                    </div>
                    <p className="text-2xl font-bold text-emerald-600">₹{totalAmount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground mt-1">Total amount paid</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/80">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileCheck className="h-6 w-6 text-bank-navy" />
                      <h3 className="font-semibold text-muted-foreground">Payment Rate</h3>
                    </div>
                    <p className="text-2xl font-bold text-bank-navy">
                      {filteredDocuments.length > 0 ? Math.round((filteredDocuments.length / filteredDocuments.length) * 100) : 0}%
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Successful payments</p>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <Card className="mb-6 border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Filter className="h-5 w-5 text-bank-navy" />
                    <span>Filter Documents</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Search</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by applicant, type, case ID, or advocate..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Payment Status</label>
                      <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Payments</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Documents Table */}
              <Card className="border-0 shadow-card">
                <CardHeader>
                  <CardTitle>Completed Applications</CardTitle>
                  <CardDescription>
                    All digitally signed applications that have been completed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Application ID</TableHead>
                          <TableHead>Application Type</TableHead>
                          <TableHead>Borrower Name</TableHead>
                          <TableHead>Loan Amount</TableHead>
                          <TableHead>Bank Name</TableHead>
                          <TableHead>Completed Date</TableHead>
                          <TableHead>Assigned To</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">
                              <div className="flex items-center justify-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-bank-navy"></div>
                                <span>Loading completed applications...</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredDocuments.map((app) => (
                            <TableRow key={app.id} className="hover:bg-muted/50 transition-colors">
                              <TableCell className="font-medium text-bank-navy">{app.application_id}</TableCell>
                              <TableCell>{app.application_type}</TableCell>
                              <TableCell>{app.borrower_name}</TableCell>
                              <TableCell className="font-semibold">₹{(app.loan_amount || 0).toLocaleString()}</TableCell>
                              <TableCell>{app.bank_name}</TableCell>
                              <TableCell>{new Date(app.updated_at).toLocaleDateString()}</TableCell>
                              <TableCell>{app.assigned_to_username || "N/A"}</TableCell>
                              <TableCell>{getStatusBadge(app.status)}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {!loading && filteredDocuments.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p>No completed applications found matching your criteria</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default BankEmployeeCompleted;