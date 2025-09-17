import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { EmployeeSidebar } from "@/components/EmployeeSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { showToast } from "@/lib/toast";
import { 
  Calendar, 
  Building2, 
  FileText, 
  Clock, 
  TrendingUp, 
  CheckCircle,
  Camera,
  LogOut
} from "lucide-react";

export default function EmployeeDashboard() {
  const navigate = useNavigate();

  // Mock data - in real app, this would come from API
  const analyticsData = {
    attendance: {
      totalDays: 22,
      presentDays: 20,
      percentage: 91,
    },
    banksSolved: 15,
    pendingCases: 8,
    totalCases: 45,
    recentActivity: [
      { type: "Bank Case Resolved", bank: "HDFC Bank", time: "2 hours ago" },
      { type: "Loan Application", client: "John Doe", time: "5 hours ago" },
      { type: "Recovery Complete", amount: "₹2,50,000", time: "1 day ago" },
    ]
  };


  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-employee-light font-kontora">
        <EmployeeSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-6 gap-4">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back! Here's your overview.</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Attendance Button */}
              <Button 
                onClick={() => navigate('/employee/attendance')}
                className="bg-employee-red hover:bg-employee-red-hover text-employee-red-foreground"
              >
                <Camera className="h-4 w-4 mr-2" />
                Enter Attendance
              </Button>
              
              {/* Logout Button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white border-red-600"
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
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 space-y-6">
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Attendance Rate
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-employee-red" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {analyticsData.attendance.percentage}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analyticsData.attendance.presentDays}/{analyticsData.attendance.totalDays} days this month
                  </p>
                  <div className="mt-2">
                    <Badge variant={analyticsData.attendance.percentage >= 90 ? "default" : "destructive"}>
                      {analyticsData.attendance.percentage >= 90 ? "Excellent" : "Needs Improvement"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Banks Solved
                  </CardTitle>
                  <Building2 className="h-4 w-4 text-employee-red" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {analyticsData.banksSolved}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Successfully resolved cases
                  </p>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-employee-red border-employee-red">
                      This Month
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pending Cases
                  </CardTitle>
                  <Clock className="h-4 w-4 text-employee-red" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {analyticsData.pendingCases}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Awaiting resolution
                  </p>
                  <div className="mt-2">
                    <Badge variant="destructive">
                      Action Required
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Cases
                  </CardTitle>
                  <FileText className="h-4 w-4 text-employee-red" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {analyticsData.totalCases}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Handled this year
                  </p>
                  <div className="flex items-center mt-2 text-employee-red">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    <span className="text-xs font-medium">+12% from last month</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/80">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">Recent Activity</CardTitle>
                <CardDescription>Your latest actions and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-employee-red" />
                        <div>
                          <p className="font-medium text-foreground">{activity.type}</p>
                          <p className="text-sm text-muted-foreground">
                            {activity.bank || activity.client || activity.amount}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-card bg-gradient-to-br from-card to-card/80">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">Quick Actions</CardTitle>
                <CardDescription>Frequently used actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="p-4 rounded-lg border border-employee-red/20 bg-employee-red/5 hover:bg-employee-red/10 transition-colors text-left">
                    <h3 className="font-medium text-foreground mb-1">New Loan Application</h3>
                    <p className="text-sm text-muted-foreground">Start a new loan application process</p>
                  </button>
                  <button className="p-4 rounded-lg border border-employee-red/20 bg-employee-red/5 hover:bg-employee-red/10 transition-colors text-left">
                    <h3 className="font-medium text-foreground mb-1">Check Recovery Status</h3>
                    <p className="text-sm text-muted-foreground">View ongoing recovery processes</p>
                  </button>
                  <button className="p-4 rounded-lg border border-employee-red/20 bg-employee-red/5 hover:bg-employee-red/10 transition-colors text-left">
                    <h3 className="font-medium text-foreground mb-1">Contact Bank</h3>
                    <p className="text-sm text-muted-foreground">Send request to partner banks</p>
                  </button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}