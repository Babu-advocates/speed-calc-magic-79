import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster as HotToaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoute";
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
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/advocate-login" element={<AdvocateLogin />} />
          <Route path="/employee-login" element={<EmployeeLogin />} />
          <Route path="/bank-login" element={<BankLogin />} />
          
          {/* Admin Protected Routes */}
          <Route path="/admin-dashboard" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/applications" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <LoanApplications />
            </ProtectedRoute>
          } />
          <Route path="/admin/loan-recovery" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <LoanRecovery />
            </ProtectedRoute>
          } />
          <Route path="/admin/past-applications" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <PastApplications />
            </ProtectedRoute>
          } />
          <Route path="/admin/payment-details" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <PaymentDetails />
            </ProtectedRoute>
          } />
          <Route path="/admin/create-employee-account" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CreateEmployeeAccount />
            </ProtectedRoute>
          } />
          <Route path="/admin/create-bank-account" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CreateBankAccount />
            </ProtectedRoute>
          } />
          <Route path="/admin/bank-accounts" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CreateBankAccountList />
            </ProtectedRoute>
          } />
          
          {/* Employee Protected Routes */}
          <Route path="/employee-dashboard" element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <EmployeeDashboard />
            </ProtectedRoute>
          } />
          <Route path="/employee/applications" element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <LoanApplications />
            </ProtectedRoute>
          } />
          <Route path="/employee/notifications" element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <EmployeeNotifications />
            </ProtectedRoute>
          } />
          <Route path="/employee/past-applications" element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <PastApplications />
            </ProtectedRoute>
          } />
          <Route path="/employee/request-to-bank" element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <RequestToBank />
            </ProtectedRoute>
          } />
          <Route path="/employee/received-from-bank" element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <ReceivedFromBank />
            </ProtectedRoute>
          } />
          <Route path="/employee/attendance" element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <EmployeeAttendance />
            </ProtectedRoute>
          } />
          
          {/* Bank Manager Protected Routes */}
          <Route path="/bank-manager-dashboard" element={
            <ProtectedRoute allowedRoles={["bank-manager"]}>
              <BankManagerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/bank-manager/document-tracking" element={
            <ProtectedRoute allowedRoles={["bank-manager"]}>
              <DocumentTracking />
            </ProtectedRoute>
          } />
          <Route path="/bank-manager/queries-monitoring" element={
            <ProtectedRoute allowedRoles={["bank-manager"]}>
              <QueriesMonitoring />
            </ProtectedRoute>
          } />
          <Route path="/bank-manager/reports-analytics" element={
            <ProtectedRoute allowedRoles={["bank-manager"]}>
              <ReportsAnalytics />
            </ProtectedRoute>
          } />
          
          {/* Bank Employee Protected Routes */}
          <Route path="/bank-employee-dashboard" element={
            <ProtectedRoute allowedRoles={["bank-employee"]}>
              <BankEmployeeDashboard />
            </ProtectedRoute>
          } />
          <Route path="/bank-employee/create-application" element={
            <ProtectedRoute allowedRoles={["bank-employee"]}>
              <CreateApplication />
            </ProtectedRoute>
          } />
          <Route path="/bank-employee/submissions" element={
            <ProtectedRoute allowedRoles={["bank-employee"]}>
              <MySubmissions />
            </ProtectedRoute>
          } />
          <Route path="/bank-employee/queries" element={
            <ProtectedRoute allowedRoles={["bank-employee"]}>
              <BankEmployeeQueries />
            </ProtectedRoute>
          } />
          <Route path="/bank-employee/completed" element={
            <ProtectedRoute allowedRoles={["bank-employee"]}>
              <BankEmployeeCompleted />
            </ProtectedRoute>
          } />
          <Route path="/bank-employee/payments" element={
            <ProtectedRoute allowedRoles={["bank-employee"]}>
              <BankEmployeePayments />
            </ProtectedRoute>
          } />
          <Route path="/bank-employee/hiring-status" element={
            <ProtectedRoute allowedRoles={["bank-employee"]}>
              <BankEmployeeHiringStatus />
            </ProtectedRoute>
          } />
          
          {/* Shared Routes - Allow both admin and employee */}
          <Route path="/attendance" element={
            <ProtectedRoute allowedRoles={["admin", "employee"]}>
              <Attendance />
            </ProtectedRoute>
          } />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
