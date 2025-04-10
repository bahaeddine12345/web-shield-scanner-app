import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Type definitions
interface StatsData {
  scanCount: number;
  vulnerabilitiesBySeverity: {
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  vulnerabilitiesByType: Array<{
    type: string;
    count: number;
  }>;
  scansByMonth: Array<{
    month: string;
    count: number;
  }>;
}

const API_URL = 'http://localhost:4200/api';

const Stats = () => {
  // Fetch stats data
  const { data, isLoading, error } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/scan/stats`);
      return response.data as StatsData;
    },
    // Keep data fresh for 5 minutes
    staleTime: 5 * 60 * 1000,
  });
  
  // Colors for charts
  const SEVERITY_COLORS = ['#ef4444', '#f59e0b', '#0ea5e9', '#94a3b8'];
  const CHART_COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];
  
  // Prepare data for severity pie chart
  const severityData = data ? [
    { name: 'Critiques', value: data.vulnerabilitiesBySeverity.high },
    { name: 'Moyennes', value: data.vulnerabilitiesBySeverity.medium },
    { name: 'Faibles', value: data.vulnerabilitiesBySeverity.low },
    { name: 'Informations', value: data.vulnerabilitiesBySeverity.info },
  ] : [];
  
  // Custom tooltip for recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover text-popover-foreground p-3 border border-border rounded-md shadow-md">
          <p className="font-medium">{`${label}`}</p>
          <p className="text-sm">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>
          Une erreur est survenue lors du chargement des statistiques.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Statistiques</h1>
        <p className="text-muted-foreground">
          Aperçu des analyses et des vulnérabilités détectées.
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Nombre total de scans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data?.scanCount || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Vulnérabilités critiques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-danger">
                  {data?.vulnerabilitiesBySeverity.high || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total des vulnérabilités
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {data ? data.vulnerabilitiesBySeverity.high + 
                    data.vulnerabilitiesBySeverity.medium + 
                    data.vulnerabilitiesBySeverity.low + 
                    data.vulnerabilitiesBySeverity.info : 0}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Scans par mois</CardTitle>
                <CardDescription>
                  Evolution du nombre de scans au fil du temps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {data?.scansByMonth && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={data.scansByMonth} 
                        margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="month" 
                          tick={{ fontSize: 12 }} 
                          tickLine={false}
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }} 
                          tickLine={false} 
                          axisLine={false}
                          tickFormatter={(value) => value.toFixed(0)}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" name="Scans" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Répartition par sévérité</CardTitle>
                <CardDescription>
                  Distribution des vulnérabilités par niveau de sévérité
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {data?.vulnerabilitiesBySeverity && (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={severityData}
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {severityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[index % SEVERITY_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend layout="vertical" align="right" verticalAlign="middle" />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Vulnérabilités par type</CardTitle>
                <CardDescription>
                  Répartition des vulnérabilités par catégorie
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  {data?.vulnerabilitiesByType && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.vulnerabilitiesByType}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 150, bottom: 20 }}
                      >
                        <CartesianGrid horizontal strokeDasharray="3 3" />
                        <XAxis type="number" tick={{ fontSize: 12 }} />
                        <YAxis 
                          type="category" 
                          dataKey="type" 
                          tick={{ fontSize: 12 }} 
                          width={140}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar 
                          dataKey="count" 
                          name="Instances" 
                          fill="#0ea5e9" 
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default Stats;
