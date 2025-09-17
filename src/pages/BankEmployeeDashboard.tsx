import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { BankEmployeeSidebar } from "@/components/BankEmployeeSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { showToast } from "@/lib/toast";
import { 
  Upload, 
  Clock, 
  HelpCircle, 
  CheckCircle,
  FileText,
  DollarSign,
  AlertTriangle,
  Eye,
  Reply,
  Download,
  TrendingUp,
  Calendar,
  Building2,
  LogOut
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

export default function BankEmployeeDashboard() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");

  // Mock data
  const kpiData = {
    documentsSubmitted: { today: 3, thisMonth: 47 },
    pendingDocuments: 12,
    queriesReceived: 8,
    completedDocuments: 156
  };

  const submissions = [
    { id: "DOC001", type: "Loan Legal Opinion", submittedDate: "2024-01-15", status: "Under Review", priority: "high" },
    { id: "DOC002", type: "Loan Recovery", submittedDate: "2024-01-14", status: "Pending Assignment", priority: "medium" },
    { id: "DOC003", type: "Legal Opinion", submittedDate: "2024-01-13", status: "Completed", priority: "low" },
    { id: "DOC004", type: "Loan Recovery", submittedDate: "2024-01-12", status: "Query Raised", priority: "high" },
  ];

  const queries = [
    { 
      id: "Q001", 
      documentId: "DOC001", 
      raisedBy: "John Smith", 
      dateRaised: "2024-01-16", 
      deadline: "2024-01-18", 
      status: "Open",
      isOverdue: false
    },
    { 
      id: "Q002", 
      documentId: "DOC004", 
      raisedBy: "Sarah Johnson", 
      dateRaised: "2024-01-14", 
      deadline: "2024-01-16", 
      status: "Open",
      isOverdue: true
    },
    { 
      id: "Q003", 
      documentId: "DOC002", 
      raisedBy: "Mike Davis", 
      dateRaised: "2024-01-13", 
      deadline: "2024-01-17", 
      status: "Answered",
      isOverdue: false
    },
  ];

  const loanRecovery = [
    { id: "LR001", borrowerName: "ABC Enterprises", amount: "₹2,50,000", submissionDate: "2024-01-15", status: "In Progress" },
    { id: "LR002", borrowerName: "XYZ Corp", amount: "₹5,00,000", submissionDate: "2024-01-14", status: "Pending" },
    { id: "LR003", borrowerName: "Tech Solutions", amount: "₹1,75,000", submissionDate: "2024-01-13", status: "Completed" },
  ];

  const notifications = [
    { type: "urgent", message: "3 new queries to respond to", time: "5 min ago" },
    { type: "warning", message: "Document #DOC001 deadline approaching", time: "1 hour ago" },
    { type: "success", message: "Document #DOC003 has been signed", time: "2 hours ago" },
    { type: "info", message: "New loan recovery case assigned", time: "3 hours ago" },
  ];

  // Chart data
  const monthlyData = [
    { month: "Nov", submitted: 45, completed: 42 },
    { month: "Dec", submitted: 52, completed: 48 },
    { month: "Jan", submitted: 47, completed: 44 },
  ];

  const documentTypeData = [
    { name: "Legal Opinion", value: 65, color: "hsl(var(--bank-navy))" },
    { name: "Loan Recovery", value: 35, color: "hsl(var(--bank-success))" },
  ];

  const queriesOverTime = [
    { day: "Mon", queries: 4 },
    { day: "Tue", queries: 6 },
    { day: "Wed", queries: 3 },
    { day: "Thu", queries: 8 },
    { day: "Fri", queries: 5 },
    { day: "Sat", queries: 2 },
    { day: "Sun", queries: 1 },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge className="bg-bank-success text-bank-success-foreground">Completed</Badge>;
      case "Under Review":
        return <Badge className="bg-bank-warning text-bank-warning-foreground">Under Review</Badge>;
      case "Pending Assignment":
        return <Badge variant="secondary">Pending</Badge>;
      case "Query Raised":
        return <Badge variant="destructive">Query Raised</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-bank-light font-kontora">
        <BankEmployeeSidebar />
        
        <div className="flex-1 flex">
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-6 gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div className="flex-1">
                <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Dashboard</p>
              </div>
              
              {/* Logout Button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white border-red-600 ml-auto"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You will be redirected to the login page and will need to sign in again.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => {
                      showToast.success("Successfully logged out!");
                      navigate('/');
                    }} className="bg-red-600 hover:bg-red-700">
                      Yes, Logout
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </header>

            <main className="flex-1 p-6 space-y-6 overflow-auto">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/80">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Documents Submitted</CardTitle>
                    <Upload className="h-4 w-4 text-bank-navy" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{kpiData.documentsSubmitted.today}</div>
                    <p className="text-xs text-muted-foreground mt-1">Today / {kpiData.documentsSubmitted.thisMonth} this month</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/80">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Pending Documents</CardTitle>
                    <Clock className="h-4 w-4 text-bank-warning" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{kpiData.pendingDocuments}</div>
                    <p className="text-xs text-muted-foreground mt-1">Waiting for review/assignment</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/80">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Queries Received</CardTitle>
                    <HelpCircle className="h-4 w-4 text-destructive" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{kpiData.queriesReceived}</div>
                    <p className="text-xs text-muted-foreground mt-1">Sent back by advocates</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/80">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Completed Documents</CardTitle>
                    <CheckCircle className="h-4 w-4 text-bank-success" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{kpiData.completedDocuments}</div>
                    <p className="text-xs text-muted-foreground mt-1">Digitally signed & closed</p>
                  </CardContent>
                </Card>
              </div>

              {/* Notifications & Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="border-0 shadow-card">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-foreground">Notifications & Alerts</CardTitle>
                      <CardDescription>Recent updates and important notifications</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {notifications.map((notification, index) => (
                          <div 
                            key={index}
                            className={`p-4 rounded-lg border ${
                              notification.type === 'urgent' ? 'bg-red-50 border-red-200' :
                              notification.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                              notification.type === 'success' ? 'bg-green-50 border-green-200' :
                              'bg-blue-50 border-blue-200'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {notification.type === 'urgent' && <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />}
                              {notification.type === 'warning' && <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />}
                              {notification.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />}
                              {notification.type === 'info' && <FileText className="h-5 w-5 text-blue-600 mt-0.5" />}
                              <div className="flex-1">
                                <p className="font-medium text-foreground">{notification.message}</p>
                                <p className="text-sm text-muted-foreground">{notification.time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card className="border-0 shadow-card">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-foreground">Quick Stats</CardTitle>
                      <CardDescription>Performance overview</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-bank-navy" />
                            <span className="text-sm text-muted-foreground">Active Cases</span>
                          </div>
                          <span className="text-xl font-bold text-foreground">24</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-bank-success" />
                            <span className="text-sm text-muted-foreground">Completion Rate</span>
                          </div>
                          <span className="text-xl font-bold text-bank-success">94%</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-bank-warning" />
                            <span className="text-sm text-muted-foreground">Avg. Response Time</span>
                          </div>
                          <span className="text-xl font-bold text-foreground">2.3 hrs</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-bank-navy" />
                            <span className="text-sm text-muted-foreground">Recovery Amount</span>
                          </div>
                          <span className="text-xl font-bold text-foreground">₹8.25L</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <HelpCircle className="h-4 w-4 text-destructive" />
                            <span className="text-sm text-muted-foreground">Open Queries</span>
                          </div>
                          <span className="text-xl font-bold text-destructive">3</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}