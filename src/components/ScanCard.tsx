
import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Scan } from '@/hooks/useScan';
import { ExternalLink, FileText } from 'lucide-react';

interface ScanCardProps {
  scan: Scan;
}

const ScanCard: React.FC<ScanCardProps> = ({ scan }) => {
  // Format the scan creation date
  const formattedDate = format(new Date(scan.dateSoumission), "d MMMM yyyy 'à' HH:mm", { locale: fr });
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-lg break-all">{scan.url}</h3>
              <Badge
                variant="outline"
                className={
                  scan.statutAnalyse === 'TERMINE'
                    ? 'bg-success/10 text-success border-success/20'
                    : scan.statutAnalyse === 'ECHEC'
                    ? 'bg-danger/10 text-danger border-danger/20'
                    : 'bg-warning/10 text-warning border-warning/20'
                }
              >
                {scan.statutAnalyse === 'TERMINE'
                  ? 'Terminé'
                  : scan.statutAnalyse === 'ECHEC'
                  ? 'Échoué'
                  : scan.statutAnalyse === 'EN_COURS'
                  ? 'En cours'
                  : 'En attente'}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground">Créé le {formattedDate}</p>
            
            {scan.statutAnalyse === 'EN_COURS' && (
              <div className="flex items-center gap-2 mt-2">
                <div className="w-36 h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary" 
                    style={{ width: `${scan.progress || 0}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{scan.progress || 0}%</span>
              </div>
            )}
            
            {scan.statutAnalyse === 'TERMINE' && scan.vulnerabilitiesCount && (
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary" className="bg-danger/10 text-danger border-danger/20">
                  {scan.vulnerabilitiesCount.high || 0} critique
                </Badge>
                <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
                  {scan.vulnerabilitiesCount.medium || 0} moyenne
                </Badge>
                <Badge variant="secondary" className="bg-info/10 text-info border-info/20">
                  {scan.vulnerabilitiesCount.low || 0} faible
                </Badge>
                <Badge variant="secondary" className="bg-secondary text-muted-foreground">
                  {scan.vulnerabilitiesCount.info || 0} info
                </Badge>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 self-end">
            <a href={scan.url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Visiter</span>
              </Button>
            </a>
            
            {scan.statutAnalyse === 'EN_COURS' ? (
              <Link to={`/scan/${scan.id}`}>
                <Button size="sm">
                  Voir progression
                </Button>
              </Link>
            ) : scan.statutAnalyse === 'TERMINE' ? (
              <Link to={`/report/${scan.id}`}>
                <Button size="sm">
                  <FileText className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Rapport</span>
                </Button>
              </Link>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScanCard;
