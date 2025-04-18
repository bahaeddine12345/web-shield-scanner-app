
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
  // Using regular properties instead of getters for compatibility
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

export interface Vulnerability {
  id: string;
  type: string;
  description: string;
  niveauGravite: string;
  categorie: string;
  // Regular property for compatibility
  severity: string;
}

export interface ScanResult {
  id: string;
  targetUrl: string;
  reportHtml?: string;
  vulnerabilities: Vulnerability[];
  scanDate: string;
  progress: number;
  severity?: string;
}

export const useScan = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Map statut to status for compatibility
  const mapStatus = (statutAnalyse: ScanStatus): 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' => {
    switch(statutAnalyse) {
      case 'EN_ATTENTE': return 'PENDING';
      case 'EN_COURS': return 'IN_PROGRESS';
      case 'TERMINE': return 'COMPLETED';
      case 'ECHEC': return 'FAILED';
      default: return 'PENDING';
    }
  };
  
  // Start a new scan
  const startScan = async (url: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Correction de l'endpoint API ici: utilisation de /sites/analyser au lieu de api/sites/analyser
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
      const scanData = response.data;
      
      // Add compatibility fields
      return {
        ...scanData,
        status: mapStatus(scanData.statutAnalyse),
        createdAt: scanData.dateSoumission
      };
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
      // Add compatibility fields to each scan
      return response.data.map((scan: any) => ({
        ...scan,
        status: mapStatus(scan.statutAnalyse),
        createdAt: scan.dateSoumission
      }));
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
      
      // Add severity to vulnerabilities
      const vulnerabilities = dataResponse.data.vulnerabilities ? 
        dataResponse.data.vulnerabilities.map((vuln: any) => ({
          ...vuln,
          severity: vuln.niveauGravite
        })) : [];
      
      return {
        id: dataResponse.data.id || scanId,
        targetUrl: dataResponse.data.scanResult?.targetUrl || "",
        reportHtml: htmlResponse.data,
        vulnerabilities: vulnerabilities,
        scanDate: dataResponse.data.dateGeneration || new Date().toISOString(),
        progress: 100,
        severity: dataResponse.data.niveauGravite
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
