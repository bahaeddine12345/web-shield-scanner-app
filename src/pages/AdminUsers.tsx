
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AlertTriangle, Search, Trash2, Eye } from 'lucide-react';

// Type definitions
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  scanCount: number;
}

const API_URL = 'http://localhost:4200/api';

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const queryClient = useQueryClient();
  
  // Fetch users
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['adminAllUsers'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/admin/users`);
      return response.data as User[];
    },
  });
  
  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await axios.delete(`${API_URL}/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAllUsers'] });
      toast.success('Utilisateur supprimé avec succès');
      setUserToDelete(null);
    },
    onError: (error) => {
      console.error('Error deleting user:', error);
      toast.error('Erreur lors de la suppression de l\'utilisateur');
    },
  });
  
  // Filter users based on search term
  const filteredUsers = users?.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Confirm delete handler
  const handleConfirmDelete = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.id);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des utilisateurs</h1>
          <p className="text-muted-foreground">
            Administrez les comptes utilisateurs et leurs permissions
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
          <CardDescription>
            {users?.length ?? 0} utilisateurs enregistrés sur la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher par nom, email ou rôle..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="rounded-md bg-destructive/10 p-4 text-destructive">
              <AlertTriangle className="h-4 w-4 inline mr-2" />
              Une erreur est survenue lors du chargement des utilisateurs
            </div>
          ) : filteredUsers && filteredUsers.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-3 font-medium">Nom</th>
                    <th className="text-left p-3 font-medium hidden md:table-cell">Email</th>
                    <th className="text-left p-3 font-medium">Rôle</th>
                    <th className="text-left p-3 font-medium hidden lg:table-cell">Scans</th>
                    <th className="text-right p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-t hover:bg-muted/30">
                      <td className="p-3">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground md:hidden">{user.email}</div>
                      </td>
                      <td className="p-3 text-muted-foreground hidden md:table-cell">{user.email}</td>
                      <td className="p-3">
                        <Badge variant={user.role === 'ADMIN' ? 'default' : 'outline'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="p-3 hidden lg:table-cell">{user.scanCount}</td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          <Link to={`/admin/users/${user.id}/scans`}>
                            <Button variant="ghost" size="icon" title="Voir les scans">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            title="Supprimer l'utilisateur"
                            onClick={() => setUserToDelete(user)}
                            disabled={user.role === 'ADMIN'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{userToDelete?.name}</strong> ({userToDelete?.email}) ?
              <br /><br />
              Cette action est irréversible. Toutes les données associées à cet utilisateur seront également supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteUserMutation.isPending ? (
                <>
                  <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-destructive-foreground rounded-full"></span>
                  Suppression...
                </>
              ) : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;
