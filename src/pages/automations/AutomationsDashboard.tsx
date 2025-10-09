import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileSpreadsheet, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAutomationStats } from '@/services/automationService';

const AutomationsDashboard: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['automation-stats'],
    queryFn: getAutomationStats,
    staleTime: 5 * 60 * 1000,
  });

  const formatNumber = (num: number) => new Intl.NumberFormat('es-ES').format(num);

  const items = [
    {
      icon: FileSpreadsheet,
      colorBox: 'bg-niawi-primary/20',
      colorIcon: 'text-niawi-primary',
      label: 'Total Procesos',
      value: isLoading ? '...' : formatNumber(stats?.totalProcesses || 0),
    },
    {
      icon: CheckCircle,
      colorBox: 'bg-niawi-accent/20',
      colorIcon: 'text-niawi-accent',
      label: 'Exitosos',
      value: isLoading ? '...' : formatNumber(stats?.successfulProcesses || 0),
    },
    {
      icon: XCircle,
      colorBox: 'bg-niawi-danger/20',
      colorIcon: 'text-niawi-danger',
      label: 'Fallidos',
      value: isLoading ? '...' : formatNumber(stats?.failedProcesses || 0),
    },
    {
      icon: Clock,
      colorBox: 'bg-niawi-warning/20',
      colorIcon: 'text-niawi-warning',
      label: 'Pendientes',
      value: isLoading ? '...' : formatNumber(stats?.pendingProcesses || 0),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {items.map((item, idx) => (
        <Card key={idx} className="bg-niawi-surface border-niawi-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${item.colorBox} flex items-center justify-center`}>
                <item.icon className={`w-5 h-5 ${item.colorIcon}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{item.value}</p>
                <p className="text-sm text-muted-foreground">{item.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AutomationsDashboard;


