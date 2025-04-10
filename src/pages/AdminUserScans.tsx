
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Scan } from '@/hooks/useScan';
import { AlertTriangle, User, ArrowLeft } from 'lucide-react';
import ScanCard from '@/components/ScanCard';

// Type definitions
interface UserDetails {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const API_URL = 'http://localhost:4200/api';

const AdminUserScans = () => {
  const { userId } = useParams<{ userId: string }>();
  
  // Fetch user details
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['adminUser', userId],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/admin/users/${userId}`);
      return response.data as UserDetails;
    },
    enabled: !!userId,
  });
  
  // Fetch user scans
  const { data: scans, isLoading: scansLoading, error } = useQuery({
    queryKey: ['adminUserScans', userId],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/admin/users/${userId}/scans`);
      return response.data as Scan[];
    },
    enabled: !!userId,
  });
  
  const isLoading = userLoading || scansLoading;
  
  return (
    <div className="space-y-6">
      <div>
        <Link to="/admin/users">
          <Button variant="ghost" className="pl-0 mb-2 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour à la liste des utilisateurs
          </Button>
        </Link>
        
        <h1 className="text-3xl font-bold tracking-tight">Scans de l'utilisateur</h1>
        {!userLoading && user && (
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={user.role === 'ADMIN' ? 'default' : 'outline'}>
              {user.role}
            </Badge>
            <span className="text-muted-foreground">{user.name} - {user.email}</span>
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Erreur
            </CardTitle>
            <CardDescription>
              Une erreur est survenue lors du chargement des scans de l'utilisateur.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          {/* User Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations de l'utilisateur
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              <div>
                <div className="text-sm text-muted-foreground">Nom</div>
                <div className="font-medium">{user?.name}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="font-medium">{user?.email}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Rôle</div>
                <div className="font-medium">
                  <Badge variant={user?.role === 'ADMIN' ? 'default' : 'outline'}>
                    {user?.role}
                  </Badge>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Inscrit le</div>
                <div className="font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Scans */}
          <Card>
            <CardHeader>
              <CardTitle>Scans effectués</CardTitle>
              <CardDescription>
                {scans?.length || 0} scans trouvés pour cet utilisateur
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scans && scans.length > 0 ? (
                <div className="space-y-4">
                  {scans.map(scan => (
                    <ScanCard key={scan.id} scan={scan} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Cet utilisateur n'a effectué aucun scan.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminUserScans;
