import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scale, Mail, Lock, ArrowLeft, Shield, Users, Eye, EyeOff, Copy, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import lawyerIllustration from "@/assets/lawyer-illustration.png";

const AdvocateLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check demo credentials
    if (email === demoCredentials.admin.email && password === demoCredentials.admin.password) {
      localStorage.setItem('isAdminLoggedIn', 'true');
      toast.success('Welcome to your admin dashboard!');
      navigate('/admin-dashboard');
    } else {
      toast.error('Invalid email or password. Please use the demo credentials.');
    }
  };

  const demoCredentials = {
    admin: { email: "admin@babuadvocates.com", password: "admin123" }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-legal-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-justice rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-prestige rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-law-firm rounded-full blur-3xl"></div>
      </div>
      {/* Back to Home - Top Left */}
      <Link to="/" className="absolute top-4 left-4 inline-flex items-center text-slate-600 hover:text-slate-800 transition-colors z-10">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Link>
      
      <div className="w-full max-w-2xl relative z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-elegant overflow-hidden border border-white/20">
          {/* Tab Headers */}
          <div className="flex">
            <div className="flex-1 px-6 py-4 text-center text-white bg-admin-blue font-medium rounded-tl-3xl">
              Admin Login
            </div>
            <Link
              to="/employee-login"
              className="flex-1 px-6 py-4 text-center text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors font-medium rounded-tr-3xl"
            >
              Employee Login
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-0">
            {/* Left Side - Illustration */}
            <div className="bg-gradient-law-firm p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
              {/* Decorative accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-justice-gold/20 rounded-full blur-xl"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-prestige-amber/20 rounded-full blur-lg"></div>
              <div className="mb-4 relative">
                <div className="w-28 h-28 bg-white rounded-xl shadow-md flex items-center justify-center mb-3 relative overflow-hidden">
                  <img 
                    src={lawyerIllustration} 
                    alt="Lawyer illustration" 
                    className="w-20 h-20 object-contain"
                  />
                  <div className="absolute top-1 right-1 w-6 h-6 bg-admin-blue rounded-full flex items-center justify-center">
                    <Scale className="w-3 h-3 text-white" />
                  </div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 bg-yellow-400 rounded-full"></div>
                </div>
              </div>
              <h2 className="text-lg font-bold text-white mb-1 relative z-10">Welcome Advocate!</h2>
              <p className="text-xs text-white/80 relative z-10">
                Manage your legal cases with ease
              </p>
            </div>

            {/* Right Side - Login Form */}
            <div className="p-6">
              <div className="text-center mb-4">
                <p className="text-xs text-slate-500 mb-2">
                  Use the demo credentials below to sign in
                </p>
                <h3 className="text-xl font-bold text-admin-blue mb-1">Welcome Back</h3>
                <p className="text-sm text-slate-600">
                  Sign in to your Legal account as Admin
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-10 rounded-lg border-slate-200 focus:border-admin-blue focus:ring-admin-blue"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-10 rounded-lg border-slate-200 focus:border-admin-blue focus:ring-admin-blue"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-10 text-sm font-medium bg-admin-blue hover:bg-admin-blue-hover text-white rounded-lg mt-4"
                >
                  Sign In as Admin
                </Button>
              </form>

              {/* Demo Credentials */}
              <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-sm mb-2 text-slate-700">Demo Credentials</h4>
                <p className="text-xs text-slate-500 mb-3">
                  Use these credentials to access the application with profile-based authentication
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Email:</span>
                    <div className="flex items-center gap-1">
                      <code className="bg-white px-2 py-1 rounded text-xs text-slate-700 border">
                        {demoCredentials.admin.email}
                      </code>
                      <button
                        onClick={() => copyToClipboard(demoCredentials.admin.email, "Email")}
                        className={`p-1 transition-colors duration-200 ${
                          copiedField === "Email" 
                            ? "text-green-500 hover:text-green-600" 
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
                        {demoCredentials.admin.password}
                      </code>
                      <button
                        onClick={() => copyToClipboard(demoCredentials.admin.password, "Password")}
                        className={`p-1 transition-colors duration-200 ${
                          copiedField === "Password" 
                            ? "text-green-500 hover:text-green-600" 
                            : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        {copiedField === "Password" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvocateLogin;