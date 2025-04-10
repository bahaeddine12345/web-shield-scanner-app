
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useScan, Scan, ScanStatus } from '../hooks/useScan';
import { useWebSocket } from '../hooks/useWebSocket';
import { FileText, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

const ScanProgress = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getScan } = useScan();
  const [scanData, setScanData] = useState<Scan | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // Fetch initial scan data
  const { data: initialScan, isLoading, error } = useQuery({
    queryKey: ['scan', id],
    queryFn: () => getScan(id!),
    enabled: !!id,
  });
  
  // Set up WebSocket connection for real-time updates
  const { isConnected } = useWebSocket({
    url: `ws://localhost:4200/ws/scan/${id}`,
    onMessage: (data) => {
      if (data.scanId === id) {
        // Update local state with WebSocket data
        setScanData(prevData => ({
          ...prevData,
          ...data,
        }));
        
        // Update step based on progress
        if (data.progress < 25) setCurrentStep(1);
        else if (data.progress < 50) setCurrentStep(2);
        else if (data.progress < 75) setCurrentStep(3);
        else if (data.progress < 100) setCurrentStep(4);
        
        // Redirect to report when completed
        if (data.status === 'COMPLETED') {
          setTimeout(() => {
            navigate(`/report/${id}`);
          }, 2000); // Short delay to show completion
        }
      }
    },
  });
  
  // Initialize scan data from query result
  useEffect(() => {
    if (initialScan) {
      setScanData(initialScan);
      
      // Set current step based on progress
      const progress = initialScan.progress || 0;
      if (progress < 25) setCurrentStep(1);
      else if (progress < 50) setCurrentStep(2);
      else if (progress < 75) setCurrentStep(3);
      else if (progress < 100) setCurrentStep(4);
      
      // Redirect to report if already completed
      if (initialScan.status === 'COMPLETED') {
        navigate(`/report/${id}`);
      }
    }
  }, [initialScan, id, navigate]);
  
  // Generate message based on current step
  const getStepMessage = () => {
    switch (currentStep) {
      case 1:
        return "Crawling du site web et découverte des pages...";
      case 2:
        return "Analyse des en-têtes de sécurité et de la configuration...";
      case 3:
        return "Détection des vulnérabilités et des failles de sécurité...";
      case 4:
        return "Génération du rapport et des recommandations...";
      default:
        return "Analyse en cours...";
    }
  };
  
  // Get status badge style and text
  const getStatusBadge = (status: ScanStatus) => {
    switch (status) {
      case 'COMPLETED':
        return {
          className: 'bg-success/10 text-success border-success/20',
          text: 'Terminé'
        };
      case 'FAILED':
        return {
          className: 'bg-danger/10 text-danger border-danger/20',
          text: 'Échoué'
        };
      case 'IN_PROGRESS':
        return {
          className: 'bg-warning/10 text-warning border-warning/20',
          text: 'En cours'
        };
      default:
        return {
          className: 'bg-secondary/50 text-muted-foreground',
          text: 'En attente'
        };
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error || !scanData) {
    return (
      <Alert variant="destructive" className="max-w-3xl mx-auto">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>
          Une erreur est survenue lors du chargement des informations du scan.
          <div className="mt-4">
            <Link to="/dashboard">
              <Button variant="outline">Retour au tableau de bord</Button>
            </Link>
          </div>
        </AlertDescription>
      </Alert>
    );
  }
  
  const statusBadge = getStatusBadge(scanData.status);
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link to="/dashboard">
          <Button variant="ghost" className="pl-0 mb-2">
            &larr; Retour au tableau de bord
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Suivi du scan</h1>
        <p className="text-muted-foreground">
          Suivi de l'analyse de sécurité pour {scanData.url}
        </p>
      </div>
      
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-2">
            <CardTitle>Progression du scan</CardTitle>
            <Badge variant="outline" className={statusBadge.className}>
              {statusBadge.text}
            </Badge>
          </div>
          
          <div className="text-sm text-muted-foreground break-all">
            URL: {scanData.url}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!isConnected && scanData.status === 'IN_PROGRESS' && (
            <Alert className="bg-warning/10 text-warning border-warning/20">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Connexion au serveur en temps réel perdue. Les mises à jour pourraient être retardées.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{getStepMessage()}</span>
              <span className="font-medium">{scanData.progress || 0}%</span>
            </div>
            <Progress value={scanData.progress || 0} />
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
            <div className={`p-3 rounded-md border flex flex-col items-center justify-center text-center ${currentStep >= 1 ? 'bg-primary/10 border-primary/20' : 'bg-muted/30 text-muted-foreground'}`}>
              <div className="mb-2 h-8 w-8 rounded-full flex items-center justify-center bg-background">
                <span className="text-sm font-medium">1</span>
              </div>
              <span className="text-xs">Crawling</span>
            </div>
            
            <div className={`p-3 rounded-md border flex flex-col items-center justify-center text-center ${currentStep >= 2 ? 'bg-primary/10 border-primary/20' : 'bg-muted/30 text-muted-foreground'}`}>
              <div className="mb-2 h-8 w-8 rounded-full flex items-center justify-center bg-background">
                <span className="text-sm font-medium">2</span>
              </div>
              <span className="text-xs">Configuration</span>
            </div>
            
            <div className={`p-3 rounded-md border flex flex-col items-center justify-center text-center ${currentStep >= 3 ? 'bg-primary/10 border-primary/20' : 'bg-muted/30 text-muted-foreground'}`}>
              <div className="mb-2 h-8 w-8 rounded-full flex items-center justify-center bg-background">
                <span className="text-sm font-medium">3</span>
              </div>
              <span className="text-xs">Détection</span>
            </div>
            
            <div className={`p-3 rounded-md border flex flex-col items-center justify-center text-center ${currentStep >= 4 ? 'bg-primary/10 border-primary/20' : 'bg-muted/30 text-muted-foreground'}`}>
              <div className="mb-2 h-8 w-8 rounded-full flex items-center justify-center bg-background">
                <span className="text-sm font-medium">4</span>
              </div>
              <span className="text-xs">Rapport</span>
            </div>
          </div>
          
          {scanData.status === 'COMPLETED' && (
            <div className="flex justify-center mt-6">
              <div className="flex items-center text-success gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>Scan terminé avec succès!</span>
              </div>
            </div>
          )}
          
          {scanData.status === 'FAILED' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Échec du scan</AlertTitle>
              <AlertDescription>
                Le scan a échoué. Veuillez réessayer ou contacter le support si le problème persiste.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        
        {scanData.status === 'COMPLETED' && (
          <CardFooter className="border-t pt-6">
            <Link to={`/report/${scanData.id}`} className="w-full">
              <Button className="w-full gap-2">
                <FileText className="h-4 w-4" />
                Voir le rapport complet
              </Button>
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default ScanProgress;
