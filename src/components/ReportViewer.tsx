
import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { useScan } from '@/hooks/useScan';
import { toast } from 'sonner';

interface ReportViewerProps {
  html: string;
  scanId?: string;
}

const ReportViewer: React.FC<ReportViewerProps> = ({ html, scanId }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const { downloadScanReport } = useScan();
  
  const handleDownloadPDF = async () => {
    if (!scanId) {
      toast.error('ID du scan non disponible');
      return;
    }
    
    try {
      await downloadScanReport(scanId);
    } catch (error) {
      toast.error('Erreur lors du téléchargement du rapport');
      console.error('Download error:', error);
    }
  };
  
  const zoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 2));
  const zoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  const resetZoom = () => setZoomLevel(1);
  
  const sanitizedHtml = DOMPurify.sanitize(html);
  
  return (
    <Card className="overflow-hidden">
      <div className="bg-muted p-2 flex justify-between items-center border-b">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={zoomIn}>
            <ZoomIn size={16} />
          </Button>
          <Button variant="outline" size="sm" onClick={zoomOut}>
            <ZoomOut size={16} />
          </Button>
          <Button variant="outline" size="sm" onClick={resetZoom}>
            <RotateCw size={16} />
          </Button>
          <span className="text-sm">{Math.round(zoomLevel * 100)}%</span>
        </div>
        
        {scanId && (
          <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="flex items-center gap-1">
            <Download size={16} />
            <span className="hidden sm:inline">Télécharger PDF</span>
          </Button>
        )}
      </div>
      
      <CardContent className="p-0">
        <div 
          className="overflow-auto max-h-[600px] p-4"
          style={{ 
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top left',
            width: `${100 / zoomLevel}%` 
          }}
        >
          <div 
            className="report-content"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }} 
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportViewer;
