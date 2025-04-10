
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Scan, 
  AlertTriangle, 
  BarChart, 
  Search,
  Settings
} from 'lucide-react';

// Type definitions
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  scanCount: number;
}

interface AdminStats {
  totalUsers: number;
  totalScans: number;
  totalVulnerabilities: number;
  activeScans: number;
}

const API_URL = 'http://localhost:4200/api';

const AdminDashboard = () => {
  // Fetch admin stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/admin/stats`);
      return response.data as AdminStats;
    },
  });
  
  // Fetch recent users
  const { data: users, isLoading: usersLoading, error } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/admin/users`);
      return response.data.slice(0, 5) as User[]; // Take only 5 most recent users
    },
  });
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>
          Une erreur est survenue lors du chargement des données d'administration.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord administrateur</h1>
          <p className="text-muted-foreground">
            Gérez les utilisateurs et visualisez les performances globales.
          </p>
        </div>
        
        <div className="flex gap-2">
          <Link to="/scan/new">
            <Button variant="outline" className="gap-2">
              <Search className="h-4 w-4" />
              Nouveau scan
            </Button>
          </Link>
          <Link to="/admin/settings">
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Paramètres
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.totalUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              Utilisateurs enregistrés
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Scans</CardTitle>
            <Scan className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.totalScans}
            </div>
            <p className="text-xs text-muted-foreground">
              Analyses effectuées
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vulnérabilités</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.totalVulnerabilities}
            </div>
            <p className="text-xs text-muted-foreground">
              Vulnérabilités détectées
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Scans actifs</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.activeScans}
            </div>
            <p className="text-xs text-muted-foreground">
              Scans en cours
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Users */}
      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs récents</CardTitle>
          <CardDescription>
            Les 5 derniers utilisateurs enregistrés sur la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : users && users.length > 0 ? (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-2 font-medium">Nom</th>
                    <th className="text-left p-2 font-medium">Email</th>
                    <th className="text-left p-2 font-medium">Rôle</th>
                    <th className="text-left p-2 font-medium">Scans</th>
                    <th className="text-left p-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t">
                      <td className="p-2">{user.name}</td>
                      <td className="p-2 text-muted-foreground">{user.email}</td>
                      <td className="p-2">
                        <Badge variant={user.role === 'ADMIN' ? 'default' : 'outline'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="p-2">{user.scanCount}</td>
                      <td className="p-2">
                        <Link to={`/admin/users/${user.id}/scans`}>
                          <Button variant="ghost" size="sm">
                            Voir scans
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              Aucun utilisateur trouvé
            </p>
          )}
          
          <div className="mt-4 flex justify-end">
            <Link to="/admin/users">
              <Button variant="outline">Voir tous les utilisateurs</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      
      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle>Gestion des utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Gérez les comptes utilisateurs, modifiez les rôles et les permissions.
            </p>
            <Link to="/admin/users">
              <Button>Gérer les utilisateurs</Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle>Statistiques détaillées</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Visualisez les statistiques complètes et les tendances des analyses.
            </p>
            <Link to="/stats">
              <Button>Voir les statistiques</Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle>Démarrer un scan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Lancez une nouvelle analyse de sécurité sur un site web.
            </p>
            <Link to="/scan/new">
              <Button>Nouveau scan</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
