import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster as HotToaster } from "react-hot-toast";
import Index from "./pages/Index";
import AdvocateLogin from "./pages/AdvocateLogin";
import EmployeeLogin from "./pages/EmployeeLogin";
import EmployeeNotifications from "./pages/EmployeeNotifications";
import BankLogin from "./pages/BankLogin";
import BankManagerDashboard from "./pages/BankManagerDashboard";
import DocumentTracking from "./pages/DocumentTracking";
import QueriesMonitoring from "./pages/QueriesMonitoring";
import ReportsAnalytics from "./pages/ReportsAnalytics";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import BankEmployeeDashboard from "./pages/BankEmployeeDashboard";
import LoanApplications from "./pages/LoanApplications";
import LoanRecovery from "./pages/LoanRecovery";
import CreateEmployeeAccount from "./pages/CreateEmployeeAccount";
import CreateBankAccount from "./pages/CreateBankAccount";
import CreateBankAccountList from "./pages/CreateBankAccountList";

import Attendance from "./pages/Attendance";
import PastApplications from "./pages/PastApplications";
import PaymentDetails from "./pages/PaymentDetails";
import BanksDealt from "./pages/BanksDealt";
import RequestToBank from "./pages/RequestToBank";
import ReceivedFromBank from "./pages/ReceivedFromBank";
import EmployeeAttendance from "./pages/EmployeeAttendance";
import CreateApplication from "./pages/CreateApplication";
import MySubmissions from "./pages/MySubmissions";
import BankEmployeeQueries from "./pages/BankEmployeeQueries";
import BankEmployeeCompleted from "./pages/BankEmployeeCompleted";
import BankEmployeePayments from "./pages/BankEmployeePayments";
import BankEmployeeHiringStatus from "./pages/BankEmployeeHiringStatus";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <HotToaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.1)',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '14px',
            fontWeight: '500',
            padding: '16px',
            maxWidth: '400px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/advocate-login" element={<AdvocateLogin />} />
          <Route path="/employee-login" element={<EmployeeLogin />} />
          <Route path="/bank-login" element={<BankLogin />} />
          <Route path="/bank-manager-dashboard" element={<BankManagerDashboard />} />
          <Route path="/bank-manager/document-tracking" element={<DocumentTracking />} />
          <Route path="/bank-manager/queries-monitoring" element={<QueriesMonitoring />} />
          <Route path="/bank-manager/reports-analytics" element={<ReportsAnalytics />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
          <Route path="/bank-employee-dashboard" element={<BankEmployeeDashboard />} />
          <Route path="/bank-employee/create-application" element={<CreateApplication />} />
          <Route path="/bank-employee/submissions" element={<MySubmissions />} />
          <Route path="/bank-employee/queries" element={<BankEmployeeQueries />} />
          <Route path="/bank-employee/completed" element={<BankEmployeeCompleted />} />
          <Route path="/bank-employee/payments" element={<BankEmployeePayments />} />
          <Route path="/bank-employee/hiring-status" element={<BankEmployeeHiringStatus />} />
          {/* Admin Routes */}
          <Route path="/admin/applications" element={<LoanApplications />} />
          <Route path="/admin/loan-recovery" element={<LoanRecovery />} />
          <Route path="/admin/past-applications" element={<PastApplications />} />
          <Route path="/admin/payment-details" element={<PaymentDetails />} />
          <Route path="/admin/create-employee-account" element={<CreateEmployeeAccount />} />
          <Route path="/admin/create-bank-account" element={<CreateBankAccount />} />
          <Route path="/admin/bank-accounts" element={<CreateBankAccountList />} />
          
          {/* Employee Routes */}
          <Route path="/employee/applications" element={<LoanApplications />} />
          <Route path="/employee/notifications" element={<EmployeeNotifications />} />
          <Route path="/employee/past-applications" element={<PastApplications />} />
          <Route path="/employee/request-to-bank" element={<RequestToBank />} />
          <Route path="/employee/received-from-bank" element={<ReceivedFromBank />} />
          
          
          {/* Shared Routes */}
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/employee/attendance" element={<EmployeeAttendance />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
