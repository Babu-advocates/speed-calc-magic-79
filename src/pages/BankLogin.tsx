import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Landmark, Mail, Lock, ArrowLeft, Users, CreditCard, Copy, Eye, EyeOff, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import lawyerIllustration from "@/assets/lawyer-illustration.png";
import { supabase } from "@/integrations/supabase/client";

const BankLogin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"manager" | "employee">("manager");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);

  useEffect(() => {
    const fetchBankAccounts = async () => {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('username, password, bank_name')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (data && !error) {
        setBankAccounts(data);
      }
    };

    fetchBankAccounts();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      // Check against bank_accounts table for bank employee login
      if (activeTab === "employee") {
        console.log("Attempting bank employee login with:", { username: username.trim(), password });
        
        const { data, error } = await supabase
          .from('bank_accounts')
          .select('*')
          .eq('username', username.trim())
          .eq('password', password)
          .eq('is_active', true)
          .maybeSingle();

        console.log("Supabase query result:", { data, error });
        console.log("Query parameters:", { username: username.trim(), password, is_active: true });

        if (error) {
          console.log("Database error:", error);
          toast.error("An error occurred during login");
          setIsLoading(false);
          return;
        }

        if (!data) {
          console.log("Login failed - no matching record found");
          toast.error("Invalid username or password");
          setIsLoading(false);
          return;
        }

        console.log("Login successful for bank:", data.bank_name);
        // Store bank account info in localStorage for the session
        localStorage.setItem("bankEmployeeLogin", "true");
        localStorage.setItem("bankAccountId", data.id);
        localStorage.setItem("bankName", data.bank_name);
        localStorage.setItem("bankUsername", data.username);
        toast.success(`Welcome Bank Employee from ${data.bank_name}!`);
        navigate("/bank-employee-dashboard");
      } else {
        // Keep manager login as demo for now
        const credentials = demoCredentials[activeTab];
        if (username === credentials.email && password === credentials.password) {
          localStorage.setItem("bankManagerLogin", "true");
          toast.success("Welcome Bank Manager!");
          navigate("/bank-manager-dashboard");
        } else {
          toast.error("Invalid credentials. Please use the demo credentials provided.");
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const demoCredentials = {
    manager: { email: "manager@yourbank.com", password: "manager123" },
    employee: { email: "employee@yourbank.com", password: "employee123" }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Static decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-slate-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-slate-300 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-slate-200 rounded-full blur-3xl"></div>
      </div>
      
      {/* Back to Home - Top Left */}
      <Link to="/" className="absolute top-4 left-4 inline-flex items-center text-slate-600 hover:text-slate-800 transition-colors z-10">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Link>
      
      <div className="w-full max-w-2xl relative z-10 animate-fade-in">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-elegant overflow-hidden border border-white/20 animate-scale-in">
          {/* Tab Headers */}
          <div className="flex">
            <button
              onClick={() => setActiveTab("manager")}
              className={`flex-1 px-6 py-4 text-center font-medium transition-all duration-200 rounded-tl-3xl ${
                activeTab === "manager"
                  ? "text-white bg-admin-blue"
                  : "text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-800"
              }`}
            >
              Bank Manager Login
            </button>
            <button
              onClick={() => setActiveTab("employee")}
              className={`flex-1 px-6 py-4 text-center font-medium transition-all duration-200 rounded-tr-3xl ${
                activeTab === "employee"
                  ? "text-white bg-employee-red"
                  : "text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-800"
              }`}
            >
              Bank Employee Login
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-0">
            {/* Left Side - Illustration */}
            <div className={`p-6 flex flex-col items-center justify-center text-center relative overflow-hidden transition-all duration-300 ${
              activeTab === "manager" 
                ? "bg-gradient-to-br from-admin-blue via-admin-blue-hover to-legal-deep-blue"
                : "bg-gradient-to-br from-employee-red via-employee-red-hover to-red-700"
            }`}>
              {/* Decorative accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full blur-lg"></div>
              
              <div className="mb-4 relative">
                <div className="w-28 h-28 bg-white rounded-xl shadow-md flex items-center justify-center mb-3 relative overflow-hidden">
                  <img 
                    src={lawyerIllustration} 
                    alt="Banking Professional" 
                    className="w-20 h-20 object-contain"
                  />
                  <div className={`absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                    activeTab === "manager" ? "bg-admin-blue" : "bg-employee-red"
                  }`}>
                    {activeTab === "manager" ? 
                      <Landmark className="w-3 h-3 text-white" /> : 
                      <CreditCard className="w-3 h-3 text-white" />
                    }
                  </div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 bg-yellow-400 rounded-full"></div>
                </div>
              </div>
              
              <h2 className="text-lg font-bold text-white mb-1 relative z-10">
                Welcome {activeTab === "manager" ? "Bank Manager!" : "Bank Employee!"}
              </h2>
              <p className="text-xs text-white/80 relative z-10">
                {activeTab === "manager" 
                  ? "Manage your banking operations and oversee legal documentation processes"
                  : "Access your employee portal and manage assigned banking tasks"
                }
              </p>
            </div>

            {/* Right Side - Login Form */}
            <div className="p-6">
              <div className="text-center mb-4">
                <p className="text-xs text-slate-500 mb-2">
                  Use the demo credentials below to sign in
                </p>
                <h3 className={`text-xl font-bold mb-1 transition-colors duration-300 ${
                  activeTab === "manager" ? "text-admin-blue" : "text-employee-red"
                }`}>
                  Welcome Back
                </h3>
                <p className="text-sm text-slate-600">
                  Sign in to your Legal account as {activeTab === "manager" ? "Bank Manager" : "Bank Employee"}
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-slate-700">
                    {activeTab === "manager" ? "Email Address" : "Username"}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400 transition-colors duration-200" />
                    <Input
                      id="username"
                      type={activeTab === "manager" ? "email" : "text"}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={activeTab === "manager" ? "manager@yourbank.com" : "Enter your username"}
                      className={`pl-10 h-10 rounded-lg border-slate-200 transition-all duration-300 hover:border-slate-300 ${
                        activeTab === "manager" 
                          ? "focus:border-admin-blue focus:ring-admin-blue"
                          : "focus:border-employee-red focus:ring-employee-red"
                      }`}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400 transition-colors duration-200" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your secure password"
                      className={`pl-10 pr-10 h-10 rounded-lg border-slate-200 transition-all duration-300 hover:border-slate-300 ${
                        activeTab === "manager" 
                          ? "focus:border-admin-blue focus:ring-admin-blue"
                          : "focus:border-employee-red focus:ring-employee-red"
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className={`w-full h-10 text-sm font-medium text-white rounded-lg mt-4 transition-all duration-200 ${
                    activeTab === "manager"
                      ? "bg-admin-blue hover:bg-admin-blue-hover"
                      : "bg-employee-red hover:bg-employee-red-hover"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing In...
                    </>
                  ) : (
                    `Sign In as ${activeTab === "manager" ? "Bank Manager" : "Bank Employee"}`
                  )}
                </Button>
              </form>

              {/* Demo Credentials - Only show for manager */}
              {activeTab === "manager" && (
                <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2 text-slate-700">Demo Credentials</h4>
                  <p className="text-xs text-slate-500 mb-3">
                    Use these credentials to access the manager application
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Email:</span>
                      <div className="flex items-center gap-1">
                        <code className="bg-white px-2 py-1 rounded text-xs text-slate-700 border">
                          {demoCredentials[activeTab].email}
                        </code>
                        <button
                          onClick={() => copyToClipboard(demoCredentials[activeTab].email, "Email")}
                          className={`p-1 transition-colors duration-200 ${
                            copiedField === "Email" 
                              ? "text-green-500" 
                              : "text-slate-400 hover:text-slate-600"
                          }`}
                        >
                          {copiedField === "Email" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Password:</span>
                      <div className="flex items-center gap-1">
                        <code className="bg-white px-2 py-1 rounded text-xs text-slate-700 border">
                          {demoCredentials[activeTab].password}
                        </code>
                        <button
                          onClick={() => copyToClipboard(demoCredentials[activeTab].password, "Password")}
                          className={`p-1 transition-colors duration-200 ${
                            copiedField === "Password" 
                              ? "text-green-500" 
                              : "text-slate-400 hover:text-slate-600"
                          }`}
                        >
                          {copiedField === "Password" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Employee Instructions */}
              {activeTab === "employee" && (
                <>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-sm mb-2 text-blue-700">Bank Employee Login</h4>
                    <p className="text-xs text-blue-600">
                      Use the username and password provided by your administrator when your bank account was created.
                    </p>
                  </div>

                  {/* Display Bank Account Credentials */}
                  {bankAccounts.length > 0 && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                      <h4 className="font-medium text-sm mb-2 text-slate-700">Available Bank Accounts</h4>
                      <p className="text-xs text-slate-500 mb-3">
                        Use these credentials to access the bank employee portal
                      </p>
                      
                      <div className="space-y-3">
                        {bankAccounts.map((account, index) => (
                          <div key={index} className="border border-slate-200 rounded-lg p-3 bg-white">
                            <div className="text-xs font-medium text-slate-600 mb-2">{account.bank_name}</div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500">Username:</span>
                                <div className="flex items-center gap-1">
                                  <code className="bg-slate-100 px-2 py-1 rounded text-xs text-slate-700 border">
                                    {account.username}
                                  </code>
                                  <button
                                    onClick={() => copyToClipboard(account.username, `Username-${index}`)}
                                    className={`p-1 transition-colors duration-200 ${
                                      copiedField === `Username-${index}` 
                                        ? "text-green-500" 
                                        : "text-slate-400 hover:text-slate-600"
                                    }`}
                                  >
                                    {copiedField === `Username-${index}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                  </button>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500">Password:</span>
                                <div className="flex items-center gap-1">
                                  <code className="bg-slate-100 px-2 py-1 rounded text-xs text-slate-700 border">
                                    {account.password}
                                  </code>
                                  <button
                                    onClick={() => copyToClipboard(account.password, `Password-${index}`)}
                                    className={`p-1 transition-colors duration-200 ${
                                      copiedField === `Password-${index}` 
                                        ? "text-green-500" 
                                        : "text-slate-400 hover:text-slate-600"
                                    }`}
                                  >
                                    {copiedField === `Password-${index}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankLogin;