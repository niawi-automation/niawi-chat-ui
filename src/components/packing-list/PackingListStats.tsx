import React from 'react';
import { PackingListStats as PackingListStatsType, SheetsAnalysis, PackingDataMeta } from '@/types/automations';
import { ProcessingStatusAlert } from './ProcessingStatusAlert';
import { StatsOverview } from './StatsOverview';
import { SheetDetailsAccordion } from './SheetDetailsAccordion';

interface PackingListStatsProps {
  stats: PackingListStatsType;
  sheetsAnalysis: SheetsAnalysis;
  meta: PackingDataMeta;
}

export const PackingListStats: React.FC<PackingListStatsProps> = ({
  stats,
  sheetsAnalysis,
  meta,
}) => {
  return (
    <div className="space-y-6 mt-6">
      {/* Alertas Críticas (Condicionales) */}
      <ProcessingStatusAlert stats={stats} sheetsAnalysis={sheetsAnalysis} />

      {/* Resumen Global */}
      <StatsOverview stats={stats} sheetsAnalysis={sheetsAnalysis} />

      {/* Detalle por Hoja (incluye totales) */}
      <SheetDetailsAccordion sheetsAnalysis={sheetsAnalysis} stats={stats} />

      {/* Metadata Footer (opcional - para debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-muted-foreground text-center py-2">
          Procesado: {new Date(meta.processedAt).toLocaleString()} | Packs: {meta.packsCount}
        </div>
      )}
    </div>
  );
};
