
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:4200/api';

export type SeverityLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type ScanStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

export interface Scan {
  id: string;
  url: string;
  status: ScanStatus;
  progress: number;
  createdAt: string;
  userId: string;
  severityScore?: number;
  vulnerabilitiesCount?: {
    high: number;
    medium: number;
    low: number;
    info: number;
  };
}

export interface ScanResult {
  id: string;
  scanId: string;
  reportHtml: string;
  vulnerabilities: {
    id: string;
    name: string;
    description: string;
    severity: SeverityLevel;
    remediation: string;
  }[];
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
      return response.data.scanId;
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
      const response = await axios.get(`${API_URL}/scan/user`);
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
      const response = await axios.get(`${API_URL}/rapports/${scanId}`);
      return response.data;
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
      link.setAttribute('download', `scan-report-${scanId}.pdf`);
      
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
  
  return {
    isLoading,
    error,
    startScan,
    getScan,
    getUserScans,
    getScanResult,
    downloadScanReport,
  };
};
