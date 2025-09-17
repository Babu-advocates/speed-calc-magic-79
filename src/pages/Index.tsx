import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, Building2, Shield, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroBackground from "@/assets/hero-background.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-hero shadow-elegant">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Scale className="h-8 w-8 text-accent" />
              <h1 className="text-2xl font-bold text-primary-foreground">Babu Advocates</h1>
            </div>
            <div className="text-sm text-primary-foreground/80">
              Secure Case Management Platform
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
          style={{ backgroundImage: `url(${heroBackground})` }}
        />
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold text-foreground mb-6">
              Secure Case Management
              <span className="text-primary block mt-2">Between Advocates & Banks</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
              A professional platform designed to streamline communication and case management 
              between legal advocates and banking institutions with enterprise-grade security.
            </p>
            
            {/* Login Cards */}
            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {/* Advocate Login Card */}
              <Card className="bg-gradient-card shadow-card hover:shadow-elegant transition-all duration-300 border-primary/20">
                <CardHeader className="pb-4">
                  <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                    <Scale className="h-12 w-12 text-primary" />
                  </div>
                  <CardTitle className="text-2xl text-primary">Advocate Portal</CardTitle>
                  <CardDescription className="text-base">
                    Access your legal cases and manage client communications
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <Link to="/advocate-login">
                    <Button variant="advocate" size="lg" className="w-full">
                      Advocate Login
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Bank Login Card */}
              <Card className="bg-gradient-card shadow-card hover:shadow-elegant transition-all duration-300 border-accent/20">
                <CardHeader className="pb-4">
                  <div className="mx-auto mb-4 p-4 bg-accent/10 rounded-full w-fit">
                    <Building2 className="h-12 w-12 text-accent" />
                  </div>
                  <CardTitle className="text-2xl text-accent">Banking Portal</CardTitle>
                  <CardDescription className="text-base">
                    Manage legal documentation and case coordination
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <Link to="/bank-login">
                    <Button variant="bank" size="lg" className="w-full">
                      Bank Login
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">Why Choose Our Platform?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built specifically for the legal and banking industry with security and compliance at its core.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Enterprise Security</h4>
              <p className="text-muted-foreground">
                Bank-grade encryption and security protocols to protect sensitive legal data.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-4 p-3 bg-accent/10 rounded-full w-fit">
                <Users className="h-8 w-8 text-accent" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Seamless Collaboration</h4>
              <p className="text-muted-foreground">
                Streamlined communication between advocates and banking professionals.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                <Scale className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Compliance Ready</h4>
              <p className="text-muted-foreground">
                Built to meet legal and financial industry compliance requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-hero py-8">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Scale className="h-6 w-6 text-accent" />
            <span className="text-lg font-semibold text-primary-foreground">Babu Advocates</span>
          </div>
          <p className="text-primary-foreground/80">
            Secure Case Management Platform • Professional Legal Services
          </p>
          <p className="text-primary-foreground/60 text-sm mt-2">
            Powered by Techverse Infotech Private Limited
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;