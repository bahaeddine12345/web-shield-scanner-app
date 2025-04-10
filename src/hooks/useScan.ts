
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:8081/api';

export type SeverityLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type ScanStatus = 'EN_ATTENTE' | 'EN_COURS' | 'TERMINE' | 'ECHEC';

export interface Scan {
  id: string;
  url: string;
  statutAnalyse: ScanStatus;
  progress?: number;
  dateSoumission: string;
  utilisateur?: {
    id: string;
    nom: string;
    email: string;
  };
  severityScore?: number;
  vulnerabilitiesCount?: {
    high: number;
    medium: number;
    low: number;
    info: number;
  };
}

export interface Vulnerability {
  id: string;
  type: string;
  description: string;
  niveauGravite: string;
  categorie: string;
}

export interface ScanResult {
  id: string;
  targetUrl: string;
  reportHtml?: string;
  vulnerabilities: Vulnerability[];
  scanDate: string;
  severity?: string;
  progress: number;
}

export const useScan = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Start a new scan
  const startScan = async (url: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/sites/analyser`, { url });
      
      toast.success('Scan démarré');
      return response.data.scanResultId;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du lancement du scan';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get scan by ID
  const getScan = async (id: string): Promise<Scan | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_URL}/scan/${id}`);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la récupération du scan';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get all scans for current user
  const getUserScans = async (): Promise<Scan[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_URL}/scan/user/scans`);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la récupération des scans';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get scan result (report)
  const getScanResult = async (scanId: string): Promise<ScanResult | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First try to get the HTML report
      const htmlResponse = await axios.get(`${API_URL}/scan/rapports/generer-html/${scanId}`, {
        responseType: 'text'
      });
      
      // Then get the vulnerabilities data
      const dataResponse = await axios.get(`${API_URL}/rapports/${scanId}`);
      
      return {
        id: dataResponse.data.id || scanId,
        scanId: scanId,
        targetUrl: dataResponse.data.scanResult?.targetUrl || "",
        reportHtml: htmlResponse.data,
        vulnerabilities: dataResponse.data.vulnerabilities || [],
        scanDate: dataResponse.data.dateGeneration || new Date().toISOString(),
        severity: dataResponse.data.niveauGravite || "",
        progress: 100
      };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la récupération du rapport';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Download scan report as PDF
  const downloadScanReport = async (scanId: string) => {
    try {
      const response = await axios.get(`${API_URL}/scan/rapports/generer/${scanId}`, {
        responseType: 'blob',
      });
      
      // Create a blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rapport-scan-${scanId}.pdf`);
      
      // Append to html page
      document.body.appendChild(link);
      
      // Start download
      link.click();
      
      // Clean up and remove the link
      link.parentNode?.removeChild(link);
      toast.success('Téléchargement du rapport PDF démarré');
    } catch (err) {
      toast.error('Erreur lors du téléchargement du rapport');
    }
  };
  
  // Get scan statistics
  const getScanStats = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_URL}/scan/stats`);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la récupération des statistiques';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get scan progress
  const getScanProgress = async (scanId: string): Promise<number> => {
    try {
      const response = await axios.get(`${API_URL}/scan/progress/${scanId}`);
      return response.data;
    } catch (err) {
      console.error('Erreur lors de la récupération de la progression', err);
      return 0;
    }
  };
  
  return {
    isLoading,
    error,
    startScan,
    getScan,
    getUserScans,
    getScanResult,
    downloadScanReport,
    getScanStats,
    getScanProgress,
  };
};
