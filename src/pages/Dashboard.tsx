
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useScan, Scan } from '../hooks/useScan';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, AlertTriangle, Info, Shield, FileText } from 'lucide-react';
import ScanCard from '@/components/ScanCard';
import { format } from 'date-fns';

const Dashboard = () => {
  const { getUserScans } = useScan();
  
  const { data: scans, isLoading, error, refetch } = useQuery({
    queryKey: ['scans'],
    queryFn: getUserScans,
  });
  
  // Organize scans by status
  const pendingScans = scans?.filter(scan => scan.status === 'PENDING' || scan.status === 'IN_PROGRESS') || [];
  const completedScans = scans?.filter(scan => scan.status === 'COMPLETED') || [];
  const failedScans = scans?.filter(scan => scan.status === 'FAILED') || [];
  
  // Get latest scan for summary card
  const latestScan = scans?.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Consultez vos scans récents et lancez de nouvelles analyses.
          </p>
        </div>
        <Link to="/scan/new">
          <Button className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Nouveau scan
          </Button>
        </Link>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            Une erreur est survenue lors du chargement des scans.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Scans totaux
                </CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{scans?.length || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Scans en cours
                </CardTitle>
                <Search className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingScans.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Vulnérabilités détectées
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {completedScans.reduce((total, scan) => {
                    const vulnCount = scan.vulnerabilitiesCount || { high: 0, medium: 0, low: 0, info: 0 };
                    return total + vulnCount.high + vulnCount.medium + vulnCount.low + vulnCount.info;
                  }, 0)}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Latest Scan Summary */}
          {latestScan && (
            <Card>
              <CardHeader>
                <CardTitle>Dernier scan</CardTitle>
                <CardDescription>
                  {format(new Date(latestScan.createdAt), "dd/MM/yyyy à HH:mm")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  <div className="flex-1">
                    <p className="font-medium text-lg mb-2 break-all">{latestScan.url}</p>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="outline"
                        className={
                          latestScan.status === 'COMPLETED'
                            ? 'bg-success/10 text-success border-success/20'
                            : latestScan.status === 'FAILED'
                            ? 'bg-danger/10 text-danger border-danger/20'
                            : 'bg-warning/10 text-warning border-warning/20'
                        }
                      >
                        {latestScan.status === 'COMPLETED'
                          ? 'Terminé'
                          : latestScan.status === 'FAILED'
                          ? 'Échoué'
                          : latestScan.status === 'IN_PROGRESS'
                          ? 'En cours'
                          : 'En attente'}
                      </Badge>
                      
                      {latestScan.status === 'IN_PROGRESS' && (
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary" 
                              style={{ width: `${latestScan.progress || 0}%` }}
                            />
                          </div>
                          <span>{latestScan.progress || 0}%</span>
                        </div>
                      )}
                    </div>
                    
                    {latestScan.status === 'COMPLETED' && latestScan.vulnerabilitiesCount && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Vulnérabilités détectées:</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="bg-danger/10 text-danger border-danger/20">
                            {latestScan.vulnerabilitiesCount.high || 0} critique
                          </Badge>
                          <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
                            {latestScan.vulnerabilitiesCount.medium || 0} moyenne
                          </Badge>
                          <Badge variant="secondary" className="bg-info/10 text-info border-info/20">
                            {latestScan.vulnerabilitiesCount.low || 0} faible
                          </Badge>
                          <Badge variant="secondary" className="bg-secondary text-muted-foreground">
                            {latestScan.vulnerabilitiesCount.info || 0} info
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {latestScan.status === 'COMPLETED' && (
                    <div className="self-end mt-4 md:mt-0">
                      <Link to={`/report/${latestScan.id}`}>
                        <Button variant="outline" className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Voir le rapport
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Tabs of scans by status */}
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">Tous ({scans?.length || 0})</TabsTrigger>
              <TabsTrigger value="pending">En cours ({pendingScans.length})</TabsTrigger>
              <TabsTrigger value="completed">Terminés ({completedScans.length})</TabsTrigger>
              <TabsTrigger value="failed">Échoués ({failedScans.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {scans?.length ? (
                scans.map(scan => (
                  <ScanCard key={scan.id} scan={scan} />
                ))
              ) : (
                <div className="text-center py-10">
                  <div className="flex justify-center mb-4">
                    <Info className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">Aucun scan trouvé</h3>
                  <p className="text-muted-foreground mt-2 mb-4">
                    Vous n'avez pas encore effectué de scan.
                  </p>
                  <Link to="/scan/new">
                    <Button>Lancer un scan</Button>
                  </Link>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="pending" className="space-y-4">
              {pendingScans.length ? (
                pendingScans.map(scan => (
                  <ScanCard key={scan.id} scan={scan} />
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">Aucun scan en cours</p>
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-4">
              {completedScans.length ? (
                completedScans.map(scan => (
                  <ScanCard key={scan.id} scan={scan} />
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">Aucun scan terminé</p>
              )}
            </TabsContent>
            
            <TabsContent value="failed" className="space-y-4">
              {failedScans.length ? (
                failedScans.map(scan => (
                  <ScanCard key={scan.id} scan={scan} />
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">Aucun scan échoué</p>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default Dashboard;
