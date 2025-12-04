import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Package, Box, CheckCircle2, Tag } from 'lucide-react';
import { PackingListStats, SheetsAnalysis } from '@/types/automations';

interface StatsOverviewProps {
  stats: PackingListStats;
  sheetsAnalysis: SheetsAnalysis;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, sheetsAnalysis }) => {
  const processingRateColor =
    sheetsAnalysis.processingRate === 100
      ? 'text-green-600'
      : sheetsAnalysis.processingRate >= 80
      ? 'text-amber-600'
      : 'text-red-600';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen Global</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Grid de Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Total Unidades */}
          <div className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <Package className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" />
            <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              {stats.grandTotalUnits.toLocaleString()}
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Unidades
            </p>
          </div>

          {/* Total Cartones */}
          <div className="flex flex-col items-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
            <Box className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-2" />
            <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
              {stats.totalCartonsQty.toLocaleString()}
            </p>
            <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
              Cartones
            </p>
          </div>

          {/* Tasa de Procesamiento */}
          <div className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <CheckCircle2 className={`h-8 w-8 ${processingRateColor} mb-2`} />
            <p className={`text-3xl font-bold ${processingRateColor}`}>
              {sheetsAnalysis.processingRate.toFixed(0)}%
            </p>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Procesado
            </p>
          </div>

          {/* Styles y DCs */}
          <div className="flex flex-col items-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
            <Tag className="h-8 w-8 text-orange-600 dark:text-orange-400 mb-2" />
            <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
              {stats.uniqueStyles.length}
            </p>
            <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
              Style{stats.uniqueStyles.length > 1 ? 's' : ''}
            </p>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              {stats.uniqueDCs.length} DC{stats.uniqueDCs.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Detalles Textuales */}
        <div className="border-t pt-4 space-y-2 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <span className="font-medium">Buyer PO:</span>{' '}
              <span className="font-mono text-muted-foreground">
                {stats.buyerPONumber}
              </span>
            </div>
            <div>
              <span className="font-medium">Style:</span>{' '}
              <span className="font-mono text-muted-foreground">
                {stats.globalStyle || stats.uniqueStyles.join(', ')}
              </span>
            </div>
            <div>
              <span className="font-medium">DC Principal:</span>{' '}
              <span className="font-mono text-muted-foreground">
                {stats.globalDC || stats.uniqueDCs[0]}
              </span>
            </div>
            <div>
              <span className="font-medium">Color(es):</span>{' '}
              <span className="text-muted-foreground">
                {stats.uniqueColors.join(', ')}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
