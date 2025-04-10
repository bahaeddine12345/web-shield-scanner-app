import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, AlertTriangle, Search, BarChart, FileText } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <Shield size={64} className="text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6">
            Web Shield Scanner
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            Analysez la sécurité de votre site web en quelques clics pour détecter les vulnérabilités avant qu'elles ne deviennent des brèches.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="gap-2">
                <Search size={20} />
                Commencer un scan
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="gap-2">
                Se connecter
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Fonctionnalités principales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="security-card flex flex-col items-center text-center">
              <div className="rounded-full bg-success/10 p-4 mb-4">
                <Search size={32} className="text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Scan complet</h3>
              <p className="text-muted-foreground">
                Analysez en profondeur votre site web pour détecter les failles de sécurité OWASP Top 10 et bien plus.
              </p>
            </div>
            
            <div className="security-card flex flex-col items-center text-center">
              <div className="rounded-full bg-info/10 p-4 mb-4">
                <FileText size={32} className="text-info" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Rapports détaillés</h3>
              <p className="text-muted-foreground">
                Obtenez des rapports détaillés avec une explication des vulnérabilités et des recommandations pour les corriger.
              </p>
            </div>
            
            <div className="security-card flex flex-col items-center text-center">
              <div className="rounded-full bg-warning/10 p-4 mb-4">
                <BarChart size={32} className="text-warning" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Suivi de statistiques</h3>
              <p className="text-muted-foreground">
                Surveillez les tendances et suivez les améliorations de la sécurité de votre site au fil du temps.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="bg-primary/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Prêt à sécuriser votre site web?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Créez un compte gratuit et commencez à analyser la sécurité de votre site web dès maintenant.
          </p>
          <Link to="/register">
            <Button size="lg">
              Créer un compte gratuit
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
