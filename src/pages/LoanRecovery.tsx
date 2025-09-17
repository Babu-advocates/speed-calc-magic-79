import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Search, Filter, Building2, FileText, User, Calendar, RefreshCw, IndianRupee } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { useLocation } from "react-router-dom";

const LoanRecovery = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBank, setSelectedBank] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Sample loan recovery application data
  const recoveryApplications = [
    {
      id: "LR001",
      recoveryId: "LR-2024-001",
      name: "Arjun Reddy",
      bankName: "State Bank of India",
      outstandingAmount: "₹12,00,000",
      recoveredAmount: "₹3,00,000",
      status: "In Progress",
      date: "2024-01-10",
      loanType: "Home Loan",
      contactNumber: "+91 9876543210"
    },
    {
      id: "LR002",
      recoveryId: "LR-2024-002", 
      name: "Meera Joshi",
      bankName: "HDFC Bank",
      outstandingAmount: "₹5,50,000",
      recoveredAmount: "₹5,50,000",
      status: "Completed",
      date: "2024-01-12",
      loanType: "Personal Loan",
      contactNumber: "+91 9876543211"
    },
    {
      id: "LR003",
      recoveryId: "LR-2024-003",
      name: "Vikram Singh",
      bankName: "ICICI Bank", 
      outstandingAmount: "₹18,75,000",
      recoveredAmount: "₹0",
      status: "Legal Notice Sent",
      date: "2024-01-15",
      loanType: "Business Loan",
      contactNumber: "+91 9876543212"
    },
    {
      id: "LR004",
      recoveryId: "LR-2024-004",
      name: "Kavya Nair",
      bankName: "Axis Bank",
      outstandingAmount: "₹8,25,000", 
      recoveredAmount: "₹2,50,000",
      status: "In Progress",
      date: "2024-01-18",
      loanType: "Car Loan",
      contactNumber: "+91 9876543213"
    },
    {
      id: "LR005",
      recoveryId: "LR-2024-005",
      name: "Rohit Sharma",
      bankName: "Punjab National Bank",
      outstandingAmount: "₹22,00,000",
      recoveredAmount: "₹0",
      status: "Defaulted",
      date: "2024-01-20",
      loanType: "Home Loan", 
      contactNumber: "+91 9876543214"
    },
    {
      id: "LR006", 
      recoveryId: "LR-2024-006",
      name: "Anjali Gupta",
      bankName: "Kotak Mahindra Bank",
      outstandingAmount: "₹4,75,000",
      recoveredAmount: "₹1,50,000",
      status: "Settlement Negotiation",
      date: "2024-01-25",
      loanType: "Education Loan",
      contactNumber: "+91 9876543215"
    }
  ];

  const banks = [
    "State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank",
    "Punjab National Bank", "Kotak Mahindra Bank", "IndusInd Bank", "YES Bank"
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "In Progress": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Legal Notice Sent": return "bg-amber-100 text-amber-800 border-amber-200";
      case "Settlement Negotiation": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Defaulted": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const filteredApplications = recoveryApplications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.recoveryId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.bankName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBank = selectedBank === "all" || app.bankName === selectedBank;
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    
    return matchesSearch && matchesBank && matchesStatus;
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-legal-bg">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-gradient-to-r from-white/95 to-blue-50/95 backdrop-blur-sm shadow-elegant border-b border-white/20">
            <div className="px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger className="text-slate-600 hover:text-blue-600 transition-colors duration-200" />
                  <div className="h-6 w-px bg-slate-300"></div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-green-600 rounded-lg flex items-center justify-center">
                      <RefreshCw className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-emerald-600 bg-clip-text text-transparent">Loan Recovery</h1>
                      <p className="text-sm text-slate-600">Manage loan recovery cases</p>
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
                      placeholder="Search by name, recovery ID, or bank..."
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
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Legal Notice Sent">Legal Notice Sent</SelectItem>
                        <SelectItem value="Settlement Negotiation">Settlement Negotiation</SelectItem>
                        <SelectItem value="Defaulted">Defaulted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Recovery Applications Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredApplications.map((application, index) => (
                  <Card 
                    key={application.id} 
                    className="bg-gradient-to-br from-white/95 to-green-50/30 backdrop-blur-sm shadow-card border border-white/20 hover:shadow-2xl hover:shadow-green-100 transition-all duration-300 group cursor-pointer hover:scale-[1.02]"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <RefreshCw className="h-5 w-5 text-emerald-600" />
                          <CardTitle className="text-lg font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors duration-200">
                            {application.recoveryId}
                          </CardTitle>
                        </div>
                        <Badge className={`${getStatusColor(application.status)} font-medium px-3 py-1`}>
                          {application.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-slate-500" />
                          <CardDescription className="text-slate-600 font-medium">
                            {application.name}
                          </CardDescription>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-slate-500" />
                          <CardDescription className="text-slate-600 font-medium">
                            {application.bankName}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-500">Outstanding:</span>
                          <span className="font-semibold text-red-600">{application.outstandingAmount}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-500">Recovered:</span>
                          <span className="font-semibold text-emerald-600">{application.recoveredAmount}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-500">Loan Type:</span>
                          <span className="font-medium text-slate-700">{application.loanType}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 pt-2 border-t border-slate-200">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-500">Started on {application.date}</span>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 transition-all duration-300 transform hover:scale-105"
                        size="sm"
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* No Results */}
              {filteredApplications.length === 0 && (
                <div className="text-center py-12">
                  <RefreshCw className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-600 mb-2">No recovery cases found</h3>
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

export default LoanRecovery;