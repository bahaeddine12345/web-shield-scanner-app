
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useScan, ScanResult, SeverityLevel } from '../hooks/useScan';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  File, 
  Download,
  AlertCircle,
  Info as InfoIcon,
  CheckCircle,
  Lightbulb,
  Shield
} from 'lucide-react';
import ReportViewer from '@/components/ReportViewer';

type VulnerabilityBySeverity = {
  [key in SeverityLevel]: {
    id: string;
    name: string;
    description: string;
    severity: SeverityLevel;
    remediation: string;
  }[];
};

const ScanReport = () => {
  const { scanId } = useParams<{ scanId: string }>();
  const { getScanResult, downloadScanReport } = useScan();
  const [vulnerabilitiesBySeverity, setVulnerabilitiesBySeverity] = useState<VulnerabilityBySeverity>({
    HIGH: [],
    MEDIUM: [],
    LOW: [],
    INFO: []
  });
  
  // Fetch scan results
  const { data: scanResult, isLoading, error } = useQuery({
    queryKey: ['scanResult', scanId],
    queryFn: () => getScanResult(scanId!),
    enabled: !!scanId,
  });
  
  // Organize vulnerabilities by severity
  useEffect(() => {
    if (scanResult?.vulnerabilities) {
      const grouped = scanResult.vulnerabilities.reduce<VulnerabilityBySeverity>(
        (acc, vuln) => {
          if (!acc[vuln.severity]) {
            acc[vuln.severity] = [];
          }
          acc[vuln.severity].push(vuln);
          return acc;
        },
        { HIGH: [], MEDIUM: [], LOW: [], INFO: [] }
      );
      
      setVulnerabilitiesBySeverity(grouped);
    }
  }, [scanResult]);
  
  // Get severity counts
  const severityCounts = {
    high: vulnerabilitiesBySeverity.HIGH?.length || 0,
    medium: vulnerabilitiesBySeverity.MEDIUM?.length || 0,
    low: vulnerabilitiesBySeverity.LOW?.length || 0,
    info: vulnerabilitiesBySeverity.INFO?.length || 0,
    total: 
      (vulnerabilitiesBySeverity.HIGH?.length || 0) +
      (vulnerabilitiesBySeverity.MEDIUM?.length || 0) +
      (vulnerabilitiesBySeverity.LOW?.length || 0) +
      (vulnerabilitiesBySeverity.INFO?.length || 0),
  };
  
  // Get severity score
  const getSeverityScore = () => {
    // Basic weighted score calculation
    const score = 
      (severityCounts.high * 10) + 
      (severityCounts.medium * 5) + 
      (severityCounts.low * 2);
    
    // Normalize to 0-100 scale
    // This is a very basic implementation - adjust as needed
    return Math.min(100, Math.max(0, score));
  };
  
  // Get risk level based on score
  const getRiskLevel = (score: number) => {
    if (score >= 70) return { level: 'Critical', color: 'text-danger' };
    if (score >= 40) return { level: 'High', color: 'text-warning' };
    if (score >= 10) return { level: 'Medium', color: 'text-info' };
    return { level: 'Low', color: 'text-success' };
  };
  
  const severityScore = getSeverityScore();
  const riskLevel = getRiskLevel(severityScore);
  
  // Helper to render severity badge
  const getSeverityBadge = (severity: SeverityLevel) => {
    switch (severity) {
      case 'HIGH':
        return <Badge variant="outline" className="bg-danger/10 text-danger border-danger/20">Critique</Badge>;
      case 'MEDIUM':
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">Moyenne</Badge>;
      case 'LOW':
        return <Badge variant="outline" className="bg-info/10 text-info border-info/20">Faible</Badge>;
      case 'INFO':
        return <Badge variant="outline" className="bg-secondary text-muted-foreground">Info</Badge>;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error || !scanResult) {
    return (
      <Alert variant="destructive" className="max-w-3xl mx-auto">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>
          Une erreur est survenue lors du chargement du rapport.
          <div className="mt-4">
            <Link to="/dashboard">
              <Button variant="outline">Retour au tableau de bord</Button>
            </Link>
          </div>
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <Link to="/dashboard">
            <Button variant="ghost" className="pl-0 mb-2">
              &larr; Retour au tableau de bord
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Rapport de scan</h1>
          <p className="text-muted-foreground break-all">
            Résultats de l'analyse pour {scanResult.id}
          </p>
        </div>
        
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={() => downloadScanReport(scanId!)}
        >
          <Download className="h-4 w-4" />
          Télécharger en PDF
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="space-y-1">
          <span className="text-sm font-medium text-muted-foreground">Score de risque</span>
          <div className="flex items-center space-x-2">
            <span className={`text-3xl font-bold ${riskLevel.color}`}>{severityScore}</span>
            <span className={`text-sm font-medium ${riskLevel.color}`}>/ 100 - {riskLevel.level}</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <span className="text-sm font-medium text-muted-foreground">Vulnérabilités totales</span>
          <div className="text-3xl font-bold">
            {severityCounts.total}
          </div>
        </div>
        
        <div className="space-y-1">
          <span className="text-sm font-medium text-muted-foreground">Répartition</span>
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-danger mr-1"></span>
              <span className="text-sm">{severityCounts.high}</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-warning mr-1"></span>
              <span className="text-sm">{severityCounts.medium}</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-info mr-1"></span>
              <span className="text-sm">{severityCounts.low}</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-secondary mr-1"></span>
              <span className="text-sm">{severityCounts.info}</span>
            </div>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="summary">Résumé</TabsTrigger>
          <TabsTrigger value="vulnerabilities">Vulnérabilités</TabsTrigger>
          <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
          <TabsTrigger value="raw">Rapport HTML</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Résumé du scan</CardTitle>
              <CardDescription>
                Vue d'ensemble des résultats du scan de sécurité
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Évaluation des risques</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Score de risque global</span>
                      <span className={`text-sm font-medium ${riskLevel.color}`}>{severityScore}/100</span>
                    </div>
                    
                    <div className="w-full bg-secondary/50 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          severityScore >= 70 
                            ? 'bg-danger' 
                            : severityScore >= 40 
                            ? 'bg-warning' 
                            : severityScore >= 10 
                            ? 'bg-info' 
                            : 'bg-success'
                        }`} 
                        style={{ width: `${severityScore}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="pt-4 space-y-3">
                    <h4 className="text-sm font-medium">Vulnérabilités par sévérité</h4>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <AlertCircle className="h-4 w-4 text-danger mr-2" />
                          <span className="text-sm">Critiques</span>
                        </div>
                        <span className="text-sm font-medium">{severityCounts.high}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 text-warning mr-2" />
                          <span className="text-sm">Moyenne</span>
                        </div>
                        <span className="text-sm font-medium">{severityCounts.medium}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <InfoIcon className="h-4 w-4 text-info mr-2" />
                          <span className="text-sm">Faibles</span>
                        </div>
                        <span className="text-sm font-medium">{severityCounts.low}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-muted-foreground mr-2" />
                          <span className="text-sm">Informationnelles</span>
                        </div>
                        <span className="text-sm font-medium">{severityCounts.info}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Impact métier</h3>
                  
                  <div className="space-y-3">
                    <Alert className={`${
                      severityScore >= 70 
                        ? 'bg-danger/10 text-danger border-danger/20' 
                        : severityScore >= 40 
                        ? 'bg-warning/10 text-warning border-warning/20' 
                        : severityScore >= 10 
                        ? 'bg-info/10 text-info border-info/20' 
                        : 'bg-success/10 text-success border-success/20'
                    }`}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Niveau de risque: {riskLevel.level}</AlertTitle>
                      <AlertDescription>
                        {severityScore >= 70 
                          ? "Des vulnérabilités critiques ont été détectées qui pourraient entraîner une compromission complète du système."
                          : severityScore >= 40 
                          ? "Des vulnérabilités importantes ont été détectées qui pourraient compromettre la sécurité du site."
                          : severityScore >= 10 
                          ? "Des vulnérabilités de gravité moyenne ont été détectées qui méritent d'être corrigées."
                          : "Des vulnérabilités mineures ont été détectées avec un impact limité sur la sécurité globale."
                        }
                      </AlertDescription>
                    </Alert>
                    
                    <div className="pt-2">
                      <h4 className="text-sm font-medium mb-2">Actions recommandées:</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                        {severityCounts.high > 0 && (
                          <li>Corriger immédiatement les {severityCounts.high} vulnérabilités critiques</li>
                        )}
                        {severityCounts.medium > 0 && (
                          <li>Planifier la résolution des {severityCounts.medium} vulnérabilités de gravité moyenne</li>
                        )}
                        {severityCounts.low > 0 && (
                          <li>Examiner les {severityCounts.low} vulnérabilités de faible gravité</li>
                        )}
                        <li>Consulter les recommandations détaillées pour chaque vulnérabilité</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="vulnerabilities">
          <Card>
            <CardHeader>
              <CardTitle>Vulnérabilités détectées</CardTitle>
              <CardDescription>
                Liste détaillée de toutes les vulnérabilités détectées
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Critical vulnerabilities */}
              {vulnerabilitiesBySeverity.HIGH.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-danger" />
                    <h3 className="font-medium">Vulnérabilités critiques</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {vulnerabilitiesBySeverity.HIGH.map(vuln => (
                      <Card key={vuln.id} className="border-danger/20">
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{vuln.name}</h4>
                            {getSeverityBadge(vuln.severity)}
                          </div>
                          <p className="text-sm text-muted-foreground">{vuln.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Medium vulnerabilities */}
              {vulnerabilitiesBySeverity.MEDIUM.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    <h3 className="font-medium">Vulnérabilités moyennes</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {vulnerabilitiesBySeverity.MEDIUM.map(vuln => (
                      <Card key={vuln.id} className="border-warning/20">
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{vuln.name}</h4>
                            {getSeverityBadge(vuln.severity)}
                          </div>
                          <p className="text-sm text-muted-foreground">{vuln.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Low vulnerabilities */}
              {vulnerabilitiesBySeverity.LOW.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <InfoIcon className="h-5 w-5 text-info" />
                    <h3 className="font-medium">Vulnérabilités faibles</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {vulnerabilitiesBySeverity.LOW.map(vuln => (
                      <Card key={vuln.id} className="border-info/20">
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{vuln.name}</h4>
                            {getSeverityBadge(vuln.severity)}
                          </div>
                          <p className="text-sm text-muted-foreground">{vuln.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Informational findings */}
              {vulnerabilitiesBySeverity.INFO.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-medium">Informations</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {vulnerabilitiesBySeverity.INFO.map(vuln => (
                      <Card key={vuln.id}>
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{vuln.name}</h4>
                            {getSeverityBadge(vuln.severity)}
                          </div>
                          <p className="text-sm text-muted-foreground">{vuln.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {/* No vulnerabilities found */}
              {severityCounts.total === 0 && (
                <div className="text-center py-12">
                  <div className="mb-4">
                    <Shield className="mx-auto h-12 w-12 text-success" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Aucune vulnérabilité détectée</h3>
                  <p className="text-muted-foreground">
                    Félicitations! Votre site ne présente aucune vulnérabilité connue.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>Recommandations</CardTitle>
              <CardDescription>
                Suggestions pour améliorer la sécurité de votre site
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Critical recommendations */}
              {vulnerabilitiesBySeverity.HIGH.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-danger" />
                    <h3 className="font-medium">Actions critiques</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {vulnerabilitiesBySeverity.HIGH.map(vuln => (
                      <Card key={vuln.id} className="border-danger/20">
                        <CardContent className="p-4 space-y-2">
                          <h4 className="font-medium">{vuln.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Lightbulb className="h-4 w-4 text-warning" />
                            <p className="text-sm font-medium">Recommandation</p>
                          </div>
                          <p className="text-sm text-muted-foreground pb-1">{vuln.remediation}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Medium recommendations */}
              {vulnerabilitiesBySeverity.MEDIUM.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    <h3 className="font-medium">Recommandations importantes</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {vulnerabilitiesBySeverity.MEDIUM.map(vuln => (
                      <Card key={vuln.id} className="border-warning/20">
                        <CardContent className="p-4 space-y-2">
                          <h4 className="font-medium">{vuln.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Lightbulb className="h-4 w-4 text-warning" />
                            <p className="text-sm font-medium">Recommandation</p>
                          </div>
                          <p className="text-sm text-muted-foreground pb-1">{vuln.remediation}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Low and info recommendations */}
              {(vulnerabilitiesBySeverity.LOW.length > 0 || vulnerabilitiesBySeverity.INFO.length > 0) && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <InfoIcon className="h-5 w-5 text-info" />
                    <h3 className="font-medium">Recommandations générales</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {[...vulnerabilitiesBySeverity.LOW, ...vulnerabilitiesBySeverity.INFO].map(vuln => (
                      <Card key={vuln.id} className={vuln.severity === 'LOW' ? 'border-info/20' : ''}>
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{vuln.name}</h4>
                            {getSeverityBadge(vuln.severity)}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Lightbulb className="h-4 w-4 text-warning" />
                            <p className="text-sm font-medium">Recommandation</p>
                          </div>
                          <p className="text-sm text-muted-foreground pb-1">{vuln.remediation}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {/* No vulnerabilities found */}
              {severityCounts.total === 0 && (
                <div className="text-center py-12">
                  <div className="mb-4">
                    <Shield className="mx-auto h-12 w-12 text-success" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Aucune vulnérabilité détectée</h3>
                  <p className="text-muted-foreground">
                    Votre site est déjà bien sécurisé. Continuez votre bon travail!
                  </p>
                </div>
              )}
              
              {/* General recommendations */}
              <Card className="bg-primary/5 border-primary/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Bonnes pratiques générales</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2 items-start">
                      <CheckCircle className="h-4 w-4 text-primary mt-1" />
                      <span>Maintenir tous les logiciels et bibliothèques à jour</span>
                    </li>
                    <li className="flex gap-2 items-start">
                      <CheckCircle className="h-4 w-4 text-primary mt-1" />
                      <span>Utiliser HTTPS pour toutes les communications</span>
                    </li>
                    <li className="flex gap-2 items-start">
                      <CheckCircle className="h-4 w-4 text-primary mt-1" />
                      <span>Implémenter une politique de mots de passe forts</span>
                    </li>
                    <li className="flex gap-2 items-start">
                      <CheckCircle className="h-4 w-4 text-primary mt-1" />
                      <span>Activer l'authentification à deux facteurs</span>
                    </li>
                    <li className="flex gap-2 items-start">
                      <CheckCircle className="h-4 w-4 text-primary mt-1" />
                      <span>Effectuer des sauvegardes régulières</span>
                    </li>
                    <li className="flex gap-2 items-start">
                      <CheckCircle className="h-4 w-4 text-primary mt-1" />
                      <span>Établir un plan de réponse aux incidents</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="raw">
          <Card>
            <CardHeader>
              <CardTitle>Rapport HTML brut</CardTitle>
              <CardDescription>
                Version HTML du rapport généré
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="border rounded-md p-4 bg-muted/30">
                {scanResult.reportHtml ? (
                  <ReportViewer html={scanResult.reportHtml} />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <File className="mx-auto h-12 w-12 mb-4" />
                    <p>Aucun rapport HTML disponible</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScanReport;
