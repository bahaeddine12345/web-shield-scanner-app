
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';

// Define types for our auth context
type User = {
  id: string;
  nom: string;
  email: string;
  role: 'ADMIN' | 'USER';
  // Instead of using a getter, we'll use a regular property
  name: string; // This will be set to match nom
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  isAdmin: false,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// API base URL
const API_URL = 'http://localhost:8081/api';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Set default auth header for all requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Fetch user data
        const { data } = await axios.get(`${API_URL}/auth/me`);
        setUser({
          id: data.id,
          nom: data.nom,
          email: data.email,
          role: data.role,
          name: data.nom // Set name to match nom
        });
      } catch (error) {
        console.error('Authentication check failed:', error);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Login function
  const login = async (email: string, password: string) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, {
        email,
        motDePasse: password,
      });
      
      // Save token to localStorage
      localStorage.setItem('token', data.token);
      
      // Set default auth header for subsequent requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      // Set user data from response
      const userData = data.utilisateur;
      setUser({
        id: userData.id,
        nom: userData.nom,
        email: userData.email,
        role: userData.role,
        name: userData.nom // Set name to match nom
      });
      
      toast.success('Connexion réussie');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error(error.response?.data?.message || 'Identifiants incorrects');
      throw error;
    }
  };
  
  // Registration function
  const register = async (name: string, email: string, password: string) => {
    try {
      await axios.post(`${API_URL}/auth/register`, {
        nom: name,
        email,
        motDePasse: password,
      });
      
      toast.success('Inscription réussie, veuillez vous connecter');
      navigate('/login');
    } catch (error: any) {
      console.error('Registration failed:', error);
      
      if (error.response?.status === 400) {
        toast.error('Email déjà utilisé');
      } else {
        toast.error('Erreur lors de l\'inscription');
      }
      
      throw error;
    }
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    toast.info('Vous êtes déconnecté');
    navigate('/login');
  };
  
  // Check if user is admin
  const isAdmin = user?.role === 'ADMIN';
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
